/**
 * https://github.com/sinedied/smoke#javascript-mocks
 */
module.exports = (request) => {
  if (request.url.includes('bafybeiaekuoonpqpmems3uapy27zsas5p6ylku53lzkaufnvt4s5n6a7au')) {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/plain',
        Etag: 'bafkreibv3ecfm3wpoawshuqhir3cn2w4dewlr6jit3hfx6cjqgmzbsq22y'
      },
      body: 'This is fixture malware'
    }
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/plain',
      Etag: 'bafkreia4d2wzubczuknsuwcrta2psy7rjkso4xxryjep44yvddtp6pe5vu'
    },
    body: 'Hello gateway.nft.storage resource!'
  }
}
