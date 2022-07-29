import fs from 'fs'
import path from 'path'
import { Miniflare } from 'miniflare'

export function getMiniflare () {
  let envPath = path.join(process.cwd(), '../../.env')
  if (!fs.statSync(envPath, { throwIfNoEntry: false })) {
    // @ts-ignore
    envPath = true
  }

  return new Miniflare({
    envPath,
    scriptPath: 'dist/worker.mjs',
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
      }
    },
    serviceBindings: {
      API: 'api'
    },
    bindings: {
      PUBLIC_RACE_WINNER: createAnalyticsEngine(),
      PUBLIC_RACE_TTFB: createAnalyticsEngine(),
      PUBLIC_RACE_STATUS_CODE: createAnalyticsEngine()
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
