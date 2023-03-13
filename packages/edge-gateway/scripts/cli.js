#!/usr/bin/env node

import sade from 'sade'

import { buildCmd } from './build.js'
import { ipfsCmd } from './ipfs.js'
import { heartbeatCmd } from './heartbeat.js'

const env = process.env.ENV || 'dev'
const prog = sade('edge-gateway')

prog
  .command('build')
  .describe('Build the worker.')
  .option('--env', 'Environment', env)
  .action(buildCmd)
  .command('ipfs')
  .describe('Run ipfs node')
  .option('--start', 'Start docker container', false)
  .option('--stop', 'Stop and clean all dockers artifacts', false)
  .action(ipfsCmd)
  .command('heartbeat', 'Ping opsgenie heartbeat')
  .option('--token', 'Opsgenie Token')
  .option('--name', 'Heartbeat Name')
  .action(heartbeatCmd)

prog.parse(process.argv)
