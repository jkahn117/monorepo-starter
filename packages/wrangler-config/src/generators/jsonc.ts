/**
 * JSONC file generator
 */

import type { WranglerConfig } from '../types/config.js';
import type { GenerateOptions, GenerationError } from './toml.js';

/**
 * Generate wrangler.jsonc content from configuration
 * 
 * @param config - Wrangler configuration
 * @param options - Generation options
 * @returns JSONC string
 * @throws GenerationError if generation fails
 * 
 * @example
 * ```ts
 * const jsonc = generateJSONC(config);
 * console.log(jsonc);
 * // Output:
 * // {
 * //   "name": "my-worker",
 * //   "main": "src/index.ts",
 * //   // ...
 * // }
 * ```
 */
export function generateJSONC(config: WranglerConfig, options?: GenerateOptions): string {
  const indent = options?.format === 'compact' ? 0 : 2;
  
  // Convert config to JSON-compatible object
  const obj: Record<string, unknown> = {
    name: config.name,
    main: config.main,
    compatibility_date: config.compatibility_date,
  };

  if (config.accountId) {
    obj.account_id = config.accountId;
  }

  if (config.compatibility_flags && config.compatibility_flags.length > 0) {
    obj.compatibility_flags = config.compatibility_flags;
  }

  if (config.node_compat) {
    obj.node_compat = config.node_compat;
  }

  if (config.vars && Object.keys(config.vars).length > 0) {
    obj.vars = config.vars;
  }

  // Add bindings (simplified for now)
  if (config.bindings && config.bindings.length > 0) {
    const d1 = config.bindings.filter((b) => b.type === 'd1');
    const kv = config.bindings.filter((b) => b.type === 'kv');
    const r2 = config.bindings.filter((b) => b.type === 'r2');

    if (d1.length > 0) obj.d1_databases = d1;
    if (kv.length > 0) obj.kv_namespaces = kv;
    if (r2.length > 0) obj.r2_buckets = r2;
  }

  return JSON.stringify(obj, null, indent);
}
