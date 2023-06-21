// @ts-ignore
import Hash from 'ipfs-only-hash'
import { test, getMiniflare } from './utils/setup.js'
import { toDenyListAnchor } from '../src/utils/denylist.js'

/**
 * @param {string} s
 */
const createTestCid = async (s) => await Hash.of(s, { cidVersion: 1 })

// Create a new Miniflare environment for each test
test.before(t => {
  t.context.mf = getMiniflare()
})

test('GET / handles invalid cid path param', async (t) => {
  const { mf } = t.context
  const response = await mf.dispatchFetch('http://localhost:8787/invalid')
  t.is(await response.text(), 'cid path param is invalid')
  t.is(response.status, 400)
})

test('GET / handles no matching cid in DENYLIST', async (t) => {
  const { mf } = t.context
  const cid = await createTestCid('not in denylist')
  const response = await mf.dispatchFetch(`http://localhost:8787/${cid}`)
  t.is(await response.text(), 'Not Found')
  t.is(response.status, 404)
})

test('GET / handles cids in DENYLIST', async (t) => {
  const { mf } = t.context
  const cid = await createTestCid('asdfasdf')
  const denylistKv = await mf.getKVNamespace('DENYLIST')
  await denylistKv.put(await toDenyListAnchor(cid), JSON.stringify({ status: 410, reason: 'bad' }))

  const response = await mf.dispatchFetch(`http://localhost:8787/${cid}`)
  const json = await response.json()
  t.deepEqual(json, { status: 410, reason: 'bad' })
  t.is(response.status, 200)
})

test('GET / handles cids in DENYLIST blocked for legal reasons', async (t) => {
  const { mf } = t.context
  const cid = await createTestCid('blocked for legal reasons')
  const denylistKv = await mf.getKVNamespace('DENYLIST')
  await denylistKv.put(await toDenyListAnchor(cid), JSON.stringify({ status: 451, reason: 'blocked for legal reasons' }))

  const response = await mf.dispatchFetch(`http://localhost:8787/${cid}`)
  t.deepEqual(await response.json(), { status: 451, reason: 'blocked for legal reasons' })
  t.is(response.status, 200)
})

test('GET / caches response', async (t) => {
  const { mf } = t.context
  const cid = await createTestCid('CID CACHE TEST')
  const denylistKv = await mf.getKVNamespace('DENYLIST')
  await denylistKv.put(await toDenyListAnchor(cid), JSON.stringify({ status: 410, reason: 'blocked for testing the cache' }))

  const res0 = await mf.dispatchFetch(`http://localhost:8787/${cid}`, {
    headers: { 'Cache-Control': 'only-if-cached' }
  })
  t.is(res0.status, 412)

  const res1 = await mf.dispatchFetch(`http://localhost:8787/${cid}`)
  t.is(res1.status, 200)

  // wait for cache to be written
  await res1.waitUntil()

  const res2 = await mf.dispatchFetch(`http://localhost:8787/${cid}`, {
    headers: { 'Cache-Control': 'only-if-cached' }
  })
  t.is(res2.status, 200)
})

test('POST / batch', async t => {
  const { mf } = t.context
  const cid = await createTestCid('CID CACHE TEST')
  const denylistKv = await mf.getKVNamespace('DENYLIST')
  await denylistKv.put(await toDenyListAnchor(cid), JSON.stringify({ status: 410, reason: 'blocked for testing the cache' }))

  const checklist = ['QmSDeYAe9mga6NdTozAZuyGL3Q1XjsLtvX28XFxJH8oPjq', cid]
  let res = await mf.dispatchFetch('http://localhost:8787/', {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify(checklist)
  })
  t.is(res.status, 200)
  const denylist = await res.json()
  t.is(denylist.length, 1)
  t.is(denylist[0], cid)

  // not really cids, but we're checking that a max length limit is applied here
  const tooLong = [...Array(1001).keys()]
  res = await mf.dispatchFetch('http://localhost:8787/', {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify(tooLong)
  })
  t.is(res.status, 400)

  res = await mf.dispatchFetch('http://localhost:8787/', {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify(checklist).slice(0, -1)
  })
  t.is(res.status, 400)
})
