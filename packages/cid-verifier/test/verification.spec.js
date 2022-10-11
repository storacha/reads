// @ts-ignore
import Hash from 'ipfs-only-hash'
import { test, getMiniflare } from './utils/setup.js'

/**
 * @param {string} s
 */
const createTestCid = async (s) => await Hash.of(s, { cidVersion: 1 })

const pendingCid = await createTestCid('pending')
const emptyCid = await createTestCid('empty')
const notMalwareCid = await createTestCid('notMalware')
const malwareCid = await createTestCid('malware')
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
    scores: [
      {
        threatType: 'MALWARE',
        confidenceLevel: 'EXTREMELY_HIGH'
      }
    ]
  }), {
    metadata: {
      value: JSON.stringify({
        scores: [
          {
            threatType: 'MALWARE',
            confidenceLevel: 'EXTREMELY_HIGH'
          }
        ]
      })
    }
  })
})

test('GET /:cid handles invalid cid', async (t) => {
  const { mf } = t.context
  const response = await mf.dispatchFetch('http://localhost:8787/invalid', { headers })
  t.is(await response.text(), 'cid path param is invalid')
  t.is(response.status, 400)
})

test('GET /:cid handles no results', async (t) => {
  const { mf } = t.context
  const response = await mf.dispatchFetch(`http://localhost:8787/${emptyCid}`, { headers })
  t.is(await response.text(), '')
  t.is(response.status, 204)
})

test('GET /:cid handles pending results', async (t) => {
  const { mf } = t.context
  const response = await mf.dispatchFetch(`http://localhost:8787/${pendingCid}`, { headers })
  t.is(await response.text(), '')
  t.is(response.status, 204)
})

test('GET /:cid handles successful results', async (t) => {
  const { mf } = t.context
  const response = await mf.dispatchFetch(`http://localhost:8787/${notMalwareCid}`, { headers })
  t.is(await response.text(), '')
  t.is(response.status, 204)
})

test('GET /:cid handles malware cid', async (t) => {
  const { mf } = t.context
  const response = await mf.dispatchFetch(`http://localhost:8787/${malwareCid}`, { headers })
  t.is(response.status, 403)
})

test('POST /:cid handles invalid cid', async (t) => {
  const { mf } = t.context
  const response = await mf.dispatchFetch('http://localhost:8787/invalid', { method: 'POST', headers })
  t.is(await response.text(), 'cid path param is invalid')
  t.is(response.status, 400)
})

test('POST /:cid handles safe urls', async (t) => {
  const { mf } = t.context
  const response = await mf.dispatchFetch(`http://localhost:8787/${safeCid}`, { method: 'POST', headers })
  t.is(await response.text(), 'cid malware detection processed')
  t.is(response.status, 201)
})

test('POST /:cid handles invalid or error urls', async (t) => {
  const { mf } = t.context
  const response = await mf.dispatchFetch(`http://localhost:8787/${errorCid}`, { method: 'POST', headers })
  t.is(await response.text(), `GOOGLE CLOUD UNABLE TO VERIFY URL "https://${errorCid}.ipfs.link.test" status code "400"`)
  t.is(response.status, 503)
})

test('POST /:cid handles pending results', async (t) => {
  const { mf } = t.context
  const response = await mf.dispatchFetch(`http://localhost:8787/${pendingCid}`, { method: 'POST', headers })
  t.is(await response.text(), 'cid malware detection already processed')
  t.is(response.status, 202)
})

test('POST /:cid handles overriding existing malware cid', async (t) => {
  const { mf } = t.context
  const response = await mf.dispatchFetch(`http://localhost:8787/${malwareCid}`, { method: 'POST', headers })
  t.is(await response.text(), 'cid malware detection already processed')
  t.is(response.status, 202)
})
