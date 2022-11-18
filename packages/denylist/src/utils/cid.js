import { Multibases } from 'ipfs-core-utils/multibases'
import { bases } from 'multiformats/basics'
import { CID } from 'multiformats/cid'

/**
 * Parse CID and return normalized b32 v1.
 *
 * @param {string} cid
 */
export async function normalizeCid (cid) {
  const baseDecoder = await getMultibaseDecoder(cid)
  const c = CID.parse(cid, baseDecoder)
  return c.toV1().toString()
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
