/* eslint-env serviceworker, browser */
/* global Response */
import { getFromDenyList } from './utils/denylist'
import { ServiceUnavailableError } from './errors'

const GOOGLE_EVALUATE = 'google-evaluate'

/**
 * Get verification results from 3rd parties stored in KV.
 *
 * @param {string} cid
 * @param {import('./env').Env} env
 */
async function getResults (cid, env) {
  const datastore = env.CID_VERIFIER_RESULTS
  if (!datastore) {
    throw new Error('CID_VERIFIER_RESULTS db not ready')
  }

  return (await datastore.list({ prefix: cid }))?.keys?.reduce((acc, key) => {
    // @ts-ignore
    acc[key?.name] = key?.metadata?.value
    return acc
  }, {})
}

/**
 * @param {Array<string>} params
 * @param {(params: Array<string>, request: Request, env: import('./env').Env) => Promise<Response>} fn
 * @returns {import('itty-router').RouteHandler<Request>}
 */
function withRequiredQueryParams (params, fn) {
  /**
   * @param {Request} request
   * @param {import('./env').Env} env
   */
  return async function (request, env) {
    const searchParams = (new URL(request.url)).searchParams

    for (const param of params) {
      if (!searchParams.get(param)) {
        return new Response(`${param} is a required query param`, { status: 400 })
      }
    }

    return await fn(params.map(param => String(searchParams.get(param))), request, env)
  }
}

export const verificationGet = withRequiredQueryParams(['cid'],
  /**
   * Returns google malware result.
   */
  async function (params, request, env) {
    const [cid] = params

    const denyListResource = await getFromDenyList(cid, env)
    if (denyListResource) {
      const { status } = JSON.parse(denyListResource)
      if (status === 451) {
        return new Response('BLOCKED FOR LEGAL REASONS', { status: 451 })
      } else {
        return new Response('MALWARE DETECTED', { status: 403 })
      }
    }
    return new Response('', { status: 204 })
  }
)

/**
 * Process CID with malware verification parties.
 */
export const verificationPost = withRequiredQueryParams(['cid', 'url'],
  async function verificationPost (params, request, env) {
    const [cid, url] = params
    const resultKey = `${cid}/${GOOGLE_EVALUATE}`
    const lockKey = `${cid}/${GOOGLE_EVALUATE}.lock`
    const cidVerifyResults = await getResults(cid, env)
    // @ts-ignore
    const googleEvaluateResult = cidVerifyResults[resultKey]
    // @ts-ignore
    const googleEvaluateLock = cidVerifyResults[lockKey]

    if (!googleEvaluateResult && !googleEvaluateLock) {
      await fetchGoogleMalwareResults(cid, url, env)
      return new Response('cid malware detection processed', { status: 201 })
    }

    return new Response('cid malware detection processed', { status: 202 })

    /**
     * Fetch malware results for the url from Google's Evaluate API.
     *
     * @param {string} cid
     * @param {string} url
     * @param {import('./env').Env} env
     */
    async function fetchGoogleMalwareResults (cid, url, env) {
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
        await env.CID_VERIFIER_RESULTS.put(resultKey, stringifiedJSON, { metadata: { value: stringifiedJSON } })
        // @ts-ignore
        // if any score isn't what we consider to be safe we add it to the DENYLIST
        const threats = evaluateJson?.scores?.filter(score => !env.GOOGLE_EVALUATE_SAFE_CONFIDENCE_LEVELS.includes(score.confidenceLevel)).map(score => score.threatType)
        if (threats.length) {
          await env.DENYLIST.put(cid, JSON.stringify({
            status: 403,
            reason: threats.join(', ')
          }))
          // @ts-ignore
          env.log.log(`MALWARE DETECTED for cid "${cid}" ${threats.join(', ')}`, 'log')
        }
      } catch (e) {
        // @ts-ignore
        env.log.log(e, 'error')
        throw e
      } finally {
        await env.CID_VERIFIER_RESULTS.delete(lockKey)
      }
    }
  }
)
