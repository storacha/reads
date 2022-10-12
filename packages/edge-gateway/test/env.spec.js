import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import git from 'git-rev-sync'

import {
  DEFAULT_RACE_L1_GATEWAYS,
  DEFAULT_RACE_L2_GATEWAYS
} from '../src/constants.js'
import { test, getMiniflare } from './utils/setup.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pkg = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8')
)

// Create a new Miniflare environment for each test
test.before((t) => {
  t.context = {
    mf: getMiniflare()
  }
})

test('Defaults to hardcoded gateways if invalid secrets are set', async (t) => {
  const mf = getMiniflare({
    IPFS_GATEWAYS_RACE_L1: 'invalid gateways value',
    IPFS_GATEWAYS_RACE_L2: '["no-url"]'
  })

  const response = await mf.dispatchFetch('http://localhost:8787/version')
  const { version, commit, branch, raceGatewaysL1, raceGatewaysL2 } = await response.json()

  t.is(version, pkg.version)
  t.is(commit, git.long(__dirname))
  t.is(branch, git.branch(__dirname))
  t.deepEqual(raceGatewaysL1, DEFAULT_RACE_L1_GATEWAYS)
  t.deepEqual(raceGatewaysL2, DEFAULT_RACE_L2_GATEWAYS)
})
