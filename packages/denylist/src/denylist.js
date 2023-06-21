/* eslint-env serviceworker, browser */

import { normalizeCid } from './utils/cid'
import { getFromDenyList } from './utils/denylist'
import { JSONResponse } from '@web3-storage/worker-utils/response'

/** Time in seconds to cache the response when it IS NOT on the deny list */
const CACHE_TIME_RESOURCE_ALLOWED = 120 // 1 hour
/** Time in seconds to cache the response when it IS on the deny list */
const CACHE_TIME_RESOURCE_DENIED = 60 * 60 * 24 // 1 day (we don't usually un-deny)

/**
 * Returns badbits denylist results.
 * @param {import('itty-router').Request} request
 * @param {import('./env').Env} env
 */
export const denylistGet = async function (request, env) {
  const cid = request?.params?.cid

  if (!cid) {
    return new Response('cid is a required path param', { status: 400 })
  }

  try {
    await normalizeCid(cid)
  } catch (e) {
    return new Response('cid path param is invalid', { status: 400 })
  }

  const denyListResource = await getFromDenyList(cid, env)

  if (denyListResource) {
    try {
      const response = new JSONResponse(JSON.parse(denyListResource), {
        status: 200,
        headers: { 'Cache-Control': `max-age=${CACHE_TIME_RESOURCE_DENIED}` }
      })
      return response
    } catch (e) {
      env.log.log(`ERROR WHILE PARSING DENYLIST FOR CID "${cid}" ${e}`, 'error')
    }
  }

  const response = new Response('Not Found', {
    status: 404,
    headers: { 'Cache-Control': `max-age=${CACHE_TIME_RESOURCE_ALLOWED}` }
  })
  return response
}

/**
 * Batch denylist check. POST an Array of cid strings.
 * Returns the subset of the Array that are on the deny list.
 * @param {import('itty-router').Request} request
 * @param {import('./env').Env} env
 */
export async function denylistPost (request, env) {
  if (!request.json) {
    return new Response('Unsupported Media Type', { status: 415 })
  }

  let checklist
  try {
    checklist = await request.json()
  } catch (err) {
    return new Response('Invalid JSON', { status: 400, statusText: 'Bad Request' })
  }

  if (!Array.isArray(checklist)) {
    return new Response('Expected an array', { status: 400, statusText: 'Bad Request' })
  }

  if (checklist.length > 1000) {
    return new Response('Too many items. Max 1000', { status: 400, statusText: 'Bad Request' })
  }

  const body = []
  for (const item of checklist) {
    const res = await getFromDenyList(item, env)
    if (res) {
      body.push(item)
    }
  }

  return new JSONResponse(body)
}
