import { test } from './utils/setup.js'
import { addFixtures } from './utils/fixtures.js'
import { Headers } from '@web-std/fetch'
import { GenericContainer, Wait } from 'testcontainers'
import pDefer from 'p-defer'
import pSettle from 'p-settle'
import * as Link from 'multiformats/link'
import { createGatewayRacer } from '../lib/index.js'
import { ABORT_CODE, TIMEOUT_CODE } from '../lib/constants.js'
import { bigData } from './mocks/fixtures.js'

test.before(async (t) => {
  const container = await new GenericContainer('ipfs/go-ipfs:v0.13.0')
    .withExposedPorts(
      8080, 5001
    )
    .withWaitStrategy(Wait.forLogMessage('Daemon is ready'))
    .start()

  // Add fixtures
  await addFixtures(container.getMappedPort(5001))

  const gateways = [`http://127.0.0.1:${container.getMappedPort(8080)}`, 'http://127.0.0.1:9082', 'http://127.0.0.1:9083']
  t.context = {
    container,
    gateways,
    gwRacer: createGatewayRacer(gateways)
  }
})

test.after(async (t) => {
  await t.context.container.stop()
})

test('Gets response from cid only', async (t) => {
  const { gwRacer } = t.context

  const cid = Link.parse('bafkreihl44bu5rqxctfvl3ahcln7gnjgmjqi7v5wfwojqwriqnq7wo4n7u')
  const response = await gwRacer.get(cid)

  t.assert(response)
  t.is(response.status, 200)
  t.is(response.headers.get('content-length'), '23')
  t.is(await response.text(), 'Hello dot.storage! 😎')
})

// Results in HEAD request, and then multiple byte-range GET requests.
// The mock ipfs.io gateway implements this for the `bigData` CID.
test('Gets response from cid only (big data)', async (t) => {
  const { gwRacer } = t.context

  const cid = Link.parse(bigData.cid)
  const response = await gwRacer.get(cid)

  t.assert(response)
  t.is(response.status, 200)
  t.is(response.headers.get('content-length'), bigData.bytes.length.toString())
  t.is(await response.text(), new TextDecoder().decode(bigData.bytes))
})

test('Gets response from cid and pathname', async (t) => {
  const { gwRacer } = t.context

  const cid = Link.parse('bafybeih74zqc6kamjpruyra4e4pblnwdpickrvk4hvturisbtveghflovq')
  const pathname = '/path'
  const response = await gwRacer.get(cid, { pathname })

  t.is(response.status, 200)
  t.is(response.headers.get('content-length'), '35')
  t.is(await response.text(), 'Hello gateway.nft.storage resource!')
})

/**
 * Return on a 304 (from upstream or directly from our cache) where a
 * valid `if-none-match: <cid>` header is sent on the request.
 *
 * An agent will send `if-none-match: <cid>` when they previously requested
 * the content and we provided the cid as an etag on the response.
 *
 * > The If-None-Match HTTP request header makes the request conditional...
 * > When the condition fails for GET and HEAD methods, then the server
 * > must return HTTP status code 304 (Not Modified)
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/If-None-Match
 */
test('Gets 304 response from cid and valid if-none-match header', async (t) => {
  const { gwRacer } = t.context
  const cid = Link.parse('bafkreidwgoyc2f7n5vmwbcabbckwa6ejes4ujyncyq6xec5gt5nrm5hzga')
  const headers = new Headers({ 'if-none-match': `"${cid}"` })
  const response = await gwRacer.get(cid, { headers })

  t.assert(response)
  t.is(response.status, 304)
  t.is(await response.text(), '', '304 body should be empty')
})

test('Aborts other race contestants once there is a winner', async (t) => {
  const { gwRacer } = t.context
  const defer = pDefer()
  t.plan(5)

  const cid = Link.parse('bafkreihl44bu5rqxctfvl3ahcln7gnjgmjqi7v5wfwojqwriqnq7wo4n7u')
  const response = await gwRacer.get(cid, {
    onRaceEnd: async (gwRequests, winnerGwResponse) => {
      t.assert(winnerGwResponse)
      const responses = await pSettle(gwRequests)

      t.is(responses.filter(r => !!r.isFulfilled).length, gwRequests.length)
      // @ts-ignore Property 'value' does not exist on type 'PromiseRejectedResult'
      t.is(responses.filter(r => r.value?.response).length, 1)
      // @ts-ignore Property 'value' does not exist on type 'PromiseRejectedResult'
      t.is(responses.filter(r => r.value?.aborted && r.value?.reason === ABORT_CODE).length, gwRequests.length - 1)
      defer.resolve()
    }
  })

  t.is(response.status, 200)
  await defer.promise
})

