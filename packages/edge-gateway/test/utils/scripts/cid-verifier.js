/* eslint-env serviceworker, browser */

export default {
  /**
   * @param {Request} request
   */
  async fetch (request) {
    if (
      request.url
        .toString()
        .includes('bafkreibx45dh23bkcli5qxevg2zq5pa7dbzpdd45h4uugk6qgjlyifulj4')
    ) {
      return new Response('malicious', {
        status: 403
      })
    }

    return new Response('', {
      status: 204
    })
  }
}
