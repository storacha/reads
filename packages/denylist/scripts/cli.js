#!/usr/bin/env node

import sade from 'sade'

import { buildCmd } from './build.js'
import { denylistSyncCmd, denylistAddCmd, denylistUpdateRemoteCmd } from './denylist.js'

const env = process.env.ENV || 'dev'
const prog = sade('denylist')

prog
  .command('build')
  .describe('Build the worker.')
  .option('--env', 'Environment', env)
  .action(buildCmd)
  .command('denylist sync')
  .describe('Sync the gateway deny list with various sources.')
  .option('--env', 'Wrangler environment to use.', env)
  .action(denylistSyncCmd)
  .command('denylist add <cid>')
  .describe(
    'Add a CID (or CID + path) to the local deny list. Note: we currently DO NOT support denying by CID + path in the API.'
  )
  .option('--status', 'HTTP status to send in response.')
  .option('--reason', 'Reason for deny. Note: may be communicated in response')
  .action(denylistAddCmd)
  .command('denylist update-remote <url>')
  .option('--env', 'Wrangler environment to use.', env)
  .option('--operation', 'Operation to be performed in the remote denylist for items in list ("add" or "del")', 'add')
  .describe(
    'Add the content of a given file to the remote deny list.'
  )
  .action(denylistUpdateRemoteCmd)

prog.parse(process.argv)
