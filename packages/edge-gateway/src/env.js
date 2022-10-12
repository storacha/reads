/* global BRANCH, VERSION, COMMITHASH, SENTRY_RELEASE */
import Toucan from 'toucan-js'

import { Logging } from '@web3-storage/worker-utils/loki'
import { createGatewayRacer } from 'ipfs-gateway-race'

import pkg from '../package.json'
import {
  DEFAULT_RACE_L1_GATEWAYS,
  DEFAULT_RACE_L2_GATEWAYS
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
  env.IPFS_GATEWAY_HOSTNAME = env.GATEWAY_HOSTNAME
  env.IPNS_GATEWAY_HOSTNAME = env.GATEWAY_HOSTNAME.replace('ipfs', 'ipns')

  // These values are replaced at build time by esbuild `define`
  env.BRANCH = BRANCH
  env.VERSION = VERSION
  env.COMMITHASH = COMMITHASH
  env.SENTRY_RELEASE = SENTRY_RELEASE

  addGatewayRacersToEnv(env)
  env.sentry = getSentry(request, env, ctx)
  env.startTime = Date.now()

  env.isCidVerifierEnabled = env.CID_VERIFIER_ENABLED === 'true'

  env.log = new Logging(request, ctx, {
    // @ts-ignore TODO: url should be optional together with token
    url: env.LOKI_URL,
    token: env.LOKI_TOKEN,
    debug: Boolean(env.DEBUG),
    version: env.VERSION,
    commit: env.COMMITHASH,
    branch: env.BRANCH,
    worker: 'edge-gateway',
    env: env.ENV,
    sentry: env.sentry
  })
  env.log.time('request')
}

/**
 * @param {Env} env
 */
function addGatewayRacersToEnv (env) {
  /**
   * @param {string} input
   */
  function parseGatewayUrls (input) {
    const list = JSON.parse(input)
    // Validate is array and has URLs
    if (!Array.isArray(list)) {
      throw new Error('invalid gateways list environment variable')
    }
    list.forEach(gwUrl => new URL(gwUrl))
    return list
  }

  // Set Layer 1
  let l1Gateways
  try {
    l1Gateways = parseGatewayUrls(env.IPFS_GATEWAYS_RACE_L1)
  } catch (_) {
    env.log && env.log.warn(`Invalid JSON string with race L1 Gateways: ${env.IPFS_GATEWAYS_RACE_L1}`)
    l1Gateways = DEFAULT_RACE_L1_GATEWAYS
  }
  env.ipfsGatewaysL1 = l1Gateways
  env.gwRacerL1 = createGatewayRacer(l1Gateways, {
    timeout: env.REQUEST_TIMEOUT
  })

  // Set Layer 2
  let l2Gateways
  try {
    l2Gateways = parseGatewayUrls(env.IPFS_GATEWAYS_RACE_L2)
  } catch (_) {
    env.log && env.log.warn(`Invalid JSON string with race L2 Gateways: ${env.IPFS_GATEWAYS_RACE_L2}`)
    l2Gateways = DEFAULT_RACE_L2_GATEWAYS
  }
  env.ipfsGatewaysL2 = l2Gateways
  env.gwRacerL2 = createGatewayRacer(l2Gateways, {
    timeout: env.REQUEST_TIMEOUT
  })
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
    allowedHeaders: ['user-agent'],
    allowedSearchParams: /(.*)/,
    debug: false,
    environment: env.ENV || 'dev',
    rewriteFrames: {
      // sourcemaps only work if stack filepath are absolute like `/worker.js`
      root: '/'
    },
    release: env.SENTRY_RELEASE,
    pkg
  })
}
