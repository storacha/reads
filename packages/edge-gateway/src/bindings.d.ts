import Toucan from 'toucan-js'
import { Logging } from '@web3-storage/worker-utils/loki'
import { IpfsGatewayRacer } from 'ipfs-gateway-race'

export {}

// CF Analytics Engine types not available yet
export interface AnalyticsEngine {
  writeDataPoint(event: AnalyticsEngineEvent): void
}

export interface AnalyticsEngineEvent {
  readonly doubles?: number[]
  readonly blobs?: (ArrayBuffer | string | null)[]
}

export interface EnvInput {
  ENV: string
  DEBUG: string
  CID_VERIFIER_AUTHORIZATION_TOKEN: string
  CID_VERIFIER_ENABLED: string
  CID_VERIFIER_URL: string
  CID_VERIFIER: Fetcher
  CDN_GATEWAYS_RACE: string
  DENYLIST: Fetcher
  DENYLIST_URL: string
  IPFS_GATEWAYS_RACE_L1: string
  IPFS_GATEWAYS_RACE_L2: string
  GATEWAY_HOSTNAME: string
  EDGE_GATEWAY_API_URL: string
  REQUEST_TIMEOUT?: number
  SENTRY_DSN?: string
  LOKI_URL?: string
  LOKI_TOKEN?: string
  DENYLIST: KVNamespace
  API: Fetcher
  PUBLIC_RACE_WINNER: AnalyticsEngine
  PUBLIC_RACE_TTFB: AnalyticsEngine
  PUBLIC_RACE_STATUS_CODE: AnalyticsEngine
}

export interface EnvTransformed {
  VERSION: string
  BRANCH: string
  COMMITHASH: string
  SENTRY_RELEASE: string
  REQUEST_TIMEOUT: number
  IPFS_GATEWAY_HOSTNAME: string
  IPNS_GATEWAY_HOSTNAME: string
  cdnGateways: Array<string>
  ipfsGatewaysL1: Array<string>
  ipfsGatewaysL2: Array<string>
  sentry?: Toucan
  log: Logging
  gwRacerL1: IpfsGatewayRacer
  gwRacerL2: IpfsGatewayRacer
  startTime: number
  isCidVerifierEnabled: boolean
}

export type Env = EnvInput & EnvTransformed

declare global {
  const BRANCH: string
  const VERSION: string
  const COMMITHASH: string
  const SENTRY_RELEASE: string
  const ENV: string
}
