/* global BRANCH, VERSION, COMMITHASH, SENTRY_RELEASE */
import { Toucan, RewriteFrames } from 'toucan-js'

import { createGatewayRacer } from 'ipfs-gateway-race'

import {
  DEFAULT_RACE_L1_GATEWAYS,
  DEFAULT_RACE_L2_GATEWAYS,
  DEFAULT_CDN_GATEWAYS
} from './constants.js'

/**
 * @typedef {import('./bindings').Env} Env
 * @typedef {import('.').Ctx} Ctx
 */

/**
 * @param {Request} request
 * @param {Env} env
 * @param {Ctx} ctx
 */
export function envAll (request, env, ctx) {
  env.REQUEST_TIMEOUT = env.REQUEST_TIMEOUT || 20000
  env.CDN_REQUEST_TIMEOUT = env.CDN_REQUEST_TIMEOUT || 60000
  env.IPFS_GATEWAY_HOSTNAME = env.GATEWAY_HOSTNAME
  env.IPNS_GATEWAY_HOSTNAME = env.GATEWAY_HOSTNAME.replace('ipfs', 'ipns')

  // These values are replaced at build time by esbuild `define`
  env.BRANCH = BRANCH
  env.VERSION = VERSION
  env.COMMITHASH = COMMITHASH
  env.SENTRY_RELEASE = SENTRY_RELEASE

  env.sentry = getSentry(request, env, ctx)

  // Set CDN Gateways
  env.cdnGateways = parseGatewayUrls(env.CDN_GATEWAYS_RACE, DEFAULT_CDN_GATEWAYS, env)

  // Set public IPFS gateway redirect URL if configured
  env.ipfsGatewayRedirectHostname = env.IPFS_GATEWAY_REDIRECT_HOSTNAME

  // Set Layer 1 racer
  env.ipfsGatewaysL1 = parseGatewayUrls(env.IPFS_GATEWAYS_RACE_L1, DEFAULT_RACE_L1_GATEWAYS, env)
  env.gwRacerL1 = createGatewayRacer(env.ipfsGatewaysL1, {
    timeout: env.REQUEST_TIMEOUT
  })

  // Set Layer 2 racer
  env.ipfsGatewaysL2 = parseGatewayUrls(env.IPFS_GATEWAYS_RACE_L2, DEFAULT_RACE_L2_GATEWAYS, env)
  env.gwRacerL2 = createGatewayRacer(env.ipfsGatewaysL2, {
    timeout: env.REQUEST_TIMEOUT
  })

  env.startTime = Date.now()

  env.isCidVerifierEnabled = env.CID_VERIFIER_ENABLED === 'true'
  env.isPermaCacheEnabled = env.PERMA_CACHE_ENABLED === 'true'
}

/**
 * @param {string} input
 * @param {string[]} defaultValue
 * @param {Env} env
 */
function parseGatewayUrls (input, defaultValue, env) {
  let list
  try {
    list = JSON.parse(input)
    // Validate is array and has URLs
    if (!Array.isArray(list)) {
      throw new Error('invalid gateways list environment variable')
    }
    list.forEach(gwUrl => new URL(gwUrl))
  } catch (err) {
    console.warn(`Invalid JSON string with race Gateways: ${input}`)
    list = defaultValue
  }

  return list
}

/**
 * Get sentry instance if configured
 *
 * @param {Request} request
 * @param {Env} env
 * @param {Ctx} ctx
 */
function getSentry (request, env, ctx) {
  if (!env.SENTRY_DSN) {
    return
  }

  return new Toucan({
    request,
    dsn: env.SENTRY_DSN,
    context: ctx,
    requestDataOptions: {
      allowedHeaders: ['user-agent'],
      allowedSearchParams: /(.*)/
    },
    integrations: [new RewriteFrames({ root: '/' })],
    debug: false,
    environment: env.ENV || 'dev',
    release: env.SENTRY_RELEASE
  })
}
