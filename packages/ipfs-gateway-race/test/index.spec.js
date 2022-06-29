import { test } from './utils/setup.js'
import pDefer from 'p-defer'
import pSettle from 'p-settle'

import { createGatewayRacer } from '../lib/index.js'
import { ABORT_ON_END_CODE, TIMEOUT_CODE } from '../lib/constants.js'

test.before((t) => {
  t.context = {
    gwRacer: createGatewayRacer(
      ['http://127.0.0.1:9081', 'http://localhost:9082', 'http://localhost:9083']
    )
  }
})

test('Gets response from cid only', async (t) => {
  const { gwRacer } = t.context

  const cid = 'bafkreihl44bu5rqxctfvl3ahcln7gnjgmjqi7v5wfwojqwriqnq7wo4n7u'
  const response = await gwRacer.get(cid)

  t.assert(response)
  t.is(response.status, 200)
  t.is(response.headers.get('content-length'), '23')
  t.is(await response.text(), 'Hello dot.storage! 😎')
})

test('Gets response from cid and pathname', async (t) => {
  const { gwRacer } = t.context

  const cid = 'bafybeih74zqc6kamjpruyra4e4pblnwdpickrvk4hvturisbtveghflovq'
  const pathname = '/path'
  const response = await gwRacer.get(cid, { pathname })

  t.is(response.status, 200)
  t.is(response.headers.get('content-length'), '35')
  t.is(await response.text(), 'Hello gateway.nft.storage resource!')
})

test('Aborts other race contestants once there is a winner', async (t) => {
  const { gwRacer } = t.context
  const defer = pDefer()
  t.plan(5)

  const cid = 'bafkreihl44bu5rqxctfvl3ahcln7gnjgmjqi7v5wfwojqwriqnq7wo4n7u'
  const response = await gwRacer.get(cid, {
    onRaceEnd: async (gwRequests, winnerGwResponse) => {
      t.assert(winnerGwResponse)
      const responses = await pSettle(gwRequests)

      t.is(responses.filter(r => !!r.isFulfilled).length, gwRequests.length)
      // @ts-ignore Property 'value' does not exist on type 'PromiseRejectedResult'
      t.is(responses.filter(r => r.value?.response).length, 1)
      // @ts-ignore Property 'value' does not exist on type 'PromiseRejectedResult'
      t.is(responses.filter(r => r.value?.aborted && r.value?.reason === ABORT_ON_END_CODE).length, gwRequests.length - 1)
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

  const cid = 'bafkreihl44bu5rqxctfvl3ahcln7gnjgmjqi7v5wfwojqwriqnq7wo4n7u'
  const response = await gwRacer.get(cid, {
    onRaceEnd: async (gwRequests, winnerGwResponse) => {
      t.assert(winnerGwResponse)
      const responses = await pSettle(gwRequests)

      t.is(responses.filter(r => !!r.isFulfilled).length, gwRequests.length)
      // @ts-ignore Property 'value' does not exist on type 'PromiseRejectedResult'
      t.is(responses.filter(r => r.value?.response).length, gwRequests.length)
      // @ts-ignore Property 'value' does not exist on type 'PromiseRejectedResult'
      t.is(responses.filter(r => r.value?.aborted && r.value?.reason === ABORT_ON_END_CODE).length, 0)
      defer.resolve()
    },
    notAbortRaceContestantsOnWinner: true
  })

  t.is(response.status, 200)
  await defer.promise
})

test('A subset of gateways in the race can fail', async t => {
  const defer = pDefer()
  t.plan(5)
  const { gwRacer } = t.context

  // gateway[1] will not be able to resolve this
  const cid = 'bafkreifbh4or5yoti7bahifd3gwx5m2qiwmrvpxsx3nsquf7r4wwkiruve'

  const response = await gwRacer.get(cid, {
    onRaceEnd: async (gwRequests, winnerGwResponse) => {
      t.assert(winnerGwResponse)
      const responses = await pSettle(gwRequests)

      t.is(responses.filter(r => !!r.isFulfilled).length, gwRequests.length)
      // @ts-ignore Property 'value' does not exist on type 'PromiseRejectedResult'
      t.is(responses.filter(r => r.value?.response).length, gwRequests.length)
      // @ts-ignore Property 'value' does not exist on type 'PromiseRejectedResult'
      t.is(responses.filter(r => r.value?.response.status === 200).length, gwRequests.length - 1)
      defer.resolve()
    },
    notAbortRaceContestantsOnWinner: true
  })

  t.is(response.status, 200)
  await defer.promise
})

test('Can decrease race timeout to not have winner', async t => {
  const defer = pDefer()
  t.plan(6)
  const gwRacer = createGatewayRacer(
    ['http://127.0.0.1:9081', 'http://localhost:9082', 'http://localhost:9083'],
    { timeout: 10 }
  )

  // gateway[1] delays 300ms before resolving this
  const cid = 'bafkreibehzafi6gdvlyue5lzxa3rfobvp452kylox6f4vwqpd4xbr53uqu'

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
      notAbortRaceContestantsOnWinner: true
    })
  })

  // @ts-ignore our error has status code
  t.not(error.status, 200)
  await defer.promise
})
