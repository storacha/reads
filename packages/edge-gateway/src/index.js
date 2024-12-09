/* eslint-env serviceworker */

import { Router } from 'itty-router'

import { gatewayGet } from './gateway.js'
import { versionGet } from './version.js'

import { addCorsHeaders, withCorsHeaders } from './cors.js'
import { errorHandler } from './error-handler.js'
import { envAll } from './env.js'

// https://developer.mozilla.org/en-US/docs/Web/API/FetchEvent
/** @typedef {ExecutionContext} Ctx */

const router = Router()

router
  .all('*', envAll)
  .post('*', withCorsHeaders(proxyPostRequest))
  .get('/version', withCorsHeaders(versionGet))
  .get('*', withCorsHeaders(gatewayGet))
  .head('*', withCorsHeaders(gatewayGet))

/**
 * @param {Error} error
 * @param {Request} request
 * @param {import('./env').Env} env
 */
function serverError (error, request, env) {
  return addCorsHeaders(request, errorHandler(error, env))
}

/**
 * Proxy POST requests to the UCANTO Server defined in the environment.
 *
 * @param {Request} request
 * @param {import('./env').Env} env
 * @returns {Promise<Response>}
 */
async function proxyPostRequest (request, env) {
  const originRequest = new Request(request)
  const url = new URL(request.url)
  const targetUrl = `${env.UCANTO_SERVER_URL}${url.pathname}`
  const response = await fetch(targetUrl, originRequest)
  return response
}

export default {
  /**
   *
   * @param {Request} request
   * @param {import("./bindings").Env} env
   * @param {Ctx} ctx
   */
  async fetch (request, env, ctx) {
    try {
      return await router.handle(request, env, ctx)
    } catch (/** @type {any} */ error) {
      return serverError(error, request, env)
    }
  }
}
