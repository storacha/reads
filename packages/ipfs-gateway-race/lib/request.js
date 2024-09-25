/**
 * Determine if the request is for a specific byte range.
 * @param {Headers} headers
 */
export const isRangeRequest = headers => headers.get('Range') !== null

/**
 * Determine if the request is for an alternative format, like an IPLD block or
 * a CAR file.
 * @param {Headers} headers
 * @param {URLSearchParams} searchParams
 */
export const isAlternateFormatRequest = (headers, searchParams) => {
  const format = searchParams.get('format')
  const accept = headers.get('Accept')
  return Boolean(format || accept?.includes('application/vnd.ipld.'))
}
