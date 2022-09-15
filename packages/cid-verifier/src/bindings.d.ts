import Toucan from "toucan-js";
import { Logging } from "@web3-storage/worker-utils/loki";

export {};

export interface EnvInput {
  ENV: string;
  DEBUG: string;
  GOOGLE_EVALUATE_SAFE_CONFIDENCE_LEVELS: Array<string>;
  GOOGLE_CLOUD_API_URL: string;
  GOOGLE_CLOUD_API_KEY: string;
  IPFS_GATEWAY_TLD: string;
  SENTRY_DSN?: string;
  LOKI_URL?: string;
  LOKI_TOKEN?: string;
  DENYLIST: KVNamespace;
  CID_VERIFIER_RESULTS: KVNamespace;
}

export interface EnvTransformed {
  VERSION: string;
  BRANCH: string;
  COMMITHASH: string;
  SENTRY_RELEASE: string;
  sentry?: Toucan;
  log: Logging;
}

export type Env = EnvInput & EnvTransformed;

export interface GoogleEvaluateAPIResultScore {
  threatType: 'THREAT_TYPE_UNSPECIFIED' | 'SOCIAL_ENGINEERING' | 'UNWANTED_SOFTWARE' | 'MALWARE';
  confidenceLevel: 'CONFIDENCE_LEVEL_UNSPECIFIED' | 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH' | 'EXTREMELY_HIGH';
}

export interface GoogleEvaluateAPIResult {
  scores: Array<GoogleEvaluateAPIResultScore>;
}

declare global {
  const BRANCH: string;
  const VERSION: string;
  const COMMITHASH: string;
  const SENTRY_RELEASE: string;
  const ENV: string;
}
