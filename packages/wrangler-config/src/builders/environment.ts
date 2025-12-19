/**
 * Environment configuration builder
 */

import type { EnvironmentConfig } from '../types/environment.js';

/**
 * Define an environment-specific configuration profile
 * 
 * Used to override base configuration values for different environments
 * (development, staging, production)
 * 
 * @param name - Environment name
 * @param overrides - Configuration values to override
 * @returns EnvironmentConfig object
 * 
 * @example
 * ```ts
 * const prodEnv = defineEnvironment('production', {
 *   name: 'my-worker-prod',
 *   accountId: 'prod-account-id',
 * });
 * ```
 */
export function defineEnvironment(
  name: string,
  overrides: Omit<EnvironmentConfig, 'name'> & { name?: string },
): EnvironmentConfig {
  return {
    name: overrides.name || name,
    ...overrides,
  };
}
