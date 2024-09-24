const { bigData } = require('../fixtures.js')

/**
 * https://github.com/sinedied/smoke#javascript-mocks
 */
module.exports = async ({ params, headers }) => {
  const cid = params.cid

  const responseHeaders = {
    Etag: `"${cid}"`,
    'Cache-Control': 'public, max-age=29030400, immutable'
  }

  if (cid === bigData.cid) {
    responseHeaders['Content-Length'] = bigData.bytes.length
    return {
      statusCode: 200,
      headers: responseHeaders,
      body: undefined
    }
  }

  return {
    statusCode: 500,
    body: undefined, // smoke ignores statusCode if body is not present!
    headers: responseHeaders
  }
}
