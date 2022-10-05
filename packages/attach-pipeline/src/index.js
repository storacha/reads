/* eslint-env serviceworker */

import { Router } from 'itty-router'

import { queuePost } from './handlers.js'
import { versionGet } from './version.js'

import { withAuthToken } from './auth.js'
import { addCorsHeaders, withCorsHeaders } from './cors.js'
import { errorHandler } from './error-handler.js'
import { envAll } from './env.js'
import {
  NoSuccessMd5WriteError
} from './errors.js'

/**
 * https://developer.mozilla.org/en-US/docs/Web/API/FetchEvent 
 * @typedef {{ waitUntil(p: Promise<any>): void }} Ctx
 *
 * @typedef {{ carCid: string, url: string }} CarLocation
 * @typedef {import('./bindings').Env} Env
 * @typedef {import('./bindings').MessageBatch} MessageBatch
 * */

const router = Router()

const auth = {
  '🤲': (/** @type {import("itty-router").RouteHandler<Request>} */ handler) => withCorsHeaders(handler),
  '🔒': (/** @type {import("itty-router").RouteHandler<Request>} */ handler) => withCorsHeaders(withAuthToken(handler))
}

router
  .all('*', envAll)
  .get('/version', auth['🤲'](versionGet))
  .post('/', auth['🔒'](queuePost))

/**
 * @param {Error} error
 * @param {Request} request
 * @param {Env} env
 */
 function serverError (error, request, env) {
  return addCorsHeaders(request, errorHandler(error, env))
}

export default {
  /**
   *
   * @param {Request} request
   * @param {import('./bindings').Env} env
   * @param {Ctx} ctx
   */
  async fetch (request, env, ctx) {
    try {
      const res = await router.handle(request, env, ctx)
      env.log.timeEnd('request')
      return env.log.end(res)
    } catch (/** @type {any} */ error) {
      if (env.log) {
        env.log.timeEnd('request')
        return env.log.end(serverError(error, request, env))
      }
      return serverError(error, request, env)
    }
  },
  /**
   *
   * @param {MessageBatch} batch
   * @param {import('./bindings').Env} env
   */
  async queue(batch, env) {
    /** @type {CarLocation[]} */
    const carsToFetch = batch.messages.map(m => m.body)

    await Promise.all(
      carsToFetch.map(carLocation => runTask(carLocation, env.CARPARK))
    )
  }
}

/**
 * @param {CarLocation} carLocation
 * @param {R2Bucket} carPark
 */
async function runTask (carLocation, carPark) {
  // check R2
  const bucketKey = `${carLocation.carCid}/${carLocation.carCid}.car`

  // TODO: how to handle index file to write?
  const existing = await carPark.head(bucketKey)
  if (existing) {
    return
  }

  const response = await fetch(carLocation.url)
  if (!response.ok) {
    throw new Error(`CAR not found at ${carLocation.url}`)
  }

  // Get md5 hash to use to check the received object’s integrity.
  // https://docs.aws.amazon.com/AmazonS3/latest/API/RESTCommonResponseHeaders.html
  const md5 = response.headers.get('ETag') || undefined

  try {
    await carPark.put(bucketKey, response.body, {
      httpMetadata: response.headers,
      md5: md5 && md5.replaceAll('"', '')
    })
  } catch (/** @type {any} */ err) {
    if (err.message.includes('The Content-MD5 you specified did not match what we received.')) {
      throw new NoSuccessMd5WriteError()
    }
    throw err
  }
}
