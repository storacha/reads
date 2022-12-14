import fs from 'fs'
import path from 'path'
import { Miniflare } from 'miniflare'

export const secrets = {
  IPFS_GATEWAYS_RACE_L1: '["http://127.0.0.1:9081"]',
  IPFS_GATEWAYS_RACE_L2: '["http://localhost:9082", "http://localhost:9083"]',
  CID_VERIFIER_AUTHORIZATION_TOKEN: 'em9vOnpvbw=='
}

export function getMiniflare (bindings = {}) {
  let envPath = path.join(process.cwd(), '../../.env')
  if (!fs.statSync(envPath, { throwIfNoEntry: false })) {
    // @ts-ignore
    envPath = true
  }

  return new Miniflare({
    envPath,
    scriptPath: 'dist/worker.js',
    port: 8788,
    packagePath: true,
    wranglerConfigPath: true,
    // We don't want to rebuild our worker for each test, we're already doing
    // it once before we run all tests in package.json, so disable it here.
    // This will override the option in wrangler.toml.
    buildCommand: undefined,
    wranglerConfigEnv: 'test',
    modules: true,
    mounts: {
      api: {
        scriptPath: './test/utils/scripts/api.js',
        modules: true
      },
      cid_verifier: {
        scriptPath: './test/utils/scripts/cid-verifier.js',
        modules: true,
        kvNamespaces: ['TEST_NAMESPACE']
      }
    },
    serviceBindings: {
      API: 'api',
      CID_VERIFIER: 'cid_verifier'
    },
    bindings: {
      PUBLIC_RACE_WINNER: createAnalyticsEngine(),
      PUBLIC_RACE_TTFB: createAnalyticsEngine(),
      PUBLIC_RACE_STATUS_CODE: createAnalyticsEngine(),
      REQUEST_TIMEOUT: 3000,
      ...secrets,
      ...bindings
    }
  })
}

export function createAnalyticsEngine () {
  /** @type {Map<string,import('../../src/bindings').AnalyticsEngineEvent>} */
  const store = new Map()

  return {
    writeDataPoint: (
      /** @type {import('../../src/bindings').AnalyticsEngineEvent} */ event
    ) => {
      store.set(
        `${Date.now()}${(Math.random() + 1).toString(36).substring(7)}`,
        event
      )
    },
    _store: store
  }
}
