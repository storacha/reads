import { base32 } from 'multiformats/bases/base32'
import { base16 } from 'multiformats/bases/base16'
import http from 'node:http'
import { test, getMiniflare } from './utils/setup.js'
import { addFixtures } from './utils/fixtures.js'
import { GenericContainer, Wait } from 'testcontainers'

import { createErrorHtmlContent } from '../src/errors.js'

test.before(async (t) => {
  const ucantoServer = http.createServer((req, res) => {
    if (req.method === 'POST') {
      res.setHeader('X-Proxied-By', 'TestUcantoServer')
      res.end()
    } else {
      res.statusCode = 405
      res.end('Method Not Allowed')
    }
  })
  await new Promise(resolve => ucantoServer.listen(8000, () => resolve(undefined)))

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

test.after(async (t) => {
  await t.context.container?.stop()
})

test('Fails when invalid cid is provided', async (t) => {
  const { mf } = t.context

  const invalidCid = 'bafy'
  const response = await mf.dispatchFetch(
    `https://${invalidCid}.ipfs.localhost:8787`
  )
  t.is(response.status, 400)

  const textResponse = await response.text()
  t.is(
    textResponse,
    createErrorHtmlContent(400, 'invalid CID: bafy: Unexpected end of data')
  )
})

test('Gets content', async (t) => {
  const { mf } = t.context

  const response = await mf.dispatchFetch(
    'https://bafkreihl44bu5rqxctfvl3ahcln7gnjgmjqi7v5wfwojqwriqnq7wo4n7u.ipfs.localhost:8787'
  )
  await response.waitUntil()
  t.is(await response.text(), 'Hello dot.storage! 😎')

  // Validate content headers
  t.is(response.headers.get('content-length'), '23')
  t.is(response.headers.get('x-dotstorage-anchor'), 'd13421337e80609a2aa9412ee646b4f6d6cb088cd9314bca313249896b2d19d0')

  // Validate x-dotstorage headers
  t.assert(
    response.headers.get('x-dotstorage-resolution-layer')
  )
  t.assert(response.headers.get('x-dotstorage-resolution-id'))
})

test('Gets content with query params', async (t) => {
  const { mf } = t.context

  const response = await mf.dispatchFetch(
    'https://bafkreibehzafi6gdvlyue5lzxa3rfobvp452kylox6f4vwqpd4xbr55uqu.ipfs.localhost:8787?foo=test'
  )
  await response.waitUntil()
  t.is(await response.text(), 'Hello dot.storage with query param foo=test! 😎😎😎')
})

test('Gets content with path', async (t) => {
  const { mf } = t.context

  const response = await mf.dispatchFetch(
    'https://bafybeih74zqc6kamjpruyra4e4pblnwdpickrvk4hvturisbtveghflovq.ipfs.localhost:8787/path'
  )
  t.is(await response.text(), 'Hello gateway.nft.storage resource!')

  // Validate content headers
  t.is(response.headers.get('content-length'), '35')
  t.is(response.headers.get('content-type'), 'text/plain; charset=utf-8')
  t.is(response.headers.get('x-dotstorage-anchor'), 'fd7c4bfd340f259e1276d8cbd61649ba02b3754fdba044f3bfdefa1bee680fc1')

  // Validate x-dotstorage headers
  t.assert(
    response.headers.get('x-dotstorage-resolution-layer')
  )
  t.assert(response.headers.get('x-dotstorage-resolution-id'))
})

test('Gets content with other base encodings', async (t) => {
  const { mf } = t.context

  const cidStr = 'bafkreihl44bu5rqxctfvl3ahcln7gnjgmjqi7v5wfwojqwriqnq7wo4n7u'
  const decodedB32 = base32.decode(cidStr)
  const encodedB16 = base16.encode(decodedB32)

  const response = await mf.dispatchFetch(
    `https://${encodedB16.toString()}.ipfs.localhost:8787`
  )
  await response.waitUntil()
  t.is(await response.text(), 'Hello dot.storage! 😎')
})

test('Gets response error when all fail to resolve', async (t) => {
  const { mf } = t.context

  const cidStr = 'bafkreibehzafi6gdvlyue5lzxa3rfobvp452kylox6f4vwqpd4xbr54uqu'

  const response = await mf.dispatchFetch(
    `https://${cidStr}.ipfs.localhost:8787`
  )
  await response.waitUntil()
  const body = await response.text()
  t.assert(body)
})

test('Gets shortcut 304 response when if-none-match request header sent', async (t) => {
  const { mf } = t.context
  const cidStr = 'bafkreidwgoyc2f7n5vmwbcabbckwa6ejes4ujyncyq6xec5gt5nrm5hzga'
  const response = await mf.dispatchFetch(`https://${cidStr}.ipfs.localhost:8787`, {
    headers: {
      'if-none-match': `"${cidStr}"`
    }
  })
  await response.waitUntil()
  t.is(response.status, 304)
  t.is(response.headers.get('etag'), `"${cidStr}"`)
  t.is(response.headers.get('x-dotstorage-resolution-layer'), 'shortcut')
  t.is(response.headers.get('x-dotstorage-resolution-id'), 'if-none-match')
  const body = await response.text()
  t.is(body, '')
})

test('Gets shortcut 304 response when if-none-match request header sent with weak etag', async (t) => {
  const { mf } = t.context
  const cidStr = 'bafkreidwgoyc2f7n5vmwbcabbckwa6ejes4ujyncyq6xec5gt5nrm5hzga'
  const response = await mf.dispatchFetch(`https://${cidStr}.ipfs.localhost:8787`, {
    headers: {
      'if-none-match': `W/"${cidStr}"`
    }
  })
  await response.waitUntil()
  t.is(response.status, 304)
  t.is(response.headers.get('etag'), `"${cidStr}"`)
  t.is(response.headers.get('x-dotstorage-resolution-layer'), 'shortcut')
  t.is(response.headers.get('x-dotstorage-resolution-id'), 'if-none-match')
  const body = await response.text()
  t.is(body, '')
})

test('No 304 response when if-none-match request header sent with weak bad etag', async (t) => {
  const { mf } = t.context
  const cidStr = 'bafkreidwgoyc2f7n5vmwbcabbckwa6ejes4ujyncyq6xec5gt5nrm5hzga'
  const response = await mf.dispatchFetch(`https://${cidStr}.ipfs.localhost:8787`, {
    headers: {
      'if-none-match': `W/"${cidStr.substring(cidStr.length - 2)}"`
    }
  })
  await response.waitUntil()
  t.not(response.status, 304)
  t.not(response.headers.get('x-dotstorage-resolution-layer'), 'shortcut')
  t.not(response.headers.get('x-dotstorage-resolution-id'), 'if-none-match')
})

test('Gets 304 response from upstream when if-none-match request header sent with path', async (t) => {
  const { mf } = t.context
  const root = 'bafybeiaekuoonpqpmems3uapy27zsas5p6ylku53lzkaufnvt4s5n6a7au'
  const child = 'bafkreib6uzgr2noyzup3uuqcp6gafddnx6n3iinkyflbrkhdhfpcoggc5u'
  const path = '/sample.html'
  const response = await mf.dispatchFetch(`https://${root}.ipfs.localhost:8787${path}`, {
    headers: {
      'if-none-match': `W/"${child}"`
    }
  })
  await response.waitUntil()
  t.is(response.status, 304)
  // TODO: why is etag not set on 304 response?
  // t.is(response.headers.get('etag'), `"${child}"`)
  t.not(response.headers.get('x-dotstorage-resolution-layer'), 'shortcut')
  t.not(response.headers.get('x-dotstorage-resolution-id'), 'if-none-match')
  const body = await response.text()
  t.is(body, '')
})

test('Proxies POST requests to the UCANTO Server', async t => {
  const res = await t.context.mf.dispatchFetch('http://localhost:8787', {
    method: 'POST',
    body: JSON.stringify({ key: 'value' })
  })

  t.is(res.headers.get('X-Proxied-By'), 'TestUcantoServer')
  t.true(res.ok)
})
