import {
  NoValidUrlError,
  NoValidContentTypeError
} from './errors.js'

/**
 * Handle queue Post.
 *
 * @param {Request} request
 * @param {import('./env').Env} env
 */
export async function queuePost (request, env) {
  // Validate content type and valid URLs
  if (!request.headers.get('content-type')?.includes('application/json')) {
    throw new NoValidContentTypeError()
  }

  /** @type {Record<string, string>} */
  const pullBody = await request.json()
  const urls = Object.values(pullBody)

  if (!urls.length) {
    throw new NoValidUrlError()
  }

  // Validate URL is valid
  try {
    urls.map(u => new URL(u))
  } catch (err) {
    throw new NoValidUrlError()
  }

  // TODO: Do we get Queue ID to return?
  await env.ATTACH_PIPELINE_QUEUE.sendBatch(
    Object.entries(pullBody).map(
      ([carCid, url]) => ({
        body: {
          carCid,
          url
        }
      })
    )
  )

  return new Response()
}
