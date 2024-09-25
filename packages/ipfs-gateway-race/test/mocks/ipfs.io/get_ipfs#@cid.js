const { bigData } = require('../fixtures.js')

/**
 * https://github.com/sinedied/smoke#javascript-mocks
 */
module.exports = async ({ params, headers }) => {
  const cid = params.cid

  const responseHeaders = {
    ...headers,
    'Content-Type': 'text/plain'
  }

  if (cid === 'bafkreihl44bu5rqxctfvl3ahcln7gnjgmjqi7v5wfwojqwriqnq7wo4n7u') {
    return {
      statusCode: 200,
      headers: responseHeaders,
      body: 'Hello dot.storage! 😎'
    }
  }

  if (cid === 'bafkreibehzafi6gdvlyue5lzxa3rfobvp452kylox6f4vwqpd4xbr53uqu') {
    return {
      statusCode: 200,
      headers: responseHeaders,
      body: 'Hello dot.storage! 😎👻'
    }
  }

  if (
    cid === 'bafkreidwgoyc2f7n5vmwbcabbckwa6ejes4ujyncyq6xec5gt5nrm5hzga' &&
    headers['if-none-match'] === `"${cid}"`
  ) {
    return {
      statusCode: 304,
      body: undefined, // smoke ignores statusCode if body is not present!
      headers: {
        etag: cid,
        'cache-control': 'public, max-age=29030400, immutable'
      }
    }
  }

  if (cid === bigData.cid) {
    const [start, end] = headers.range.split('bytes=')[1].split('-').map(s => parseInt(s))
    responseHeaders['Content-Length'] = end - start + 1
    responseHeaders['Content-Range'] = `bytes ${start}-${end}/${bigData.bytes.length}`
    return {
      statusCode: 206,
      headers: responseHeaders,
      body: Buffer.from(bigData.bytes.slice(start, end + 1)).toString('base64'),
      buffer: true
    }
  }

  return {
    statusCode: 500,
    body: undefined, // smoke ignores statusCode if body is not present!
    headers: responseHeaders
  }
}
