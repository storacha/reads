import pRetry from 'p-retry'
import * as uint8arrays from 'uint8arrays'
import { sha256 } from 'multiformats/hashes/sha2'

/**
 * Get denylist anchor with badbits format.
 *
 * @param {string} cid
 */
export async function toDenyListAnchor (cid) {
  const hash = await sha256.encode(uint8arrays.fromString(`${cid}/`))
  return uint8arrays.toString(hash, 'hex')
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
    throw new Error('DENYLIST kv binding missing')
  }

  const anchor = await toDenyListAnchor(cid)
  // TODO: Remove once https://github.com/nftstorage/nftstorage.link/issues/51 is fixed
  return await pRetry(
    () => datastore.get(anchor),
    {
      retries: 5,
      onFailedAttempt: console.log
    }
  )
}
