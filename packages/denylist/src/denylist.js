/* eslint-env serviceworker, browser */

import { normalizeCid } from './utils/cid'
import { getFromDenyList } from './utils/denylist'
import { JSONResponse } from '@web3-storage/worker-utils/response'

/**
 * Returns badbits denylist results.
 * @param {import('itty-router').Request} request
 * @param {import('./env').Env} env
 */
export const denylistGet = async function (request, env) {
  const cid = request?.params?.cid

  if (!cid) {
    return new Response('cid is a required query param', { status: 400 })
  }

  try {
    await normalizeCid(cid)
  } catch (e) {
    return new Response('cid query param is invalid', { status: 400 })
  }

  const denyListResource = await getFromDenyList(cid, env)

  if (denyListResource) {
    try {
      return new JSONResponse(JSON.parse(denyListResource), { status: 200 })
    } catch (e) {
      env.log.log(`ERROR WHILE PARSING DENYLIST FOR CID "${cid}" ${e}`, 'error')
    }
  }

  return new Response('Not Found', { status: 404 })
}
