import { createFetchMock } from '@miniflare/core'
import { Request } from 'miniflare'
import { test, getMiniflare, createTestToken } from './utils/setup.js'

// Create a new Miniflare environment for each test
test.beforeEach(async (t) => {
  const fetchMock = createFetchMock()
  const token = await createTestToken()
  const mf = getMiniflare({ fetchMock })

  t.context = {
    mf,
    token,
    // @ts-ignore TS different deps versions for undici
    fetchMock
  }
})

test('attach pipeline gateway errors if invalid content is provided', async (t) => {
  const { mf, token } = t.context
  if (!token) throw new Error()

  const response = await mf.dispatchFetch(
    new Request('http://localhost:8787', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${token}`,
        'content-type': 'text/html; charset=utf-8'
      }
    })
  )
  t.is(response.status, 400)
})

test('gateway errors if invalid URL is provided', async (t) => {
  const { mf, token } = t.context
  if (!token) throw new Error()

  const cars = {
    bafy0: 'https://cars.s3.amazonaws.com/bafy0/bafy0.car',
    bafy1: 'invalid_url'
  }

  const response = await mf.dispatchFetch(
    new Request('http://localhost:8787', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${token}`,
        'content-type': 'text/html; charset=utf-8'
      },
      body: JSON.stringify(cars)
    })
  )
  t.is(response.status, 400)
})

test('Gateway triggers queue handler', async (t) => {
  const { mf, token, fetchMock } = t.context
  if (!token || !fetchMock) throw new Error()

  const cars = {
    bafy0: 'https://cars.s3.amazonaws.com/bafy0/bafy0.car',
    bafy1: 'https://cars.s3.amazonaws.com/bafy1/bafy1.car',
    bafy2: 'https://cars.s3.amazonaws.com/bafy2/bafy2.car'
  }

  const response = await mf.dispatchFetch(
    new Request('http://localhost:8787', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${token}`,
        'content-type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(cars)
    })
  )
  t.is(response.status, 200)

  // TODO: Validate queue...
})
