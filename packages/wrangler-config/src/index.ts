/**
 * @repo/wrangler-config
 * 
 * Shared Cloudflare Workers configuration management for monorepos.
 * 
 * @packageDocumentation
 */

// Version
export const version = '0.1.0';

// Types
export type * from './types/index.js';

// Builders
export {
  d1Binding,
  kvBinding,
  r2Binding,
  durableObjectBinding,
  serviceBinding,
} from './builders/bindings.js';

export { defineConfig, ConfigValidationError } from './builders/worker.js';

export { defineEnvironment } from './builders/environment.js';

// Generators
export {
  generateTOML,
  writeConfigFile,
  GenerationError,
  type GenerateOptions,
} from './generators/toml.js';

// Validators
export { WranglerConfigSchema, BindingSchema } from './validators/schemas.js';

// RPC Type Generation
export {
  discoverRPCWorkers,
  generateRPCTypes,
  storeGeneratedTypes,
  needsRegeneration,
} from './generators/typegen.js';

export type { RPCTypeDefinition, ServiceBindingDeclaration } from './types/rpc.js';

// JSONC Generator
export { generateJSONC } from './generators/jsonc.js';
