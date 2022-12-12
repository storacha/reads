import pRetry from 'p-retry'
export const GOOGLE_EVALUATE = 'google-evaluate'

/**
 * Get the threats we have stored in KV.
 *
 * @param {string} cid
 * @param {import('../env').Env} env
 */
async function getEvaluateResult (cid, env) {
  const resultKey = `${cid}/${GOOGLE_EVALUATE}`
  const datastore = env.CID_VERIFIER_RESULTS
  if (!datastore) {
    throw new Error('db not ready')
  }

  return await pRetry(
    () => datastore.get(resultKey),
    { retries: 5 }
  )
}

/**
 * Get the threats we have stored in KV.
 *
 * @param {string} cid
 * @param {import('../env').Env} env
 */
export async function getStoredThreats (cid, env) {
  const evaluateResult = await getEvaluateResult(cid, env)
  if (evaluateResult) {
    // @ts-ignore
    return JSON.parse(evaluateResult)?.scores?.filter(score => !env.GOOGLE_EVALUATE_SAFE_CONFIDENCE_LEVELS.includes(score.confidenceLevel)).map(score => score.threatType)
  }
  return []
}

/**
 * Get verification results from Google Evaluate API.
 *
 * Also returns any lock results if we have in progress evaluate requests.
 *
 * @param {string} cid
 * @param {import('../env').Env} env
 */
export async function getResults (cid, env) {
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
