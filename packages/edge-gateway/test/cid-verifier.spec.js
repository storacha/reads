import pWaitFor from 'p-wait-for'
import { GenericContainer, Wait } from 'testcontainers'

import { test, getMiniflare } from './utils/setup.js'
import { addFixtures } from './utils/fixtures.js'

test.before(async (t) => {
  const container = await new GenericContainer('ipfs/go-ipfs:v0.13.0')
    .withExposedPorts(
      {
        container: 8080,
        host: 9081
      },
      5001
    )
    .withWaitStrategy(Wait.forLogMessage('Daemon is ready'))
    .start()

  // Add fixtures
  await addFixtures(container.getMappedPort(5001))

  t.context = {
    container,
    mf: getMiniflare()
  }
})

test.beforeEach(async (t) => {
  t.context = {
    ...t.context,
    mf: getMiniflare()
  }
})

test.after(async (t) => {
  await t.context.container?.stop()
})

test('Returns 403 when requested CID is recorded as malicious', async (t) => {
  const { mf } = t.context
  const cid = 'bafkreibx45dh23bkcli5qxevg2zq5pa7dbzpdd45h4uugk6qgjlyifulj4'

  const res = await mf.dispatchFetch(`https://${cid}.ipfs.localhost:8787`)
  t.is(res.status, 403)
  t.is(await res.text(), 'malicious')
})

test('Returns 403 when requested resource CID is recorded as malicious', async (t) => {
  const { mf } = t.context
  const cid = 'bafybeiaekuoonpqpmems3uapy27zsas5p6ylku53lzkaufnvt4s5n6a7au'

  const res = await mf.dispatchFetch(`https://${cid}.ipfs.localhost:8787/malware.txt`)
  t.is(res.status, 403)
  t.is(await res.text(), 'malicious')
})

test('Request cid-verifier to validate response when HTML file is requested with root cid+path', async (t) => {
  const { mf } = t.context
  const htmlDirectoryRootCid = 'bafybeiaekuoonpqpmems3uapy27zsas5p6ylku53lzkaufnvt4s5n6a7au'

  const res = await mf.dispatchFetch(`https://${htmlDirectoryRootCid}.ipfs.localhost:8787/sample.html`)
  t.is(res.status, 200)
  t.is(res.headers.get('Content-Type'), 'text/html')

  // Validate call in progress to verify CID
  const TEST_NAMESPACE = await mf.getKVNamespace('TEST_NAMESPACE')

  const kvKey = `${htmlDirectoryRootCid}/test.lock`
  await pWaitFor(async () => {
    const value = await TEST_NAMESPACE.get(kvKey)
    return value === 'LOCK'
  }, { timeout: 1000 })
})

test('Request cid-verifier to validate response when HTML file is requested with resource cid', async (t) => {
  const { mf } = t.context
  const htmlResourceCid = 'bafkreib6uzgr2noyzup3uuqcp6gafddnx6n3iinkyflbrkhdhfpcoggc5u'

  const res = await mf.dispatchFetch(`https://${htmlResourceCid}.ipfs.localhost:8787`)
  t.is(res.status, 200)
  t.true(res.headers.get('Content-Type')?.includes('text/html'))

  // Validate call in progress to verify CID
  const TEST_NAMESPACE = await mf.getKVNamespace('TEST_NAMESPACE')

  const kvKey = `${htmlResourceCid}/test.lock`
  await pWaitFor(async () => {
    const value = await TEST_NAMESPACE.get(kvKey)
    return value === 'LOCK'
  }, { timeout: 1000 })
})
