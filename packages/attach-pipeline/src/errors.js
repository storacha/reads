export class HTTPError extends Error {
  /**
   *
   * @param {string} message
   * @param {number} [status]
   */
  constructor (message, status = 500) {
    super(message)
    this.name = 'HTTPError'
    this.status = status
  }
}

export class NoValidContentTypeError extends HTTPError {
  constructor (msg = 'No valid content-type provided') {
    super(msg, 400)
    this.name = 'NoValidContentType'
    this.code = NoValidContentTypeError.CODE
  }
}
NoValidContentTypeError.CODE = 'ERROR_NO_VALID_CONTENT_TYPE'

export class NoValidUrlError extends HTTPError {
  constructor (msg = 'No valid URL to pull provided') {
    super(msg, 400)
    this.name = 'NoValidUrl'
    this.code = NoValidUrlError.CODE
  }
}
NoValidUrlError.CODE = 'ERROR_NO_VALID_URL'

export class NoTokenError extends HTTPError {
  constructor (msg = 'No token found in `Authorization: Basic ` header') {
    super(msg, 401)
    this.name = 'NoToken'
    this.code = NoTokenError.CODE
  }
}
NoTokenError.CODE = 'ERROR_NO_TOKEN'

export class ExpectedBasicStringError extends HTTPError {
  constructor (msg = 'Expected argument to be a string in the `Basic {token}` format') {
    super(msg, 401)
    this.name = 'ExpectedBasicString'
    this.code = ExpectedBasicStringError.CODE
  }
}
ExpectedBasicStringError.CODE = 'ERROR_NO_TOKEN'

export class NoValidTokenError extends HTTPError {
  constructor (msg = 'Provided token is not valid') {
    super(msg, 401)
    this.name = 'NoValidToken'
    this.code = NoValidTokenError.CODE
  }
}
NoValidTokenError.CODE = 'ERROR_NO_VALID_TOKEN'

export class NoSuccessMd5WriteError extends HTTPError {
  constructor (msg = 'No success writing CAR to R2 due to md5 mismatch') {
    super(msg, 400)
    this.name = 'NoSuccessResponse'
    this.code = NoSuccessMd5WriteError.CODE
  }
}
NoSuccessMd5WriteError.CODE = 'ERROR_NO_SUCCESS_MD5'