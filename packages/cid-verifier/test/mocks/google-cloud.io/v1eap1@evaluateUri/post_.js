const Hash = require('ipfs-only-hash')

/**
 * https://github.com/sinedied/smoke#javascript-mocks
 */
module.exports = async ({ body: { uri } }) => {
  if (uri === `https://${await Hash.of('malicious', { cidVersion: 1 })}.ipfs.link.test`) {
    return {
      statusCode: 200,
      body: {
        scores: [
          {
            threatType: 'SOCIAL_ENGINEERING',
            confidenceLevel: 'LOW'
          },
          {
            threatType: 'UNWANTED_SOFTWARE',
            confidenceLevel: 'HIGH'
          },
          {
            threatType: 'MALWARE',
            confidenceLevel: 'SAFE'
          }
        ]
      }
    }
  } else if (uri === `https://${await Hash.of('safe', { cidVersion: 1 })}.ipfs.link.test`) {
    return {
      statusCode: 200,
      body: {
        scores: [
          {
            threatType: 'SOCIAL_ENGINEERING',
            confidenceLevel: 'SAFE'
          },
          {
            threatType: 'UNWANTED_SOFTWARE',
            confidenceLevel: 'SAFE'
          },
          {
            threatType: 'MALWARE',
            confidenceLevel: 'SAFE'
          }
        ]
      }
    }
  }

  return {
    statusCode: 400,
    body: {
      error: {
        code: 400,
        message: 'API key not valid. Please pass a valid API key.',
        status: 'INVALID_ARGUMENT',
        details: [
          {
            '@type': 'type.googleapis.com/google.rpc.ErrorInfo',
            reason: 'API_KEY_INVALID',
            domain: 'googleapis.com',
            metadata: {
              service: 'webrisk.googleapis.com'
            }
          }
        ]
      }
    }
  }
}
