/* eslint-env serviceworker, browser */
/* global Response */
import pRetry from 'p-retry'
import { normalizeCid } from './utils/cid'
import {
  GOOGLE_EVALUATE,
  getStoredThreats,
  getResults
} from './utils/evaluate'
import { ServiceUnavailableError } from './errors'

/**
 * @param {(cid: string, request: import('itty-router').Request, env: import('./env').Env) => Promise<Response>} fn
 * @returns {import('itty-router').RouteHandler<Request>}
 */
function withCidPathParam (fn) {
  /**
   * @param {import('itty-router').Request} request
   * @param {import('./env').Env} env
   */
  return async function (request, env) {
    const cid = request?.params?.cid

    if (!cid) {
      return new Response('cid is a required path param', { status: 400 })
    }

    try {
      await normalizeCid(cid)
    } catch (e) {
      return new Response('cid path param is invalid', { status: 400 })
    }

    return await fn(cid, request, env)
  }
}

export const verificationGet = withCidPathParam(
  /**
   * Returns google malware result.
   */
  async function (cid, request, env) {
    const threats = await getStoredThreats(cid, env)
    if (threats?.length) {
      return new Response(threats.join(', '), { status: 403 })
    }

    return new Response('', { status: 204 })
  }
)

/**
 * Process CID with malware verification parties.
 */
export const verificationPost = withCidPathParam(
  async function verificationPost (cid, request, env) {
    const resultKey = `${cid}/${GOOGLE_EVALUATE}`
    const lockKey = `${cid}/${GOOGLE_EVALUATE}.lock`
    const cidVerifyResults = await getResults(cid, env)
    // @ts-ignore
    const googleEvaluateResult = cidVerifyResults[resultKey]
    // @ts-ignore
    const googleEvaluateLock = cidVerifyResults[lockKey]

    if (!googleEvaluateResult && !googleEvaluateLock) {
      const threats = await fetchGoogleMalwareResults(cid, `https://${cid}.${env.IPFS_GATEWAY_TLD}`, env)
      const response = new Response('cid malware detection processed', { status: 201 })

      if (threats?.length) {
        env.log.log(`MALWARE DETECTED for cid "${cid}" ${threats.join(', ')}`, 'info')
        env.log.end(response)
      }
      return response
    }

    return new Response('cid malware detection already processed', { status: 202 })

    /**
     * Fetch malware results for the url from Google's Evaluate API.
     *
     * @param {string} cid
     * @param {string} url
     * @param {import('./env').Env} env
     */
    async function fetchGoogleMalwareResults (cid, url, env) {
      /** @type {string[]} */
      let threats = []
      try {
        await env.CID_VERIFIER_RESULTS.put(lockKey, 'true', { metadata: { value: 'true' } })
        const googleCloudResponse = await fetch(
          `${
            env.GOOGLE_CLOUD_API_URL
          }/v1eap1:evaluateUri?key=${env.GOOGLE_CLOUD_API_KEY}`,
          {
            body: JSON.stringify({
              uri: url,
              threatTypes: ['SOCIAL_ENGINEERING', 'MALWARE', 'UNWANTED_SOFTWARE'],
              allowScan: 'true'
            }),
            headers: {
              'content-type': 'application/json; charset=utf-8'
            },
            method: 'POST'
          }
        )

        if (googleCloudResponse.status !== 200) {
          throw new ServiceUnavailableError(`GOOGLE CLOUD UNABLE TO VERIFY URL "${url}" status code "${googleCloudResponse?.status}"`)
        }

        const evaluateJson = await googleCloudResponse.json()
        const stringifiedJSON = JSON.stringify(evaluateJson)

        await pRetry(
          () => env.CID_VERIFIER_RESULTS.put(resultKey, stringifiedJSON, { metadata: { value: stringifiedJSON } }),
          { retries: 5 }
        )
        threats = await getStoredThreats(resultKey, env)
      } catch (e) {
        // @ts-ignore
        env.log.log(e, 'error')
        throw e
      } finally {
        await pRetry(
          () => env.CID_VERIFIER_RESULTS.delete(lockKey),
          { retries: 5 }
        )
      }

      return threats
    }
  }
)
