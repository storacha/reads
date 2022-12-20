/* eslint-env serviceworker, browser */

const invalidCid = 'invalid'

export default {
  /**
   * @param {Request} request
   * @param {any} env
   */
  async fetch (request, env) {
    if (request.method === 'GET') {
      if (request.url.includes(invalidCid)) {
        return new Response('invalid', {
          status: 400
        })
      }

      return new Response('not found', {
        status: 404
      })
    }
  }
}
