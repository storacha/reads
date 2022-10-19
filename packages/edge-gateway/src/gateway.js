/* eslint-env serviceworker, browser */
/* global Response caches */

import pAny, { AggregateError } from 'p-any'
import pDefer from 'p-defer'
import pSettle from 'p-settle'
import { FilterError } from 'p-some'
import { gatewayFetch } from 'ipfs-gateway-race'

import {
  getCidFromSubdomainUrl,
  toDenyListAnchor
} from './utils/cid.js'
import { getHeaders } from './utils/headers.js'
import { getCidForbiddenResponse } from './utils/verification.js'
import {
  CF_CACHE_MAX_OBJECT_SIZE,
  RESOLUTION_LAYERS,
  RESOLUTION_IDENTIFIERS
} from './constants.js'

/**
 * @typedef {import('./env').Env} Env
 * @typedef {'shortcut' | 'cdn' | 'dotstorage-race' | 'public-race-l1' | 'public-race-l2'} ResolutionLayer
 *
 * @typedef {import('ipfs-gateway-race').GatewayResponse} GatewayResponse
 * @typedef {import('ipfs-gateway-race').GatewayResponsePromise} GatewayResponsePromise
 * @typedef {{ value: GatewayResponse & { duration: number} }} GatewayRaceResponses
 *
 * @typedef {Object} ProxiedCDNResponse
 * @property {Response} response
 * @property {string} resolutionIdentifier
 *
 * @typedef {Object} ProxiedLayeredResponse
 * @property {Response} response
 * @property {ResolutionLayer} resolutionLayer
 * @property {string} url
 *
 * @typedef {Object} OptionalCustomHeaders
 * @property {string} [anchor]
 */

/**
 * Handle gateway request.
 *
 * @param {Request} request
 * @param {Env} env
 * @param {import('./index').Ctx} ctx
 */
export async function gatewayGet (request, env, ctx) {
  // Redirect to dweb.link if ipns request
  // TODO: integrate with w3name
  if (request.url.includes(env.IPNS_GATEWAY_HOSTNAME)) {
    return Response.redirect(
      request.url.replace(env.IPNS_GATEWAY_HOSTNAME, 'ipns.dweb.link'),
      302
    )
  }

  const reqUrl = new URL(request.url)
  const cid = await getCidFromSubdomainUrl(reqUrl)
  const pathname = reqUrl.pathname
  const search = reqUrl.search

  // return 304 "not modified" response if user sends us a cid etag in `if-none-match`
  const reqEtag = request.headers.get('if-none-match')
  if (reqEtag && (pathname === '' || pathname === '/')) {
    const etag = `"${cid}"`
    const weakEtag = `W/${etag}`
    if (reqEtag === etag || reqEtag === weakEtag) {
      const res = new Response(null, {
        status: 304,
        headers: new Headers({
          'cache-control': 'public, max-age=29030400, immutable',
          etag
        })
      })
      return getResponseWithCustomHeaders(res, RESOLUTION_LAYERS.SHORTCUT, RESOLUTION_IDENTIFIERS.IF_NONE_MATCH)
    }
  }

  const cidForbiddenResponse = await getCidForbiddenResponse(cid, env)
  if (cidForbiddenResponse) {
    return cidForbiddenResponse
  }

  // 1st layer resolution - CDN
  const cache = caches.default
  const res = await getFromCdn(request, env, cache)
  if (res) {
    return getResponseWithCustomHeaders(
      res.response,
      RESOLUTION_LAYERS.CDN,
      res.resolutionIdentifier
    )
  } else if (
    (request.headers.get('Cache-Control') || '').includes('only-if-cached')
  ) {
    return new Response(null, { status: 412 })
  }

  // 2nd layer
  const dotstorageRes = await getFromDotstorage(request, env, cid, { pathname, search })
  if (dotstorageRes) {
    ctx.waitUntil(putToCache(request, dotstorageRes.response, cache))

    return getResponseWithCustomHeaders(
      dotstorageRes.response,
      RESOLUTION_LAYERS.DOTSTORAGE_RACE,
      dotstorageRes.resolutionIdentifier,
      {
        anchor: await toDenyListAnchor(cid)
      }
    )
  }

  // 3rd layer resolution - Redirect to Public Gateway if set
  if (env.ipfsGatewayRedirectHostname) {
    const url = new URL(
      `https://${cid}.ipfs.${env.ipfsGatewayRedirectHostname}${pathname}${search}`
    )

    return Response.redirect(url.toString(), 307)
  }

  // 4th layer resolution - Public Gateways race
  const {
    response: winnerGwResponse,
    url: winnerUrl,
    resolutionLayer: raceResolutionLayer
  } = await getFromGatewayRacer(cid, pathname, search, getHeaders(request), env, ctx)

  // Validation layer - resource CID
  const resourceCid = pathname !== '/' ? getCidFromEtag(winnerGwResponse.headers.get('etag') || cid) : cid
  if (winnerGwResponse && pathname !== '/' && resourceCid) {
    const resourceCidForbiddenResponse = await getCidForbiddenResponse(resourceCid, env)
    if (resourceCidForbiddenResponse) {
      return resourceCidForbiddenResponse
    }
  }

  // Ask CID verifier to validate HTML content
  if (
    env.isCidVerifierEnabled &&
    winnerGwResponse && winnerGwResponse.headers.get('content-type')?.includes('text/html')
  ) {
    // fire and forget. Let cid-verifier process this cid and url if it needs to
    ctx.waitUntil(
      env.CID_VERIFIER.fetch(`${env.CID_VERIFIER_URL}/${resourceCid}`, { method: 'POST', headers: { Authorization: `basic ${env.CID_VERIFIER_AUTHORIZATION_TOKEN}` } })
    )
  }

  // Cache response
  if (winnerGwResponse && winnerGwResponse.ok) {
    ctx.waitUntil(putToCache(request, winnerGwResponse, cache))
  }

  return getResponseWithCustomHeaders(
    winnerGwResponse,
    raceResolutionLayer,
    winnerUrl,
    {
      anchor: await toDenyListAnchor(resourceCid)
    }
  )
}

