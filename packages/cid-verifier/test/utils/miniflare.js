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
    bindings: {
      BASIC_AUTH_TOKENS: [
        // echo -n 'foo:foo' | base64
        'Zm9vOmZvbw==',
        // echo -n 'zoo:zoo' | base64
        'em9vOnpvbw=='
      ]
    }
  })
}
