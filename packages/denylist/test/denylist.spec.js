// @ts-ignore
import Hash from 'ipfs-only-hash'
import { test, getMiniflare } from './utils/setup.js'
import { toDenyListAnchor } from '../src/utils/denylist.js'

/**
 * @param {string} s
 */
const createTestCid = async (s) => await Hash.of(s, { cidVersion: 1 })

const cidNotInDenyList = await createTestCid('not in denylist')
const cidInDenyList = await createTestCid('asdfasdf')
const cidInDenyListBlockedForLeganReasons = await createTestCid('blocked for legal reasons')

// Create a new Miniflare environment for each test
test.before(async (t) => {
  const mf = getMiniflare()
  t.context = {
    mf
  }
  const denylistKv = await mf.getKVNamespace('DENYLIST')
  await denylistKv.put(await toDenyListAnchor(cidInDenyList), JSON.stringify({ status: 410, reason: 'bad' }))
  await denylistKv.put(await toDenyListAnchor(cidInDenyListBlockedForLeganReasons), JSON.stringify({ status: 451, reason: 'blocked for legal reasons' }))
})

test('GET / handles invalid cid query param', async (t) => {
  const { mf } = t.context
  const response = await mf.dispatchFetch('http://localhost:8787/invalid')
  t.is(await response.text(), 'cid query param is invalid')
  t.is(response.status, 400)
})

test('GET / handles no matching cid in DENYLIST', async (t) => {
  const { mf } = t.context
  const response = await mf.dispatchFetch(`http://localhost:8787/${cidNotInDenyList}`)
  t.is(await response.text(), 'Not Found')
  t.is(response.status, 404)
})

test('GET / handles cids in DENYLIST', async (t) => {
  const { mf } = t.context
  const response = await mf.dispatchFetch(`http://localhost:8787/${cidInDenyList}`)
  const json = await response.json()
  t.deepEqual(json, { status: 410, reason: 'bad' })
  t.is(response.status, 200)
})

test('GET / handles cids in DENYLIST blocked for legal reasons', async (t) => {
  const { mf } = t.context
  const response = await mf.dispatchFetch(`http://localhost:8787/${cidInDenyListBlockedForLeganReasons}`)
  t.deepEqual(await response.json(), { status: 451, reason: 'blocked for legal reasons' })
  t.is(response.status, 200)
})
