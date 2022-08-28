import { test, getMiniflare } from './utils/setup.js'
import { toDenyListAnchor } from '../src/utils/denylist.js'

// TODO: use valid cids and test 400 scenarios
const cidInDenyList = 'asdfasdf'
const cidInDenyListBlockedForLeganReasons = 'blocked for legal reasons'
const pendingCid = 'pending'
const emptyCid = 'empty'
const notMalwareCid = 'notMalware'
const malwareCid = 'malware'
const newCid = 'newCid'
const maliciousUrl = encodeURIComponent('http://malicious/url')
const safeUrl = encodeURIComponent('http://safe/url')
const errorUrl = encodeURIComponent('http://error/url')

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
  const response = await mf.dispatchFetch(`http://localhost:8787/denylist?cid=${cidInDenyList}`)
  t.is(await response.text(), 'MALWARE DETECTED')
  t.is(response.status, 403)
})

test('GET /denylist handles cids in DENYLIST blocked for legal reasons', async (t) => {
  const { mf } = t.context
  const response = await mf.dispatchFetch(`http://localhost:8787/denylist?cid=${cidInDenyListBlockedForLeganReasons}`)
  t.is(await response.text(), 'BLOCKED FOR LEGAL REASONS')
  t.is(response.status, 451)
})

test('GET /denylist handles no cid', async (t) => {
  const { mf } = t.context
  const response = await mf.dispatchFetch('http://localhost:8787/denylist?')
  t.is(await response.text(), 'cid is a required query param')
  t.is(response.status, 400)
})

test('GET /denylist handles no results', async (t) => {
  const { mf } = t.context
  const response = await mf.dispatchFetch(`http://localhost:8787/denylist?cid=${emptyCid}`)
  t.is(await response.text(), '')
  t.is(response.status, 204)
})

test('GET /denylist handles pending results', async (t) => {
  const { mf } = t.context
  const response = await mf.dispatchFetch(`http://localhost:8787/denylist?cid=${pendingCid}`)
  t.is(await response.text(), '')
  t.is(response.status, 204)
})

test('GET /denylist handles successful results', async (t) => {
  const { mf } = t.context
  const response = await mf.dispatchFetch(`http://localhost:8787/denylist?cid=${notMalwareCid}`)
  t.is(await response.text(), '')
  t.is(response.status, 204)
})

test('POST / handles no cid', async (t) => {
  const { mf } = t.context
  const response = await mf.dispatchFetch('http://localhost:8787/?', { method: 'POST' })
  t.is(await response.text(), 'cid is a required query param')
  t.is(response.status, 400)
})

test('POST / handles no url', async (t) => {
  const { mf } = t.context
  const response = await mf.dispatchFetch('http://localhost:8787/?cid=asdf', { method: 'POST' })
  t.is(await response.text(), 'url is a required query param')
  t.is(response.status, 400)
})

test('POST / handles malicious urls', async (t) => {
  const { mf } = t.context
  const response = await mf.dispatchFetch(`http://localhost:8787/?cid=${newCid}&url=${maliciousUrl}`, { method: 'POST' })
  t.is(await response.text(), 'cid malware detection processed')
  t.is(response.status, 201)
})

test('POST / handles safe urls', async (t) => {
  const { mf } = t.context
  const response = await mf.dispatchFetch(`http://localhost:8787/?cid=${Math.random()}&url=${safeUrl}`, { method: 'POST' })
  t.is(await response.text(), 'cid malware detection processed')
  t.is(response.status, 201)
})

test('POST / handles invalid or error urls', async (t) => {
  const { mf } = t.context
  const response = await mf.dispatchFetch(`http://localhost:8787/?cid=${Math.random()}&url=${errorUrl}`, { method: 'POST' })
  t.is(await response.text(), 'GOOGLE CLOUD UNABLE TO VERIFY URL "http://error/url" status code "400"')
  t.is(response.status, 503)
})

test('POST / handles no results', async (t) => {
  const { mf } = t.context
  const response = await mf.dispatchFetch(`http://localhost:8787/?cid=${newCid}&url=${maliciousUrl}`, { method: 'POST' })
  t.is(await response.text(), 'cid malware detection processed')
  t.is(response.status, 201)
})

test('POST / handles pending results', async (t) => {
  const { mf } = t.context
  const response = await mf.dispatchFetch(`http://localhost:8787/?cid=${pendingCid}&url=${maliciousUrl}`, { method: 'POST' })
  t.is(await response.text(), 'cid malware detection processed')
  t.is(response.status, 202)
})

test('POST / handles overriding existing malware cid', async (t) => {
  const { mf } = t.context
  const response = await mf.dispatchFetch(`http://localhost:8787/?cid=${malwareCid}&url=${maliciousUrl}`, { method: 'POST' })
  t.is(await response.text(), 'cid malware detection processed')
  t.is(response.status, 202)
})
