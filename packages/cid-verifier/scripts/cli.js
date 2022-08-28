#!/usr/bin/env node

import sade from 'sade'

import { buildCmd } from './build.js'
import { heartbeatCmd } from './heartbeat.js'

const env = process.env.ENV || 'dev'
const prog = sade('cid-verifier')

prog
  .command('build')
  .describe('Build the worker.')
  .option('--env', 'Environment', env)
  .action(buildCmd)
  .command('heartbeat', 'Ping opsgenie heartbeat')
  .option('--token', 'Opsgenie Token')
  .option('--name', 'Heartbeat Name')
  .action(heartbeatCmd)

prog.parse(process.argv)