/**
 * CDN url resolution.
 *
 * @param {Request} request
 * @param {Env} env
 * @param {Cache} cache
 * @return {Promise<ProxiedCDNResponse | undefined>}
 */
async function getFromCdn (request, env, cache) {
  // Should skip cache if instructed by headers
  if ((request.headers.get('Cache-Control') || '').includes('no-cache')) {
    return undefined
  }

  try {
    const cdnRequests = [
      // Request from cache API
      getFromCacheZone(request, cache),
      // Get from API Perma Cache Binding.
      getFromPermaCache(request, env)
    ]

    // @ts-ignore p-any Promise types differ from CF promise types
    const res = await pAny(cdnRequests, {
      filter: (/** @type {ProxiedCDNResponse} */ res) => !!res
    })
    return res
  } catch (err) {
    // @ts-ignore FilterError bad typings
    if (err instanceof FilterError || err instanceof AggregateError) {
      return undefined
    }
    throw err
  }
}

/**
 * @param {Request} request
 * @param {Env} env
 * @param {string} cid
 * @param {{ pathname?: string, search?: string }} [options]
 * @return {Promise<ProxiedCDNResponse | undefined>}
 */
async function getFromDotstorage (request, env, cid, options = {}) {
  const pathname = options.pathname || ''
  const search = options.search || ''
  try {
    // Get onlyIfCached hosts provided
    /** @type {string[]} */
    const onlyIfCachedHosts = []
    // @ts-ignore custom entry in cf object
    if (request.cf?.onlyIfCachedGateways) {
      /** @type {URL[]} */
      const onlyIfCachedGateways = JSON.parse(
        // @ts-ignore custom entry in cf object
        request.cf?.onlyIfCachedGateways
      ).map((/** @type {string} */ gw) => new URL(gw))

      onlyIfCachedGateways.forEach((gw) => onlyIfCachedHosts.push(gw.host))
    }

    const proxiedCDNResponse = await pAny([
      ...onlyIfCachedHosts.map(async (host) => {
        // Add only if cached header
        const headers = getHeaders(request)
        headers.set('Cache-Control', 'only-if-cached')

        const response = await fetch(`https://${cid}.ipfs.${host}${pathname}${search}`, {
          headers
        })

        if (!response.ok && response.status !== 304) {
          throw new Error()
        }

        return {
          response,
          resolutionIdentifier: host
        }
      }),
      ...env.cdnGateways.map(async (host) => {
        const gwResponse = await gatewayFetch(host, cid, pathname, {
          timeout: env.REQUEST_TIMEOUT,
          headers: request.headers,
          search
        })

        // @ts-ignore 'response' does not exist on type 'GatewayResponseFailure'
        if (!gwResponse?.response.ok && gwResponse?.response.status !== 304) {
          throw new Error()
        }

        return {
          // @ts-ignore 'response' does not exist on type 'GatewayResponseFailure'
          response: gwResponse?.response,
          resolutionIdentifier: host
        }
      })
    ])

    return proxiedCDNResponse
  } catch (_) {}
  return undefined
}

