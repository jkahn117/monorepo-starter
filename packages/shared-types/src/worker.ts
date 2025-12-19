/**
 * Cloudflare Workers-specific types
 */

/**
 * Worker environment bindings interface
 * Extend this interface in your worker's types.ts file
 */
export interface WorkerEnv {
  // Common bindings - extend in worker-specific types
  [key: string]: unknown;
}

/**
 * Worker execution context
 */
export interface WorkerContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

/**
 * Worker request context combining env and execution context
 */
export interface WorkerRequestContext<Env = WorkerEnv> {
  env: Env;
  ctx: WorkerContext;
}

/**
 * Scheduled event for cron triggers
 */
export interface ScheduledEvent {
  cron: string;
  scheduledTime: number;
  type: "scheduled";
}

/**
 * Queue message batch
 */
export interface QueueMessageBatch<Body = unknown> {
  queue: string;
  messages: Array<{
    id: string;
    timestamp: Date;
    body: Body;
  }>;
}

/**
 * Worker handler types
 */
export type FetchHandler<Env = WorkerEnv> = (
  request: Request,
  env: Env,
  ctx: WorkerContext,
) => Promise<Response> | Response;

export type ScheduledHandler<Env = WorkerEnv> = (
  event: ScheduledEvent,
  env: Env,
  ctx: WorkerContext,
) => Promise<void> | void;

export type QueueHandler<Env = WorkerEnv, Body = unknown> = (
  batch: QueueMessageBatch<Body>,
  env: Env,
  ctx: WorkerContext,
) => Promise<void> | void;

/**
 * Worker configuration
 */
export interface WorkerConfig {
  name: string;
  compatibility_date: string;
  compatibility_flags?: string[];
  main?: string;
  routes?: Array<string | { pattern: string; zone_name?: string }>;
  triggers?: {
    crons?: string[];
  };
  usage_model?: "bundled" | "unbound";
}

/**
 * Worker deployment info
 */
export interface WorkerDeployment {
  id: string;
  scriptName: string;
  environment: string;
  deployedAt: Date;
  version: string;
}

/**
 * Worker metrics
 */
export interface WorkerMetrics {
  requests: number;
  errors: number;
  cpuTime: number;
  duration: number;
}

/**
 * KV namespace binding
 */
export interface KVNamespace {
  get(key: string, type?: "text"): Promise<string | null>;
  get(key: string, type: "json"): Promise<unknown>;
  get(key: string, type: "arrayBuffer"): Promise<ArrayBuffer | null>;
  get(key: string, type: "stream"): Promise<ReadableStream | null>;
  put(key: string, value: string | ArrayBuffer | ReadableStream, options?: KVPutOptions): Promise<void>;
  delete(key: string): Promise<void>;
  list(options?: KVListOptions): Promise<KVListResult>;
}

export interface KVPutOptions {
  expiration?: number;
  expirationTtl?: number;
  metadata?: unknown;
}

export interface KVListOptions {
  prefix?: string;
  limit?: number;
  cursor?: string;
}

export interface KVListResult {
  keys: Array<{ name: string; expiration?: number; metadata?: unknown }>;
  list_complete: boolean;
  cursor?: string;
}

/**
 * R2 bucket binding
 */
export interface R2Bucket {
  get(key: string): Promise<R2Object | null>;
  put(key: string, value: ReadableStream | ArrayBuffer | string, options?: R2PutOptions): Promise<R2Object>;
  delete(key: string): Promise<void>;
  list(options?: R2ListOptions): Promise<R2Objects>;
}

export interface R2Object {
  key: string;
  version: string;
  size: number;
  etag: string;
  httpEtag: string;
  uploaded: Date;
  httpMetadata?: R2HTTPMetadata;
  customMetadata?: Record<string, string>;
  body: ReadableStream;
}

export interface R2PutOptions {
  httpMetadata?: R2HTTPMetadata;
  customMetadata?: Record<string, string>;
}

export interface R2HTTPMetadata {
  contentType?: string;
  contentLanguage?: string;
  contentDisposition?: string;
  contentEncoding?: string;
  cacheControl?: string;
  cacheExpiry?: Date;
}

export interface R2ListOptions {
  prefix?: string;
  limit?: number;
  cursor?: string;
  delimiter?: string;
}

export interface R2Objects {
  objects: R2Object[];
  truncated: boolean;
  cursor?: string;
  delimitedPrefixes: string[];
}
