/**
 * Worker configuration builder
 */

import type { WranglerConfig } from '../types/config.js';
import { WranglerConfigSchema } from '../validators/schemas.js';

/**
 * Configuration validation error
 */
export class ConfigValidationError extends Error {
  constructor(
    message: string,
    public code: string,
    public path: string,
    public expected: string,
    public received: unknown,
  ) {
    super(message);
    this.name = 'ConfigValidationError';
  }
}

/**
 * Define a complete Wrangler configuration
 * 
 * Validates the configuration and applies defaults for optional fields.
 * Throws ConfigValidationError if validation fails.
 * 
 * @param config - Configuration object
 * @returns Validated WranglerConfig
 * @throws ConfigValidationError if validation fails
 * 
 * @example
 * ```ts
 * const config = defineConfig({
 *   name: 'my-worker',
 *   main: 'src/index.ts',
 *   compatibility_date: '2024-01-01',
 * });
 * ```
 */
export function defineConfig(config: Partial<WranglerConfig>): WranglerConfig {
  // Apply default values
  const configWithDefaults = {
    name: config.name,
    main: config.main,
    compatibility_date: config.compatibility_date,
    accountId: config.accountId,
    compatibility_flags: config.compatibility_flags ?? [],
    node_compat: config.node_compat ?? false,
    bindings: config.bindings ?? [],
    vars: config.vars ?? {},
    secrets: config.secrets ?? [],
    routes: config.routes ?? [],
    triggers: config.triggers,
    env: config.env ?? {},
  };

  // Validate configuration
  const result = WranglerConfigSchema.safeParse(configWithDefaults);

  if (!result.success) {
    const firstError = result.error.issues[0];
    throw new ConfigValidationError(
      firstError.message,
      firstError.code,
      firstError.path.join('.'),
      'expected' in firstError ? String(firstError.expected) : 'valid value',
      'received' in firstError ? firstError.received : undefined,
    );
  }

  return result.data as WranglerConfig;
}