/**
 *
 * @param {string} cid
 * @param {string} pathname
 * @param {string} search
 * @param {Headers} headers
 * @param {Env} env
 * @param {import('./index').Ctx} ctx
 * @return {Promise<ProxiedLayeredResponse>}
 */
async function getFromGatewayRacer (cid, pathname, search, headers, env, ctx) {
  const winnerUrlPromise = pDefer()
  let response
  let layerOneIsWinner = false

  try {
    // Trigger first tier resolution
    const { gatewayControllers, gatewaySignals } = getRaceContestantsControllers(env.ipfsGatewaysL1)
    response = await env.gwRacerL1.get(cid, {
      pathname,
      search,
      headers,
      noAbortRequestsOnWinner: true,
      gatewaySignals,
      onRaceEnd: async (gatewayResponsePromises, winnerGwResponse) => {
        if (winnerGwResponse) {
          layerOneIsWinner = true
          winnerUrlPromise.resolve(winnerGwResponse.url)
          ctx.waitUntil(
            reportRaceResults(env, gatewayResponsePromises, winnerGwResponse.url, gatewayControllers)
          )
        } else {
          ctx.waitUntil(
            reportRaceResults(env, gatewayResponsePromises, undefined, gatewayControllers)
          )
        }
      }
    })
    if (!layerOneIsWinner) {
      throw new Error('no winner in the first race')
    }
  } catch (err) {
    // Trigger second tier resolution
    const { gatewayControllers, gatewaySignals } = getRaceContestantsControllers(env.ipfsGatewaysL2)
    response = await env.gwRacerL2.get(cid, {
      pathname,
      search,
      headers,
      noAbortRequestsOnWinner: true,
      gatewaySignals,
      onRaceEnd: async (gatewayResponsePromises, winnerGwResponse) => {
        winnerUrlPromise.resolve(winnerGwResponse?.url)

        ctx.waitUntil(
          reportRaceResults(env, gatewayResponsePromises, winnerGwResponse?.url, gatewayControllers)
        )
      }
    })
  }

  const url = await winnerUrlPromise.promise

  return {
    response,
    url,
    resolutionLayer: layerOneIsWinner ? RESOLUTION_LAYERS.PUBLIC_RACE_L1 : RESOLUTION_LAYERS.PUBLIC_RACE_L2
  }
}

/**
 * CDN url resolution.
 *
 * @param {Request} request
 * @param {Cache} cache
 * @return {Promise<ProxiedCDNResponse | undefined>}
 */
async function getFromCacheZone (request, cache) {
  const response = await cache.match(request)

  if (!response) {
    return undefined
  }

  return {
    response,
    resolutionIdentifier: RESOLUTION_IDENTIFIERS.CACHE_ZONE
  }
}

/**
 * Get from Perma Cache route.
 *
 * @param {Request} request
 * @param {Env} env
 * @return {Promise<ProxiedCDNResponse | undefined>}
 */
async function getFromPermaCache (request, env) {
  const response = await env.API.fetch(
    `${env.EDGE_GATEWAY_API_URL}/perma-cache/${encodeURIComponent(
      request.url
    )}`,
    {
      headers: request.headers
    }
  )

  if (!response.ok) {
    return undefined
  }

  return {
    response,
    resolutionIdentifier: RESOLUTION_IDENTIFIERS.PERMA_CACHE
  }
}

/**
 * Put receives response to cache.
 *
 * @param {Request} request
 * @param {Response} response
 * @param {Cache} cache
 */
