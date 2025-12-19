/**
 * Wrangler configuration type definitions
 */

import type { Binding } from './bindings.js';
import type { EnvironmentConfig } from './environment.js';

/**
 * Route configuration
 */
export interface Route {
  pattern: string;
  zone_id?: string;
  zone_name?: string;
  custom_domain?: boolean;
}

/**
 * Trigger configuration (cron or queue)
 */
export interface TriggerConfig {
  crons?: string[];
  queues?: {
    queue: string;
    max_batch_size?: number;
    max_batch_timeout?: number;
    max_retries?: number;
    dead_letter_queue?: string;
  }[];
}

/**
 * Account-level configuration
 */
export interface AccountConfig {
  accountId: string;
  zone_id?: string;
}

/**
 * Main Wrangler configuration object
 */
export interface WranglerConfig {
  name: string;
  main: string;
  accountId?: string;
  compatibility_date: string;
  compatibility_flags?: string[];
  node_compat?: boolean;
  bindings?: Binding[];
  vars?: Record<string, string>;
  secrets?: string[];
  routes?: Route[];
  triggers?: TriggerConfig;
  env?: Record<string, EnvironmentConfig>;
}
