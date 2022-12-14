export class NoTokenError extends Error {
  /**
   * @param {string} message
   */
  constructor (message = 'No token found in `Authorization: Basic ` header') {
    super(message)
    this.name = 'NoToken'
    this.code = NoTokenError.CODE
    this.status = 401
  }
}
NoTokenError.CODE = 'ERROR_NO_TOKEN'

export class ExpectedBasicStringError extends Error {
  /**
   * @param {string} message
   */
  constructor (message = 'Expected argument to be a string in the `Basic {token}` format') {
    super(message)
    this.name = 'ExpectedBasicString'
    this.code = ExpectedBasicStringError.CODE
    this.status = 401
  }
}
ExpectedBasicStringError.CODE = 'ERROR_NO_TOKEN'

export class NoValidTokenError extends Error {
  /**
   * @param {string} message
   */
  constructor (message = 'Provided token is not valid') {
    super(message)
    this.name = 'NoValidToken'
    this.code = NoValidTokenError.CODE
    this.status = 401
  }
}
NoValidTokenError.CODE = 'ERROR_NO_VALID_TOKEN'

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
