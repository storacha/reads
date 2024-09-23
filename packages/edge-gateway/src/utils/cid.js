import { Multibases } from 'ipfs-core-utils/multibases'
import { bases } from 'multiformats/basics'
import { parse } from 'multiformats/link'
import * as uint8arrays from 'uint8arrays'
import { sha256 } from 'multiformats/hashes/sha2'

import { InvalidUrlError } from '../errors.js'

/**
 * Parse subdomain URL and return cid.
 *
 * @param {URL} url
 */
export async function getCidFromSubdomainUrl (url) {
  // Replace "ipfs-staging" by "ipfs" if needed
  const host = url.hostname.replace('ipfs-staging', 'ipfs')
  const splitHost = host.split('.ipfs.')

  if (!splitHost.length) {
    throw new InvalidUrlError(url.hostname)
  }

  let cid
  try {
    cid = await normalizeCid(splitHost[0])
  } catch (/** @type {any} */ err) {
    throw new InvalidUrlError(`invalid CID: ${splitHost[0]}: ${err.message}`)
  }

  return cid
}

/**
 * Parse CID and return normalized v1.
 *
 * @param {string} cid
 */
export async function normalizeCid (cid) {
  const baseDecoder = await getMultibaseDecoder(cid)
  return parse(cid, baseDecoder).toV1()
}

/**
 * Get multibase to decode CID
 *
 * @param {string} cid
 */
async function getMultibaseDecoder (cid) {
  const multibaseCodecs = Object.values(bases)
  const basicBases = new Multibases({
    bases: multibaseCodecs
  })

  const multibasePrefix = cid[0]
  const base = await basicBases.getBase(multibasePrefix)

  return base.decoder
}

/**
 * Get denylist anchor with badbits format.
 *
 * @param {import('multiformats').UnknownLink} cid
 */
export async function toDenyListAnchor (cid) {
  const multihash = await sha256.digest(uint8arrays.fromString(`${cid}/`))
  const digest = multihash.bytes.subarray(2)
  return uint8arrays.toString(digest, 'hex')
}

/**
 * Extracting resource CID from etag based on
 * https://github.com/ipfs/specs/blob/main/http-gateways/PATH_GATEWAY.md#etag-response-header
 *
 * @param {string} etag
 */
export function getCidFromEtag (etag) {
  let resourceCid = decodeURIComponent(etag)

  // Handle weak etag
  resourceCid = resourceCid.replace('W/', '')
  resourceCid = resourceCid.replaceAll('"', '')

  // Handle directory index generated
  if (etag.includes('DirIndex')) {
    const split = resourceCid.split('-')
    resourceCid = split[split.length - 1]
  }

  return parse(resourceCid)
}
