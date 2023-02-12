import anyTest from 'ava'

import { globals } from './worker-globals.js'
export * from './miniflare.js'

/**
 * @typedef {import('miniflare').Miniflare} Miniflare
 *
 * @typedef {Object} Context
 * @property {Miniflare} mf
 * @property {string} [token]
 * @property {import('undici').MockAgent} [fetchMock]
 *
 * @typedef {import('ava').TestInterface<Context>} TestFn
 */

export const test = /** @type {TestFn} */ (anyTest)

export async function createTestToken () {
  const token = globals.SECRET

  return token
}
