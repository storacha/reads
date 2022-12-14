import { NoTokenError, ExpectedBasicStringError, NoValidTokenError } from './errors.js'

/**
 * Middleware: verify the request is authenticated using Basic Authentication.
 *
 * @param {import('itty-router').RouteHandler<Request>} handler
 */
export function withAuthToken (handler) {
  /**
   * @param {Request} request
   * @param {import('./env').Env} env
   * @returns {Promise<Response>}
   */
  return async (request, env) => {
    const token = getTokenFromRequest(request)
    if (env.BASIC_AUTH_TOKENS.indexOf(token) === -1) {
      throw new NoValidTokenError()
    }
    return await handler(request, env)
  }
}

/**
 * @param {Request} request
 */
function getTokenFromRequest (request) {
  const authHeader = request.headers.get('Authorization') || ''
  if (!authHeader) {
    throw new NoTokenError()
  }

  const token = parseAuthorizationHeader(authHeader)
  if (!token) {
    throw new NoTokenError()
  }
  return token
}

/**
 * @param {string} header
 */
function parseAuthorizationHeader (header) {
  if (!header.toLowerCase().startsWith('basic ')) {
    throw new ExpectedBasicStringError()
  }

  return header.substring(6)
}