test('Disables abort of other race contestants once there is a winner', async (t) => {
  const { gwRacer } = t.context
  const defer = pDefer()
  t.plan(5)

  const cid = Link.parse('bafkreihl44bu5rqxctfvl3ahcln7gnjgmjqi7v5wfwojqwriqnq7wo4n7u')
  const response = await gwRacer.get(cid, {
    onRaceEnd: async (gwRequests, winnerGwResponse) => {
      t.assert(winnerGwResponse)
      const responses = await pSettle(gwRequests)

      t.is(responses.filter(r => r.isFulfilled).length, gwRequests.length)
      // @ts-ignore Property 'value' does not exist on type 'PromiseRejectedResult'
      t.is(responses.filter(r => r.value?.response).length, gwRequests.length)
      // @ts-ignore Property 'value' does not exist on type 'PromiseRejectedResult'
      t.is(responses.filter(r => r.value?.aborted && r.value?.reason === ABORT_CODE).length, 0)
      defer.resolve()
    },
    noAbortRequestsOnWinner: true
  })

  t.is(response.status, 200)
  await defer.promise
})

test('Can abort other race contestants only after all promises are resolved and read winner', async (t) => {
  const { gwRacer, gateways } = t.context
  const defer = pDefer()
  t.plan(3)

  /** @type {Record<string, AbortSignal>} */
  const gatewaySignals = {}
  /** @type {Record<string, AbortController>} */
  const gatewayControllers = {}
  gateways.forEach(gateway => {
    const abortController = new AbortController()
    gatewayControllers[gateway] = abortController
    gatewaySignals[gateway] = abortController.signal
  })

  const cid = Link.parse('bafkreihl44bu5rqxctfvl3ahcln7gnjgmjqi7v5wfwojqwriqnq7wo4n7u')
  const response = await gwRacer.get(cid, {
    onRaceEnd: async (gwRequests, winnerGwResponse) => {
      t.assert(winnerGwResponse)

      // Wait for all request promises to fulfill
      await pSettle(gwRequests)

      // Abort all on going requests except for the winner
      for (const [gatewayUrl, controller] of Object.entries(gatewayControllers)) {
        if (winnerGwResponse?.url !== gatewayUrl) {
          controller.abort()
        }
      }

      defer.resolve()
    },
    noAbortRequestsOnWinner: true,
    gatewaySignals
  })

  t.is(response.status, 200)
  await defer.promise

  // Can still read winner response after other race contestants are aborted
  t.is(await response.text(), 'Hello dot.storage! 😎')
})

test('A subset of gateways in the race can fail', async t => {
  const defer = pDefer()
  t.plan(5)
  const { gwRacer } = t.context

  // gateway[1] and gateway[2] will not be able to resolve this
  const cid = Link.parse('bafkreifbh4or5yoti7bahifd3gwx5m2qiwmrvpxsx3nsquf7r4wwkiruve')

  const response = await gwRacer.get(cid, {
    onRaceEnd: async (gwRequests, winnerGwResponse) => {
      t.assert(winnerGwResponse)
      const responses = await pSettle(gwRequests)

      t.is(responses.filter(r => r.isFulfilled).length, gwRequests.length)
      // @ts-ignore Property 'value' does not exist on type 'PromiseRejectedResult'
      t.is(responses.filter(r => r.value?.response).length, gwRequests.length)
      // @ts-ignore Property 'value' does not exist on type 'PromiseRejectedResult'
      t.is(responses.filter(r => r.value?.response.status === 200).length, 1)
      defer.resolve()
    },
    noAbortRequestsOnWinner: true
  })

  t.is(response.status, 200)
  await defer.promise
})

test('Can decrease race timeout to not have winner', async t => {
  const defer = pDefer()
  t.plan(6)
  const gwRacer = createGatewayRacer(
    // only race the slow one.
    ['http://localhost:9082', 'http://localhost:9082'],
    { timeout: 10 }
  )

  // gateway[1] delays 300ms before resolving this
  const cid = Link.parse('bafkreibehzafi6gdvlyue5lzxa3rfobvp452kylox6f4vwqpd4xbr53uqu')

  const error = await t.throwsAsync(async () => {
    await gwRacer.get(cid, {
      onRaceEnd: async (gwRequests, winnerGwResponse) => {
        t.is(winnerGwResponse, undefined)
        const responses = await pSettle(gwRequests)

        t.is(responses.filter(r => !!r.isFulfilled).length, gwRequests.length)
        // @ts-ignore Property 'value' does not exist on type 'PromiseRejectedResult'
        t.is(responses.filter(r => r.value?.response).length, 0)
        // @ts-ignore Property 'value' does not exist on type 'PromiseRejectedResult'
        t.is(responses.filter(r => r.value?.aborted && r.value?.reason === TIMEOUT_CODE).length, gwRequests.length)
        defer.resolve()
      },
      noAbortRequestsOnWinner: true
    })
  })

  // @ts-ignore our error has status code
  t.not(error.status, 200)
  await defer.promise
})
