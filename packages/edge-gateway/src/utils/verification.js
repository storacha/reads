/* global Response */

import {
  ACCEPTABLE_CID_VERIFIER_STATUS_CODES,
  ACCEPTABLE_DENYLIST_STATUS_CODES
} from '../constants.js'

/**
 * Checks to see if denylist or cid-verifier forbid this CID from being served.
 *
 * @param {import('multiformats').UnknownLink} cid
 * @param {import('../env').Env} env
 */
export async function getCidForbiddenResponse (cid, env) {
  const [cidDenylistResponse, cidVerifierResponse] = await Promise.all([
    env.DENYLIST.fetch(`${env.DENYLIST_URL}/${cid}`),
    env.isCidVerifierEnabled ? env.CID_VERIFIER.fetch(`${env.CID_VERIFIER_URL}/${cid}`, { headers: { Authorization: `basic ${env.CID_VERIFIER_AUTHORIZATION_TOKEN}` } }) : null
  ])

  if (!ACCEPTABLE_DENYLIST_STATUS_CODES.includes(cidDenylistResponse.status)) {
    return new Response('', { status: 410 })
  }

  // cidVerifierResponse will be null if env.isCidVerifierEnabled is false.
  if (cidVerifierResponse && !ACCEPTABLE_CID_VERIFIER_STATUS_CODES.includes(cidVerifierResponse.status)) {
    return cidVerifierResponse
  }
}
