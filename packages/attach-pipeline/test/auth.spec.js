import {
  test,
  createTestToken,
  getMiniflare
} from './utils/setup.js'

test.beforeEach(async (t) => {
  // Create a new Miniflare environment for each test
  t.context = {
    mf: getMiniflare()
  }
})

test('Fails with 401 authentication when no token provided', async (t) => {
  const { mf } = t.context

  const response = await mf.dispatchFetch('https://localhost:8787', {
    method: 'POST'
  })
  t.is(response.status, 401)
})

test('Fails with 401 authentication when invalid token provided', async (t) => {
  const { mf } = t.context
  const token = await createTestToken()

  const response = await mf.dispatchFetch('https://localhost:8787', {
    method: 'POST',
    headers: { Authorization: `${token}` } // Not Basic /token/
  })
  t.is(response.status, 401)
})
