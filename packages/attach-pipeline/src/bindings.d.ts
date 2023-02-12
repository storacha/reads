import Toucan from 'toucan-js'
import { Logging } from '@web3-storage/worker-utils/loki'

export {}

export interface EnvInput {
  ENV: string
  DEBUG: string
  SECRET: string
  ATTACH_PIPELINE_SECRET: string
  SENTRY_DSN?: string
  LOKI_URL?: string
  LOKI_TOKEN?: string
  ATTACH_PIPELINE_QUEUE: Queue
  CARPARK: R2Bucket
}

export interface EnvTransformed {
  VERSION: string
  BRANCH: string
  COMMITHASH: string
  SENTRY_RELEASE: string
  sentry?: Toucan
  log: Logging
}

export type Env = EnvInput & EnvTransformed

declare global {
  const BRANCH: string
  const VERSION: string
  const COMMITHASH: string
  const SENTRY_RELEASE: string
  const ENV: string
}

// Temporary Queue types while not in https://github.com/cloudflare/workers-types/blob/master/index.d.ts
// These come from https://github.com/cloudflare/miniflare/blob/4c1bfdb8e4da7fa87ec69fcc28531b894b858693/packages/shared/src/queues.ts
export const kGetConsumer = Symbol("kGetConsumer");
export const kSetConsumer = Symbol("kSetConsumer");

export type QueueEventDispatcher = (batch: MessageBatch) => Promise<void>;

export interface QueueBroker {
  getOrCreateQueue(name: string): Queue;

  setConsumer(queue: Queue, consumer: Consumer): void;
}

export interface Consumer {
  queueName: string;
  maxBatchSize: number;
  maxWaitMs: number;
  dispatcher: QueueEventDispatcher;
}

// External types (exposed to user code):
export type MessageSendOptions = {
  // Reserved
};

export type MessageSendRequest<Body = unknown> = {
  body: Body;
} & MessageSendOptions;

export interface Queue<Body = unknown> {
  send(message: Body, options?: MessageSendOptions): Promise<void>;
  sendBatch(batch: Iterable<MessageSendRequest<Body>>): Promise<void>;

  [kSetConsumer](consumer: Consumer): void;
  [kGetConsumer](): Consumer | null;
}

export interface Message<Body = unknown> {
  readonly id: string;
  readonly timestamp: Date;
  readonly body: Body;
  retry(): void;
}

export interface MessageBatch<Body = unknown> {
  readonly queue: string;
  readonly messages: Message<Body>[];
  retryAll(): void;
}