async function putToCache (request, response, cache) {
  const contentLengthMb = Number(response.headers.get('content-length'))

  // Cache request in Cloudflare CDN if smaller than CF_CACHE_MAX_OBJECT_SIZE
  if (contentLengthMb <= CF_CACHE_MAX_OBJECT_SIZE) {
    await cache.put(request, response.clone())
  }
}

/**
 * @param {Response} response
 * @param {ResolutionLayer} resolutionLayer
 * @param {string} resolutionIdentifier
 * @param {OptionalCustomHeaders} [options]
 */
function getResponseWithCustomHeaders (
  response,
  resolutionLayer,
  resolutionIdentifier,
  options = {}
) {
  const clonedResponse = new Response(response.body, response)

  clonedResponse.headers.set('x-dotstorage-resolution-layer', resolutionLayer)
  clonedResponse.headers.set(
    'x-dotstorage-resolution-id',
    resolutionIdentifier
  )

  // Add anchor
  if (options.anchor) {
    clonedResponse.headers.set(
      'x-dotstorage-anchor',
      options.anchor
    )
  }

  return clonedResponse
}

/**
 * Extracting resource CID from etag based on
 * https://github.com/ipfs/specs/blob/main/http-gateways/PATH_GATEWAY.md#etag-response-header
 *
 * @param {string} etag
 */
function getCidFromEtag (etag) {
  let resourceCid = decodeURIComponent(etag)

  // Handle weak etag
  resourceCid = resourceCid.replace('W/', '')
  resourceCid = resourceCid.replaceAll('"', '')

  // Handle directory index generated
  if (etag.includes('DirIndex')) {
    const split = resourceCid.split('-')
    resourceCid = split[split.length - 1]
  }

  return resourceCid
}

/**
 * Async metrics for race.
 *
 * @param {Env} env
 * @param {GatewayResponsePromise[]} gatewayResponsePromises
 * @param {string | undefined} winnerUrl
 * @param {Record<string, AbortController>} gatewayControllers
 */
async function reportRaceResults (env, gatewayResponsePromises, winnerUrl, gatewayControllers) {
  if (!env.PUBLIC_RACE_WINNER) {
    env.log.warn('No bindings for PUBLIC_RACE_WINNER Analytics')
    return
  }

  // Wrap responses with promise to track request duration ttfb
  // Winner immediately resolves
  /** @type {GatewayRaceResponses[]} */
  // @ts-ignore Type 'PromiseRejectedResult' is missing values
  const gwResponses = await pSettle(
    gatewayResponsePromises.map(async (p) => {
      const gwResponse = await p

      return {
        ...gwResponse,
        duration: Date.now() - env.startTime
      }
    })
  )

  if (winnerUrl) {
    // Abort all on going requests except for the winner
    for (const [gatewayUrl, controller] of Object.entries(gatewayControllers)) {
      if (winnerUrl !== gatewayUrl) {
        controller.abort()
      }
    }

    // Count winners
    env.PUBLIC_RACE_WINNER.writeDataPoint({
      blobs: [winnerUrl],
      doubles: [1]
    })
  }

  gwResponses.forEach((gwResponse) => {
    // Track TTFB for success responses
    if (
      gwResponse.value?.response?.status === 200 &&
      gwResponse.value?.duration
    ) {
      env.PUBLIC_RACE_TTFB.writeDataPoint({
        blobs: [gwResponse.value?.url],
        doubles: [gwResponse.value?.duration]
      })
    }

    // Track count for status code per gateway
    if (gwResponse.value?.response?.status && gwResponse.value?.url) {
      env.PUBLIC_RACE_STATUS_CODE.writeDataPoint({
        blobs: [gwResponse.value.url, `${gwResponse.value.response.status}`],
        doubles: [1]
      })
    }
  })
}

/**
 * Gets abortControllers and signals for each race contestant request.
 * @param {string[]} gatewayUrls
 */
function getRaceContestantsControllers (gatewayUrls) {
  /** @type {Record<string, AbortSignal>} */
  const gatewaySignals = {}
  /** @type {Record<string, AbortController>} */
  const gatewayControllers = {}
  gatewayUrls.forEach(gateway => {
    const abortController = new AbortController()
    gatewayControllers[gateway] = abortController
    gatewaySignals[gateway] = abortController.signal
  })

  return {
    gatewayControllers,
    gatewaySignals
  }
}
