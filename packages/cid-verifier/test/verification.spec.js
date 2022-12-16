// @ts-ignore
import Hash from 'ipfs-only-hash'
import { test, getMiniflare } from './utils/setup.js'
import { toDenyListAnchor } from '../src/utils/denylist.js'

/**
 * @param {string} s
 */
const createTestCid = async (s) => await Hash.of(s, { cidVersion: 1 })

// TODO: use valid cids and test 400 scenarios
const cidInDenyList = await createTestCid('asdfasdf')
const cidInDenyListBlockedForLeganReasons = await createTestCid('blocked for legal reasons')
const pendingCid = await createTestCid('pending')
const emptyCid = await createTestCid('empty')
const notMalwareCid = await createTestCid('notMalware')
const malwareCid = await createTestCid('malware')
const maliciousCid = await createTestCid('malicious')
const safeCid = await createTestCid('safe')
const errorCid = await createTestCid('error')
const headers = {
  Authorization: 'basic Zm9vOmZvbw=='
}

// Create a new Miniflare environment for each test
test.before(async (t) => {
  const mf = getMiniflare()
  t.context = {
    mf
  }
  const googleMalwareResultsKv = await mf.getKVNamespace('CID_VERIFIER_RESULTS')
  await googleMalwareResultsKv.put(`${pendingCid}/google-evaluate.lock`, 'true', { metadata: { value: 'true' } })
  await googleMalwareResultsKv.put(`${notMalwareCid}/google-evaluate`, '{}', { metadata: { value: '{}' } })
  await googleMalwareResultsKv.put(`${malwareCid}/google-evaluate`, JSON.stringify({
    threat: {
      threatTypes: ['MALWARE'],
      expireTime: '2022-08-28T07:54:04.936398042Z'
    }
  }), {
    metadata: {
      value: JSON.stringify({
        threat: {
          threatTypes: ['MALWARE'],
          expireTime: '2022-08-28T07:54:04.936398042Z'
        }
      })
    }
  })
  const denylistKv = await mf.getKVNamespace('DENYLIST')
  await denylistKv.put(await toDenyListAnchor(cidInDenyList), JSON.stringify({ status: 410, reason: 'bad' }))
  await denylistKv.put(await toDenyListAnchor(cidInDenyListBlockedForLeganReasons), JSON.stringify({ status: 451, reason: 'blocked for legal reasons' }))
})

test('GET /denylist handles cids in DENYLIST', async (t) => {
  const { mf } = t.context
  const response = await mf.dispatchFetch(`http://localhost:8787/denylist?cid=${cidInDenyList}`, { headers })
  t.is(await response.text(), 'MALWARE DETECTED')
  t.is(response.status, 403)
})

test('GET /denylist handles cids in DENYLIST blocked for legal reasons', async (t) => {
  const { mf } = t.context
  const response = await mf.dispatchFetch(`http://localhost:8787/denylist?cid=${cidInDenyListBlockedForLeganReasons}`, { headers })
  t.is(await response.text(), 'BLOCKED FOR LEGAL REASONS')
  t.is(response.status, 451)
})

test('GET /denylist handles no cid', async (t) => {
  const { mf } = t.context
  const response = await mf.dispatchFetch('http://localhost:8787/denylist?', { headers })
  t.is(await response.text(), 'cid is a required query param')
  t.is(response.status, 400)
})

test('GET /denylist handles invalid cid', async (t) => {
  const { mf } = t.context
  const response = await mf.dispatchFetch('http://localhost:8787/denylist?cid=invalid', { headers })
  t.is(await response.text(), 'cid query param is invalid')
  t.is(response.status, 400)
})

test('GET /denylist handles no results', async (t) => {
  const { mf } = t.context
  const response = await mf.dispatchFetch(`http://localhost:8787/denylist?cid=${emptyCid}`, { headers })
  t.is(await response.text(), '')
  t.is(response.status, 204)
})

test('GET /denylist handles pending results', async (t) => {
  const { mf } = t.context
  const response = await mf.dispatchFetch(`http://localhost:8787/denylist?cid=${pendingCid}`, { headers })
  t.is(await response.text(), '')
  t.is(response.status, 204)
})

test('GET /denylist handles successful results', async (t) => {
  const { mf } = t.context
  const response = await mf.dispatchFetch(`http://localhost:8787/denylist?cid=${notMalwareCid}`, { headers })
  t.is(await response.text(), '')
  t.is(response.status, 204)
})

test('POST / handles no cid', async (t) => {
  const { mf } = t.context
  const response = await mf.dispatchFetch('http://localhost:8787/?', { method: 'POST', headers })
  t.is(await response.text(), 'cid is a required query param')
  t.is(response.status, 400)
})

test('POST / handles invalid cid', async (t) => {
  const { mf } = t.context
  const response = await mf.dispatchFetch('http://localhost:8787/?cid=invalid', { method: 'POST', headers })
  t.is(await response.text(), 'cid query param is invalid')
  t.is(response.status, 400)
})

test('POST / handles malicious urls', async (t) => {
  const { mf } = t.context
  const response = await mf.dispatchFetch(`http://localhost:8787/?cid=${maliciousCid}`, { method: 'POST', headers })
  t.is(await response.text(), 'cid malware detection processed')
  t.is(response.status, 201)
})

test('POST / handles safe urls', async (t) => {
  const { mf } = t.context
  const response = await mf.dispatchFetch(`http://localhost:8787/?cid=${safeCid}`, { method: 'POST', headers })
  t.is(await response.text(), 'cid malware detection processed')
  t.is(response.status, 201)
})

test('POST / handles invalid or error urls', async (t) => {
  const { mf } = t.context
  const response = await mf.dispatchFetch(`http://localhost:8787/?cid=${errorCid}`, { method: 'POST', headers })
  t.is(await response.text(), `GOOGLE CLOUD UNABLE TO VERIFY URL "https://${errorCid}.ipfs.link.test" status code "400"`)
  t.is(response.status, 503)
})

test('POST / handles pending results', async (t) => {
  const { mf } = t.context
  const response = await mf.dispatchFetch(`http://localhost:8787/?cid=${pendingCid}`, { method: 'POST', headers })
  t.is(await response.text(), 'cid malware detection already processed')
  t.is(response.status, 202)
})

test('POST / handles overriding existing malware cid', async (t) => {
  const { mf } = t.context
  const response = await mf.dispatchFetch(`http://localhost:8787/?cid=${malwareCid}`, { method: 'POST', headers })
  t.is(await response.text(), 'cid malware detection already processed')
  t.is(response.status, 202)
})
