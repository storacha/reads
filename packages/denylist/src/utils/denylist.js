import pRetry from 'p-retry'
import * as uint8arrays from 'uint8arrays'
import { sha256 } from 'multiformats/hashes/sha2'

/**
 * Get denylist anchor with badbits format.
 *
 * @param {string} cid
 */
export async function toDenyListAnchor (cid) {
  const multihash = await sha256.digest(uint8arrays.fromString(`${cid}/`))
  const digest = multihash.bytes.subarray(2)
  return uint8arrays.toString(digest, 'hex')
}

/**
 * Get a given entry from the deny list if CID exists.
 *
 * @param {string} cid
 * @param {import('../env').Env} env
 */
export async function getFromDenyList (cid, env) {
  const datastore = env.DENYLIST
  if (!datastore) {
    throw new Error('db not ready')
  }

  const anchor = await toDenyListAnchor(cid)
  // TODO: Remove once https://github.com/nftstorage/nftstorage.link/issues/51 is fixed
  return await pRetry(
    () => datastore.get(anchor),
    { retries: 5 }
  )
}
