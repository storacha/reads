import anySignal from 'any-signal'
import pAny, { AggregateError } from 'p-any'
import { FilterError } from 'p-some'
import pSettle from 'p-settle'
import fetch, { Headers } from '@web-std/fetch'

import { NotFoundError, TimeoutError } from './errors.js'
import {
  TIMEOUT_CODE,
  ABORT_CODE,
  DEFAULT_REQUEST_TIMEOUT,
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
  constructor(ipfsGateways, options = {}) {
    this.ipfsGateways = ipfsGateways
    this.timeout = options.timeout || DEFAULT_REQUEST_TIMEOUT
  }

  /**
   * @param {string} cid
   * @param {IpfsGatewayRaceGetOptions} [options]
   * @return {Promise<Response>}
   */
  async get(
    cid,
    {
      pathname = '',
      headers = new Headers(),
      noAbortRequestsOnWinner = false,
      onRaceEnd = nop,
    } = {}
  ) {
    const raceWinnerController = new AbortController()
    /** @type {GatewayResponsePromise[]} */
    const gatewayResponsePromises = this.ipfsGateways.map((gwUrl) =>
      gatewayFetch(gwUrl, cid, pathname, {
        headers,
        timeout: this.timeout,
        signal: raceWinnerController.signal,
      })
    )

    /** @type {GatewayResponse | undefined} */
    let winnerGwResponse
    try {
      winnerGwResponse = await pAny(gatewayResponsePromises, {
        // @ts-ignore 'response' does not exist on type 'GatewayResponseFailure'
        filter: (res) => res.response?.ok,
      })

      // Abort race contestants once race has a winner
      if (!noAbortRequestsOnWinner) {
        raceWinnerController.abort()
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
        const candidateResponse = responses.find((r) => r.value?.response)

        // Return first response with upstream error
        if (candidateResponse?.value?.response) {
          return candidateResponse.value.response
        }

        // Gateway timeout
        if (
          responses[0].value?.aborted &&
          responses[0].value?.reason === TIMEOUT_CODE
        ) {
          throw new TimeoutError()
        }
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
export function createGatewayRacer(ipfsGateways, options = {}) {
  return new IpfsGatewayRacer(ipfsGateways, {
    timeout: options.timeout || DEFAULT_REQUEST_TIMEOUT,
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
 * @param {number} [options.timeout]
 * @param {AbortSignal} [options.signal]
 */
async function gatewayFetch(
  gwUrl,
  cid,
  pathname,
  { headers, timeout = 60000, signal } = {}
) {
  const timeoutController = new AbortController()
  const timer = setTimeout(() => timeoutController.abort(), timeout)

  let response
  try {
    response = await fetch(new URL(`ipfs/${cid}${pathname}`, gwUrl), {
      // Combine timeout signal with done signal
      signal: signal
        ? anySignal([timeoutController.signal, signal])
        : timeoutController.signal,
      headers,
    })
  } catch (error) {
    if (timeoutController.signal.aborted) {
      return {
        url: gwUrl,
        aborted: true,
        reason: TIMEOUT_CODE,
      }
    } else if (signal?.aborted) {
      return {
        url: gwUrl,
        aborted: true,
        reason: ABORT_CODE,
      }
    }
    throw error
  } finally {
    clearTimeout(timer)
  }

  /** @type {GatewayResponse} */
  const gwResponse = {
    response,
    url: gwUrl,
  }
  return gwResponse
}
