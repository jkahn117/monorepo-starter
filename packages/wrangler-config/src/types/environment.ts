/**
 * Environment configuration type definitions
 */

import type { Binding } from './bindings.js';
import type { Route } from './config.js';

/**
 * Environment-specific configuration overrides
 * 
 * Used to override base configuration values for different environments
 * (development, staging, production)
 */
export interface EnvironmentConfig {
  name?: string;
  accountId?: string;
  routes?: Route[];
  bindings?: Binding[];
  vars?: Record<string, string>;
}
