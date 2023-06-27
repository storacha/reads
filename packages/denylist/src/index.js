/* eslint-env serviceworker */

import { Router } from 'itty-router'

import { denylistGet, denylistPost } from './denylist.js'
import { versionGet } from './version.js'

import { addCorsHeaders, withCorsHeaders } from './cors.js'
import { withCdnCache } from './cache.js'
import { errorHandler } from './error-handler.js'
import { envAll } from './env.js'

const router = Router()

// https://developer.mozilla.org/en-US/docs/Web/API/FetchEvent
/** @typedef {ExecutionContext} Ctx */

router
  .all('*', envAll)
  .get('/version', withCorsHeaders(versionGet))
  .get('/:cid', withCdnCache(withCorsHeaders(denylistGet)))
  .post('/', withCorsHeaders(denylistPost))

/**
 * @param {Error} error
 * @param {Request} request
 * @param {import('./env').Env} env
 */
function serverError (error, request, env) {
  return addCorsHeaders(request, errorHandler(error, env))
}

export default {
  /**
   *
   * @param {Request} request
   * @param {import("./bindings").Env} env
   * @param {Ctx} ctx
   */
  async fetch (request, env, ctx) {
    // Needs request cloned to avoid worker bindings to have request mutated on follow up requests
    const req = request.clone()
    try {
      const res = await router.handle(req, env, ctx)
      return res
    } catch (/** @type {any} */ error) {
      return serverError(error, req, env)
    }
  }
}
