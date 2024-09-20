/* eslint-env browser */
import anySignal from 'any-signal'
import pAny, { AggregateError } from 'p-any'
import { FilterError } from 'p-some'
import pSettle from 'p-settle'
import fetch, { Headers } from '@web-std/fetch'

import {
  NotFoundError,
  GatewayTimeoutError,
  BadGatewayError
} from './errors.js'
import {
  TIMEOUT_CODE,
  ABORT_CODE,
  DEFAULT_REQUEST_TIMEOUT
} from './constants.js'

const nop = () => {}

/**
 * @typedef {import('../types').IpfsGatewayRacerOptions} IpfsGatewayRacerOptions
 * @typedef {import('../types').IpfsGatewayRaceGetOptions} IpfsGatewayRaceGetOptions
 * @typedef {import('../types').GatewayResponse} GatewayResponse
 * @typedef {import('../types').GatewayResponsePromise} GatewayResponsePromise
 * @typedef {import('../types').GatewayResponseFailure} GatewayResponseFailure
 * @typedef {import('p-reflect').PromiseFulfilledResult<GatewayResponseFailure>} PromiseResultGatewayResponseFailure
 */

export class IpfsGatewayRacer {
  /**
   * @param {string[]} ipfsGateways
   * @param {IpfsGatewayRacerOptions} [options]
   */
  constructor (ipfsGateways, options = {}) {
    this.ipfsGateways = ipfsGateways
    this.timeout = options.timeout || DEFAULT_REQUEST_TIMEOUT
  }

  /**
   * @param {string} cid
   * @param {IpfsGatewayRaceGetOptions} [options]
   * @return {Promise<Response>}
   */
  async get (cid, options = {}) {
    const pathname = options.pathname || ''
    const search = options.search || ''
    const headers = options.headers || new Headers()
    const noAbortRequestsOnWinner = Boolean(options.noAbortRequestsOnWinner)
    const onRaceEnd = options.onRaceEnd || nop
    const gatewaySignals = options.gatewaySignals || {}
    const raceControllers = Object.fromEntries(this.ipfsGateways.map(gwUrl => [gwUrl, new AbortController()]))
    /** @type {GatewayResponsePromise[]} */
    const gatewayResponsePromises = this.ipfsGateways.map((gwUrl) =>
      gatewayFetch(gwUrl, cid, pathname, {
        headers,
        search,
        timeout: this.timeout,
        // Combine internal race winner controller signal with custom user signal
        signal: gatewaySignals[gwUrl]
          ? anySignal([raceControllers[gwUrl].signal, gatewaySignals[gwUrl]])
          : raceControllers[gwUrl].signal
      })
    )

    /** @type {GatewayResponse | undefined} */
    let winnerGwResponse
    try {
      winnerGwResponse = await pAny(gatewayResponsePromises, {
        // @ts-ignore 'response' does not exist on type 'GatewayResponseFailure'
        filter: (res) => res.response?.ok || res.response?.status === 304
      })

      // Abort race contestants once race has a winner
      if (!noAbortRequestsOnWinner) {
        for (const [url, controller] of Object.entries(raceControllers)) {
          // do not abort the winner though...
          if (url !== winnerGwResponse.url) {
            controller.abort()
          }
        }
      }

      // We should always have a response for winner gateway
      // but typescript believes that might not be the case...
      if (!winnerGwResponse.response) {
        throw new NotFoundError()
      }

      // forward winner gateway response
      return winnerGwResponse.response
    } catch (err) {
      /** @type {PromiseResultGatewayResponseFailure[]} */
      // @ts-ignore Always failure given p-any throws
      const responses = await pSettle(gatewayResponsePromises)

      // Return the error response from gateway, error is not from nft.storage Gateway
      // @ts-ignore FilterError lacks proper types
      if (err instanceof FilterError || err instanceof AggregateError) {
        if (responses.every(r => r.value?.aborted && r.value?.reason === TIMEOUT_CODE)) {
          throw new GatewayTimeoutError()
        }
        throw new BadGatewayError()
      }

      throw err
    } finally {
      // Provide race data upstream
      onRaceEnd(gatewayResponsePromises, winnerGwResponse)
    }
  }
}

/**
 * Create a gateway racer instance.
 *
 * @param {string[]} ipfsGateways
 * @param {IpfsGatewayRacerOptions} [options]
 * @returns
 */
export function createGatewayRacer (ipfsGateways, options = {}) {
  return new IpfsGatewayRacer(ipfsGateways, {
    timeout: options.timeout || DEFAULT_REQUEST_TIMEOUT
  })
}

/**
 * Fetches given CID from given IPFS gateway URL.
 *
 * @param {string} gwUrl
 * @param {string} cid
 * @param {string} pathname
 * @param {Object} [options]
 * @param {Headers} [options.headers]
 * @param {string} [options.search]
 * @param {number} [options.timeout]
 * @param {AbortSignal} [options.signal]
 */
export async function gatewayFetch (
  gwUrl,
  cid,
  pathname,
  options = {}
) {
  const { headers, signal } = options
  const timeout = options.timeout || 60000
  const search = options.search || ''
  const timeoutController = new AbortController()
  const timer = setTimeout(() => timeoutController.abort(), timeout)

  let response
  try {
    response = await fetch(new URL(`ipfs/${cid}${pathname}${search}`, gwUrl), {
      // Combine timeout signal with done signal
      signal: signal
        ? anySignal([timeoutController.signal, signal])
        : timeoutController.signal,
      headers
    })
  } catch (error) {
    if (timeoutController.signal.aborted) {
      return {
        url: gwUrl,
        aborted: true,
        reason: TIMEOUT_CODE
      }
    } else if (signal?.aborted) {
      return {
        url: gwUrl,
        aborted: true,
        reason: ABORT_CODE
      }
    }
    throw error
  } finally {
    clearTimeout(timer)
  }

  /** @type {GatewayResponse} */
  const gwResponse = {
    response,
    url: gwUrl
  }
  return gwResponse
}
