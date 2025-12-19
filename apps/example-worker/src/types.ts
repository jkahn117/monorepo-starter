/**
 * Local type definitions for example-worker
 */

export interface WorkerEnv {
  // D1 Database binding
  DB: D1Database;
  // Add other bindings as needed:
  // KV: KVNamespace;
  // BUCKET: R2Bucket;
}

export interface RequestContext {
  env: WorkerEnv;
  ctx: ExecutionContext;
}
