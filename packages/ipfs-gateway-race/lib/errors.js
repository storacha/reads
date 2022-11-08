export class GatewayTimeoutError extends Error {
  /**
   * @param {string} message
   */
  constructor (message = 'Gateway Time-out') {
    const status = 504
    super(message)
    this.name = 'GatewayTimeoutError'
    this.status = status
    this.code = GatewayTimeoutError.CODE
    this.contentType = 'text/html'
  }
}
GatewayTimeoutError.CODE = 'ERROR_GATEWAY_TIMEOUT'

export class BadGatewayError extends Error {
  /**
   * @param {string} message
   */
  constructor (message = 'Bad Gateway') {
    const status = 502
    super(message)
    this.name = 'BadGatewayError'
    this.status = status
    this.code = BadGatewayError.CODE
    this.contentType = 'text/html'
  }
}
BadGatewayError.CODE = 'ERROR_BAD_GATEWAY'

export class NotFoundError extends Error {
  /**
   * @param {string} message
   */
  constructor (message = 'Not found') {
    const status = 404
    super(message)
    this.name = 'NotFoundError'
    this.status = status
    this.code = NotFoundError.CODE
    this.contentType = 'text/html'
  }
}
NotFoundError.CODE = 'ERROR_NOT_FOUND'
