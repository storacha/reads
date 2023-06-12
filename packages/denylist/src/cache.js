/* eslint-env browser */
/**
 * Intercepts request if content cached by just returning cached response.
 * Otherwise proceeds to handler.
 * @param {import('itty-router').RouteHandler<Request>} handler
 */
export function withCdnCache (handler) {
  /**
   * @param {Request} request
   * @param {import('./env').Env} env
   * @param {ExecutionContext} ctx
   */
  return async (request, env, ctx) => {
    // Should skip cache if instructed by headers
    if ((request.headers.get('Cache-Control') || '').includes('no-cache')) {
      return handler(request, env, ctx)
    }

    let response
    // Get from cache and return if existent
    /** @type {Cache} */
    // @ts-ignore Cloudflare Workers runtime exposes a single global cache object.
    const cache = caches.default
    const cacheKey = new Request(request.url)
    response = await cache.match(cacheKey)
    if (response) return response

    // If not cached and request wants it _only_ if it is cached, send 412
    if (request.headers.get('Cache-Control') === 'only-if-cached') {
      return new Response(null, { status: 412 })
    }

    response = await handler(request, env, ctx)
    ctx.waitUntil(cache.put(cacheKey, response.clone()))

    return response
  }
}
