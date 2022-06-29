#!/usr/bin/env node
import sade from 'sade'

import { ipfsCmd } from './ipfs.js'

const prog = sade('ipfs-gateway-race')

prog
  .command('ipfs')
  .describe('Run ipfs node')
  .option('--start', 'Start docker container', false)
  .option('--stop', 'Stop and clean all dockers artifacts', false)
  .action(ipfsCmd)

prog.parse(process.argv)
