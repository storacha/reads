import { test, getMiniflare } from './utils/setup.js'

test.before(async (t) => {
  const mf = getMiniflare()
  t.context = {
    mf
  }
})

test('GET /denylist fails with no Authorization header', async (t) => {
  const { mf } = t.context
  const response = await mf.dispatchFetch('http://localhost:8787/denylist?cid=never')
  t.is(response.status, 401)
})

test('GET /denylist fails with invalid Authorization header', async (t) => {
  const { mf } = t.context
  const response = await mf.dispatchFetch('http://localhost:8787/denylist?cid=never', { headers: { Authorization: '' } })
  t.is(response.status, 401)
})

test('GET /denylist fails with unknown Authorization credentials', async (t) => {
  const { mf } = t.context
  const response = await mf.dispatchFetch('http://localhost:8787/denylist?cid=never', { headers: { Authorization: 'basic asdfasdf' } })
  t.is(response.status, 401)
})
