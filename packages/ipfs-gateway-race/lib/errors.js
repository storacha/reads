export class TimeoutError extends Error {
  /**
   * @param {string} message
   */
  constructor (message = 'Gateway Time-out') {
    const status = 408
    super(message)
    this.name = 'TimeoutError'
    this.status = status
    this.code = TimeoutError.CODE
    this.contentType = 'text/html'
  }
}
TimeoutError.CODE = 'ERROR_TIMEOUT'

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
