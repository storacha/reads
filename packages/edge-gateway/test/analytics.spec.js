import { test, getMiniflare } from './utils/setup.js'
import { addFixtures } from './utils/fixtures.js'
import { GenericContainer, Wait } from 'testcontainers'

import { RESOLUTION_LAYERS } from '../src/constants.js'

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

test.beforeEach((t) => {
  t.context = {
    ...t.context,
    mf: getMiniflare()
  }
})

test.after(async (t) => {
  await t.context.container?.stop()
})

test('Gets content from first tier gateway race', async (t) => {
  const { mf } = t.context

  const response = await mf.dispatchFetch(
    'https://bafkreihl44bu5rqxctfvl3ahcln7gnjgmjqi7v5wfwojqwriqnq7wo4n7u.ipfs.localhost:8787'
  )
  await response.waitUntil()

  // Validate x-dotstorage headers
  t.assert(response.headers.get('x-dotstorage-resolution-id'))
  t.is(response.headers.get('x-dotstorage-resolution-layer'), 'public-race-l1')

  const bindings = await mf.getBindings()

  // Validate Analytics Engine Events
  /** @type {Map<string,import('../src/bindings').AnalyticsEngineEvent>} */
  const analyticsWinnerStore = bindings.PUBLIC_RACE_WINNER._store
  /** @type {Map<string,import('../src/bindings').AnalyticsEngineEvent>} */
  const analyticsTtfbStore = bindings.PUBLIC_RACE_TTFB._store
  /** @type {Map<string,import('../src/bindings').AnalyticsEngineEvent>} */
  const analyticsStatusCodeStore = bindings.PUBLIC_RACE_STATUS_CODE._store

  // Events
  const analyticsWinnerEvents = Array.from(analyticsWinnerStore.values())
  const analyticsTtfbEvents = Array.from(analyticsTtfbStore.values())
  const analyticsStatusCodeEvents = Array.from(
    analyticsStatusCodeStore.values()
  )

  // Number of winner events: 1
  t.is(analyticsWinnerEvents.length, 1)
  // Number of ttfb/status code events: 1
  t.is(analyticsTtfbEvents.length, 1)
  t.is(analyticsStatusCodeEvents.length, 1)

  // Winner selected
  t.is(
    analyticsWinnerEvents[0].blobs?.includes(
      response.headers.get('x-dotstorage-resolution-id')
    ),
    true
  )

  // Number of status code events with status code 200
  t.is(
    analyticsStatusCodeEvents.filter((event) => event.blobs?.includes('200'))
      .length,
    bindings.ipfsGatewaysL1.length
  )
})

test('Gets content from second tier gateway race', async (t) => {
  const mf = getMiniflare({
    IPFS_GATEWAYS_RACE_L1: '["http://localhost:9083"]',
    IPFS_GATEWAYS_RACE_L2: '["http://localhost:9082", "http://127.0.0.1:9081"]'
  })

  // Only :9081 will be able to resolve this
  const response = await mf.dispatchFetch(
    'https://bafkreifbh4or5yoti7bahifd3gwx5m2qiwmrvpxsx3nsquf7r4wwkiruve.ipfs.localhost:8787'
  )
  await response.waitUntil()

  // Validate x-dotstorage headers
  t.assert(response.headers.get('x-dotstorage-resolution-id'))
  t.is(response.headers.get('x-dotstorage-resolution-layer'), 'public-race-l2')

  const bindings = await mf.getBindings()

  // Validate Analytics Engine Events
  /** @type {Map<string,import('../src/bindings').AnalyticsEngineEvent>} */
  const analyticsWinnerStore = bindings.PUBLIC_RACE_WINNER._store
  /** @type {Map<string,import('../src/bindings').AnalyticsEngineEvent>} */
  const analyticsTtfbStore = bindings.PUBLIC_RACE_TTFB._store
  /** @type {Map<string,import('../src/bindings').AnalyticsEngineEvent>} */
  const analyticsStatusCodeStore = bindings.PUBLIC_RACE_STATUS_CODE._store

  // Events
  const analyticsWinnerEvents = Array.from(analyticsWinnerStore.values())
  const analyticsTtfbEvents = Array.from(analyticsTtfbStore.values())
  const analyticsStatusCodeEvents = Array.from(
    analyticsStatusCodeStore.values()
  )

  // Number of winner events: 1
  t.is(analyticsWinnerEvents.length, 1)

  // Number of ttfb/status code events: 2/3 (first gateway returns 524, so no TTFB)
  t.is(analyticsTtfbEvents.length, 2)
  t.is(analyticsStatusCodeEvents.length, 3)

  // Winner selected
  t.is(
    analyticsWinnerEvents[0].blobs?.includes(
      response.headers.get('x-dotstorage-resolution-id')
    ),
    true
  )

  // Number of status code events with status code 200
  t.is(
    analyticsStatusCodeEvents.filter((event) => event.blobs?.includes('200'))
      .length,
    2
  )
})

test('Only tracks analytics for race events', async (t) => {
  const { mf } = t.context
  // Perma cached URL
  const url =
    'https://bafybeic2hr75ukgwhnasdl3sucxyfedfyp3dijq3oakzx6o24urcs4eige.ipfs.localhost:8787/'

  const response = await mf.dispatchFetch(url, {
    headers: { 'Cache-Control': 'only-if-cached' }
  })
  await response.waitUntil()

  // Validate x-dotstorage headers
  t.is(
    response.headers.get('x-dotstorage-resolution-layer'),
    RESOLUTION_LAYERS.CDN
  )

  const bindings = await mf.getBindings()

  // Validate Analytics Engine Events
  const analyticsWinnerStore = bindings.PUBLIC_RACE_WINNER._store
  const analyticsTtfbStore = bindings.PUBLIC_RACE_TTFB._store
  const analyticsStatusCodeStore = bindings.PUBLIC_RACE_STATUS_CODE._store

  // Number of events: 0
  t.is(Array.from(analyticsWinnerStore.values()).length, 0)
  t.is(Array.from(analyticsTtfbStore.values()).length, 0)
  t.is(Array.from(analyticsStatusCodeStore.values()).length, 0)
})
