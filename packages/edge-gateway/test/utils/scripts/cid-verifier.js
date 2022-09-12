/* eslint-env serviceworker, browser */

const maliciousRootCid = 'bafkreibx45dh23bkcli5qxevg2zq5pa7dbzpdd45h4uugk6qgjlyifulj4'
const maliciousResourceCid = 'bafkreibv3ecfm3wpoawshuqhir3cn2w4dewlr6jit3hfx6cjqgmzbsq22y'
const htmlDirectoryRootCid = 'bafybeiaekuoonpqpmems3uapy27zsas5p6ylku53lzkaufnvt4s5n6a7au'
const htmlResourceCid = 'bafkreib6uzgr2noyzup3uuqcp6gafddnx6n3iinkyflbrkhdhfpcoggc5u'

export default {
  /**
   * @param {Request} request
   * @param {any} env
   */
  async fetch (request, env) {
    // GET for denylist validation
    if (
      request.method === 'GET' &&
      (request.url.includes(maliciousRootCid) || request.url.includes(maliciousResourceCid))
    ) {
      return new Response('malicious', {
        status: 403
      })
    }

    // POST for cid validation
    if (
      request.method === 'POST' &&
      request.url.includes(htmlDirectoryRootCid)
    ) {
      await env.TEST_NAMESPACE.put(`${htmlDirectoryRootCid}/test.lock`, 'LOCK')
    } else if (
      request.method === 'POST' &&
      request.url.includes(htmlResourceCid)
    ) {
      await env.TEST_NAMESPACE.put(`${htmlResourceCid}/test.lock`, 'LOCK')
    }

    return new Response('', {
      status: 204
    })
  }
}
