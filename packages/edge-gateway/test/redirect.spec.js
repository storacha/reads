import { test, getMiniflare } from './utils/setup.js'

const IPFS_GATEWAY_REDIRECT_HOSTNAME = 'dweb.link'

// Create a new Miniflare environment for each test
test.before((t) => {
  t.context = {
    mf: getMiniflare({
      IPFS_GATEWAY_REDIRECT_HOSTNAME
    })
  }
})

test('Redirects if redirect hostname set', async (t) => {
  const { mf } = t.context
  const url = 'https://bafkreihl44bu5rqxctfvl3ahcln7gnjgmjqi7v5wfwojqwriqnq7wo4n7u.ipfs.localhost:8787/'
  const response = await mf.dispatchFetch(url)

  t.is(response.status, 307)
  t.is(
    response.headers.get('location'),
    url.replace('localhost:8787', IPFS_GATEWAY_REDIRECT_HOSTNAME)
  )
})

test('Redirects if redirect hostname set with pathname', async (t) => {
  const { mf } = t.context
  const url = 'https://bafkreihl44bu5rqxctfvl3ahcln7gnjgmjqi7v5wfwojqwriqnq7wo4n7u.ipfs.localhost:8787/file.txt'
  const response = await mf.dispatchFetch(url)

  t.is(response.status, 307)
  t.is(
    response.headers.get('location'),
    url.replace('localhost:8787', IPFS_GATEWAY_REDIRECT_HOSTNAME)
  )
})

test('Redirects if redirect hostname set with query', async (t) => {
  const { mf } = t.context
  const url = 'https://bafkreihl44bu5rqxctfvl3ahcln7gnjgmjqi7v5wfwojqwriqnq7wo4n7u.ipfs.localhost:8787/?format=car'
  const response = await mf.dispatchFetch(url)

  t.is(response.status, 307)
  t.is(
    response.headers.get('location'),
    url.replace('localhost:8787', IPFS_GATEWAY_REDIRECT_HOSTNAME)
  )
})

test('Redirects if redirect hostname set with pathname and query', async (t) => {
  const { mf } = t.context
  const url = 'https://bafkreihl44bu5rqxctfvl3ahcln7gnjgmjqi7v5wfwojqwriqnq7wo4n7u.ipfs.localhost:8787/file.txt?format=car'
  const response = await mf.dispatchFetch(url)

  t.is(response.status, 307)
  t.is(
    response.headers.get('location'),
    url.replace('localhost:8787', IPFS_GATEWAY_REDIRECT_HOSTNAME)
  )
})

test('should get from cdn gateways race if they can resolve before redirecting', async (t) => {
  const url =
    'https://bafkreihl44bu5rqxctfvl3ahcln7gnjgmjqi7v5wfwojqwriqnq7wo4n7u.ipfs.localhost:8787'

  const mf = getMiniflare({
    CDN_GATEWAYS_RACE: '["http://localhost:9082"]',
    IPFS_GATEWAY_REDIRECT_HOSTNAME
  })

  const response = await mf.dispatchFetch(
    url
  )
  await response.waitUntil()
  t.is(await response.text(), 'Hello dot.storage! 😎')

  // Validate content headers
  t.is(response.headers.get('content-length'), '23')

  // Validate x-dotstorage headers
  t.is(response.headers.get('x-dotstorage-resolution-layer'), 'dotstorage-race')
  t.is(response.headers.get('x-dotstorage-resolution-id'), 'http://localhost:9082')
})
