/* eslint-env browser */
import anySignal from 'any-signal'
import pAny, { AggregateError } from 'p-any'
import { FilterError } from 'p-some'
import pSettle from 'p-settle'
import fetch, { Headers } from '@web-std/fetch'
import * as UnixFSDownloader from '@storacha/unixfs-dl'

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
import { isAlternateFormatRequest, isRangeRequest } from './request.js'

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
        method: options.method,
        headers,
        search,
        timeout: this.timeout,
        // Combine internal race winner controller signal with custom user signal
        signal: gatewaySignals[gwUrl]
          ? anySignal([raceControllers[gwUrl].signal, gatewaySignals[gwUrl]])
          : raceControllers[gwUrl].signal,
        TransformStream: options.TransformStream
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
 * @param {string} [options.method]
 * @param {Headers} [options.headers]
 * @param {string} [options.search]
 * @param {number} [options.timeout]
 * @param {AbortSignal} [options.signal]
 * @param {typeof TransformStream} [options.TransformStream]
 */
export async function gatewayFetch (
  gwUrl,
  cid,
  pathname,
  options = {}
) {
  const method = options.method || 'GET'
  const headers = options.headers || new Headers()
  const timeout = options.timeout || 60000
  const search = options.search || ''
  const timeoutController = new AbortController()
  const timer = setTimeout(() => timeoutController.abort(), timeout)
  // Combine timeout signal with done signal
  const signal = options.signal
    ? anySignal([timeoutController.signal, options.signal])
    : timeoutController.signal
  const url = new URL(`ipfs/${cid}${pathname}${search}`, gwUrl)

  let response
  try {
    // If this is an atypical request, i.e. it's a HEAD request, a range request
    // or a request for a different format to UnixFS, then just make the request
    // to the upstream as usual.
    if (
      method !== 'GET' ||
      isRangeRequest(headers) ||
      isAlternateFormatRequest(headers, url.searchParams)
    ) {
      response = await fetch(url, { signal, headers })
    } else {
      // Otherwise use the unixfs downloader to make byte range requests
      // upstream allowing big files to be downloaded without exhausting
      // the upstream worker's CPU budget.
      response = await UnixFSDownloader.fetch(url, { signal, TransformStream: options.TransformStream })
    }
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
