/**
 * https://github.com/sinedied/smoke#javascript-mocks
 */
module.exports = async ({ headers, query }) => {
  const responseHeaders = {
    ...headers,
    'Content-Type': 'text/plain'
  }

  return {
    statusCode: 200,
    headers: responseHeaders,
    body: 'Hello dot.storage with query param foo=test! 😎😎😎'
  }
}
