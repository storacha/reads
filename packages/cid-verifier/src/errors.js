export class ServiceUnavailableError extends Error {
  /**
   * @param {string} message
   */
  constructor (message = 'Service Unavailable') {
    const status = 503
    super(message)
    this.name = 'ServiceUnavailableError'
    this.status = status
    this.code = ServiceUnavailableError.CODE
    this.contentType = 'text/html'
  }
}
ServiceUnavailableError.CODE = 'ERROR_SERVICE_UNAVAILABLE'
