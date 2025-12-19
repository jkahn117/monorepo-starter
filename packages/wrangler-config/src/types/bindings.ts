/**
 * Cloudflare Workers binding type definitions
 */

/**
 * Binding types supported by Wrangler
 */
export type BindingType =
  | 'd1'
  | 'kv'
  | 'r2'
  | 'do'
  | 'service'
  | 'analytics_engine'
  | 'queue'
  | 'hyperdrive'
  | 'ai';

/**
 * D1 Database binding
 */
export interface D1Binding {
  type: 'd1';
  binding: string;
  database_name: string;
  database_id: string;
}

/**
 * KV Namespace binding
 */
export interface KVBinding {
  type: 'kv';
  binding: string;
  id: string;
}

/**
 * R2 Bucket binding
 */
export interface R2Binding {
  type: 'r2';
  binding: string;
  bucket_name: string;
}

/**
 * Durable Object binding
 */
export interface DurableObjectBinding {
  type: 'do';
  binding: string;
  class_name: string;
  script_name?: string;
}

/**
 * Service binding for inter-worker RPC
 */
export interface ServiceBinding {
  type: 'service';
  binding: string;
  service: string;
  environment?: string;
}

/**
 * Analytics Engine binding
 */
export interface AnalyticsEngineBinding {
  type: 'analytics_engine';
  binding: string;
  dataset: string;
}

/**
 * Queue binding
 */
export interface QueueBinding {
  type: 'queue';
  binding: string;
  queue_name: string;
}

/**
 * Hyperdrive binding for database connections
 */
export interface HyperdriveBinding {
  type: 'hyperdrive';
  binding: string;
  id: string;
}

/**
 * AI binding for Workers AI
 */
export interface AIBinding {
  type: 'ai';
  binding: string;
}

/**
 * Discriminated union of all binding types
 */
export type Binding =
  | D1Binding
  | KVBinding
  | R2Binding
  | DurableObjectBinding
  | ServiceBinding
  | AnalyticsEngineBinding
  | QueueBinding
  | HyperdriveBinding
  | AIBinding;
