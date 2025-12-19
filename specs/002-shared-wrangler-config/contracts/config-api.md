# API Contract: Shared Wrangler Configuration

**Feature**: 002-shared-wrangler-config  
**Date**: 2025-12-19  
**Package**: `@repo/wrangler-config`  
**Status**: Complete

## Overview

This document defines the public API contract for the Shared Wrangler Configuration package. All functions, types, and behaviors specified here MUST be implemented exactly as described.

---

## Package Exports

```typescript
// Main entry point: packages/wrangler-config/src/index.ts
export * from './builders';
export * from './validators';
export * from './generators';
export * from './types';
export * from './presets';
```

---

## Configuration Builders API

### Core Configuration

#### `defineConfig(config: WranglerConfigInput): WranglerConfig`

**Purpose**: Create a complete wrangler configuration object.

**Parameters**:
- `config`: Partial or complete configuration object

**Returns**: Validated `WranglerConfig` object

**Throws**: 
- `ConfigValidationError` if required fields are missing
- `TypeError` if field types are incorrect

**Example**:
```typescript
import { defineConfig } from '@repo/wrangler-config';

const config = defineConfig({
  name: 'my-worker',
  main: 'src/index.ts',
  compatibility_date: '2024-01-01',
});
```

**Contract Tests**:
- ✅ Accepts valid configuration
- ✅ Throws on missing required fields
- ✅ Applies default values for optional fields
- ✅ Validates field formats

---

#### `defineEnvironment(name: string, overrides: Partial<WranglerConfig>): EnvironmentConfig`

**Purpose**: Define an environment-specific configuration profile.

**Parameters**:
- `name`: Environment name (e.g., 'development', 'production')
- `overrides`: Configuration values to override

**Returns**: `EnvironmentConfig` object

**Throws**:
- `Error` if trying to override immutable fields

**Example**:
```typescript
const prodEnv = defineEnvironment('production', {
  name: 'my-worker-prod',
  accountId: 'prod-account-id',
});
```

**Contract Tests**:
- ✅ Creates environment config with name
- ✅ Prevents overriding immutable fields (main, compatibility_date)
- ✅ Allows all other field overrides

---

### Binding Builders

#### `d1Binding(binding: string, database_name: string, database_id: string): D1Binding`

**Purpose**: Create a D1 database binding configuration.

**Parameters**:
- `binding`: Binding name (JavaScript identifier)
- `database_name`: Human-readable database name
- `database_id`: Cloudflare database UUID

**Returns**: `D1Binding` object

**Throws**:
- `Error` if binding name is not a valid identifier
- `Error` if database_id is not a valid UUID format

**Example**:
```typescript
const dbBinding = d1Binding('DB', 'my-database', 'abc-123-def');
```

**Contract Tests**:
- ✅ Creates valid D1 binding
- ✅ Validates binding name format
- ✅ Validates database_id format

---

#### `kvBinding(binding: string, id: string): KVBinding`

**Purpose**: Create a KV namespace binding configuration.

**Parameters**:
- `binding`: Binding name (JavaScript identifier)
- `id`: KV namespace ID

**Returns**: `KVBinding` object

**Example**:
```typescript
const cache = kvBinding('CACHE', 'kv-namespace-id');
```

**Contract Tests**:
- ✅ Creates valid KV binding
- ✅ Validates binding name format

---

#### `r2Binding(binding: string, bucket_name: string): R2Binding`

**Purpose**: Create an R2 bucket binding configuration.

**Parameters**:
- `binding`: Binding name (JavaScript identifier)
- `bucket_name`: R2 bucket name

**Returns**: `R2Binding` object

**Example**:
```typescript
const storage = r2Binding('STORAGE', 'my-bucket');
```

**Contract Tests**:
- ✅ Creates valid R2 binding
- ✅ Validates bucket name format

---

#### `durableObjectBinding(binding: string, class_name: string, script_name?: string): DurableObjectBinding`

**Purpose**: Create a Durable Object binding configuration.

**Parameters**:
- `binding`: Binding name
- `class_name`: Durable Object class name
- `script_name`: (Optional) Script containing the DO

**Returns**: `DurableObjectBinding` object

**Example**:
```typescript
const counter = durableObjectBinding('COUNTER', 'Counter', 'counter-worker');
```

**Contract Tests**:
- ✅ Creates valid DO binding
- ✅ Works with and without script_name

---

#### `serviceBinding(binding: string, service: string, environment?: string): ServiceBinding`

**Purpose**: Create a service binding configuration.

**Parameters**:
- `binding`: Binding name
- `service`: Service name to bind to
- `environment`: (Optional) Service environment

**Returns**: `ServiceBinding` object

**Example**:
```typescript
const auth = serviceBinding('AUTH', 'auth-service', 'production');
```

**Contract Tests**:
- ✅ Creates valid service binding
- ✅ Works with and without environment

---

## Validation API

#### `validateConfig(config: unknown): ValidationResult`

**Purpose**: Validate a configuration object against all rules.

**Parameters**:
- `config`: Configuration object to validate (can be any type)

**Returns**: `ValidationResult` with errors and warnings

**Behavior**:
- Does NOT throw on invalid config
- Returns detailed error messages
- Includes actionable suggestions

**Example**:
```typescript
const result = validateConfig(myConfig);
if (!result.valid) {
  console.error('Validation errors:', result.errors);
}
```

**Contract Tests**:
- ✅ Returns valid:true for correct config
- ✅ Returns valid:false with errors for invalid config
- ✅ Includes warnings for non-critical issues
- ✅ Provides clear error messages with paths

---

#### `validateBeforeDeploy(config: WranglerConfig, environment: string): ValidationResult`

**Purpose**: Run deployment-specific validation checks.

**Parameters**:
- `config`: Configuration to validate
- `environment`: Target environment name

**Returns**: `ValidationResult` with deployment-specific checks

**Deployment Checks**:
- Account ID must be set
- All binding IDs must be non-empty
- Environment must exist if specified
- No local/development bindings in production

**Example**:
```typescript
const result = validateBeforeDeploy(config, 'production');
if (!result.valid) {
  throw new Error('Cannot deploy: ' + result.errors.map(e => e.message).join(', '));
}
```

**Contract Tests**:
- ✅ Requires accountId for deployment
- ✅ Validates all bindings have IDs
- ✅ Checks environment exists
- ✅ Warns about development settings in production

---

## Generation API

#### `generateTOML(config: WranglerConfig, options?: GenerateOptions): string`

**Purpose**: Generate wrangler.toml file content from configuration.

**Parameters**:
- `config`: Configuration object
- `options`: (Optional) Generation options

**Options**:
```typescript
interface GenerateOptions {
  preserveComments?: boolean;  // Preserve existing comments (default: false)
  format?: 'compact' | 'pretty';  // Formatting style (default: 'pretty')
  environment?: string;  // Generate for specific environment
}
```

**Returns**: String containing TOML content

**Throws**: 
- `GenerationError` if config is invalid

**Example**:
```typescript
const toml = generateTOML(config, { format: 'pretty' });
console.log(toml);
// Output:
// name = "my-worker"
// main = "src/index.ts"
// ...
```

**Contract Tests**:
- ✅ Generates valid TOML syntax
- ✅ Includes all required fields
- ✅ Formats numbers and booleans correctly
- ✅ Escapes special characters in strings
- ✅ Generates environment-specific output

---

#### `generateJSONC(config: WranglerConfig, options?: GenerateOptions): string`

**Purpose**: Generate wrangler.jsonc file content from configuration.

**Parameters**: Same as `generateTOML`

**Returns**: String containing JSONC content (JSON with comments)

**Example**:
```typescript
const jsonc = generateJSONC(config);
// Output:
// {
//   "name": "my-worker",
//   "main": "src/index.ts",
//   // ...
// }
```

**Contract Tests**:
- ✅ Generates valid JSON syntax
- ✅ Preserves comments if requested
- ✅ Pretty-prints with proper indentation
- ✅ Handles all data types correctly

---

#### `writeConfigFile(config: WranglerConfig, outputPath: string, format: 'toml' | 'jsonc'): Promise<void>`

**Purpose**: Generate and write configuration file to disk.

**Parameters**:
- `config`: Configuration object
- `outputPath`: File path to write to
- `format`: Output format

**Returns**: Promise that resolves when file is written

**Throws**:
- `Error` if file cannot be written
- `GenerationError` if config is invalid

**Example**:
```typescript
await writeConfigFile(config, './wrangler.toml', 'toml');
```

**Contract Tests**:
- ✅ Creates file at specified path
- ✅ Overwrites existing file
- ✅ Creates parent directories if needed
- ✅ Uses correct file extension

---

## Environment Resolution API

#### `resolveEnvironment(base: WranglerConfig, environment: EnvironmentConfig): WranglerConfig`

**Purpose**: Merge base configuration with environment overrides.

**Parameters**:
- `base`: Base configuration
- `environment`: Environment-specific overrides

**Returns**: New `WranglerConfig` with merged values

**Merge Rules**:
- Primitives: Environment overrides base
- Arrays: Environment replaces base (no merge)
- Objects: Deep merge (vars, etc.)

**Example**:
```typescript
const prodConfig = resolveEnvironment(baseConfig, prodEnvironment);
```

**Contract Tests**:
- ✅ Merges primitives correctly
- ✅ Replaces arrays (bindings)
- ✅ Deep merges objects (vars)
- ✅ Does not mutate inputs

---

#### `getEnvironmentConfig(config: WranglerConfig, envName: string): WranglerConfig`

**Purpose**: Get configuration for a specific environment by name.

**Parameters**:
- `config`: Full configuration with environments
- `envName`: Environment name to extract

**Returns**: Resolved configuration for that environment

**Throws**:
- `Error` if environment doesn't exist

**Example**:
```typescript
const prodConfig = getEnvironmentConfig(config, 'production');
```

**Contract Tests**:
- ✅ Returns correct environment
- ✅ Throws if environment not found
- ✅ Merges with base config

---

## Presets API

#### `commonBindings`

**Purpose**: Pre-configured common binding patterns.

**Available Presets**:

```typescript
export const commonBindings = {
  // Production-ready D1 binding
  productionD1(binding: string, dbName: string, dbId: string): D1Binding;
  
  // Standard cache KV binding
  cacheKV(binding: string, namespaceId: string): KVBinding;
  
  // Storage R2 bucket binding
  storageBucket(binding: string, bucketName: string): R2Binding;
  
  // Session storage KV binding
  sessionKV(namespaceId: string): KVBinding;
};
```

**Example**:
```typescript
import { commonBindings } from '@repo/wrangler-config/presets';

const config = defineConfig({
  bindings: [
    commonBindings.cacheKV('CACHE', 'my-kv-id'),
    commonBindings.storageBucket('STORAGE', 'my-bucket'),
  ],
});
```

---

#### `environments`

**Purpose**: Pre-configured environment profiles.

**Available Environments**:

```typescript
export const environments = {
  development: EnvironmentConfig;  // Debug logging, dev settings
  staging: EnvironmentConfig;      // Info logging, staging settings
  production: EnvironmentConfig;   // Warn logging, prod settings
};
```

**Example**:
```typescript
import { environments } from '@repo/wrangler-config/presets';

const config = defineConfig({
  env: environments,
});
```

---

## Error Handling

### ConfigValidationError

**When thrown**: Invalid configuration provided to builders

**Properties**:
```typescript
class ConfigValidationError extends Error {
  code: string;
  path: string;
  expected: string;
  received: any;
}
```

**Example**:
```typescript
try {
  defineConfig({ name: '' });  // Empty name
} catch (error) {
  if (error instanceof ConfigValidationError) {
    console.error(`${error.code} at ${error.path}: ${error.message}`);
  }
}
```

---

### GenerationError

**When thrown**: Cannot generate output file from configuration

**Properties**:
```typescript
class GenerationError extends Error {
  config: WranglerConfig;
  format: 'toml' | 'jsonc';
}
```

---

## Compatibility Contract

### Wrangler CLI Compatibility

The generated wrangler.toml/jsonc files MUST be compatible with:
- Wrangler CLI 3.22.0+
- All Cloudflare Workers runtime versions

**Guaranteed Fields**:
- All fields supported by Wrangler CLI 3.22.0
- Forward compatibility: Unknown fields preserved (warnings only)
- Backward compatibility: Deprecated fields supported with warnings

---

### Breaking Change Policy

**Semantic Versioning**:
- **Major**: API signature changes, removed functions
- **Minor**: New features, new optional parameters
- **Patch**: Bug fixes, performance improvements

**Deprecation Process**:
1. Mark function as `@deprecated` in JSDoc
2. Add runtime warning
3. Wait 2 minor versions
4. Remove in next major version

---

## Performance Contract

| Operation | Maximum Time | Target Time |
|-----------|-------------|-------------|
| `defineConfig()` | 10ms | <1ms |
| `validateConfig()` | 100ms | <50ms |
| `generateTOML()` | 50ms | <10ms |
| `writeConfigFile()` | 500ms | <100ms |
| `resolveEnvironment()` | 10ms | <1ms |

**Measured on**: MacBook Pro M1, Node.js 20 LTS

---

## Testing Contract

### Required Test Coverage

- **Unit Tests**: >90% coverage for builders, validators, generators
- **Integration Tests**: All merge and resolution scenarios
- **Contract Tests**: Wrangler CLI can parse generated files
- **Performance Tests**: All operations meet performance contract

### Test Scenarios

Each public function MUST have tests for:
- ✅ Happy path with valid inputs
- ✅ Error cases with invalid inputs
- ✅ Edge cases (empty arrays, null values, etc.)
- ✅ Type safety (TypeScript compilation checks)

---

## Migration Path

### From Manual wrangler.toml

**Step 1**: Install package
```bash
pnpm add @repo/wrangler-config --workspace
```

**Step 2**: Create wrangler.config.ts
```typescript
import { defineConfig } from '@repo/wrangler-config';

export default defineConfig({
  // Copy values from wrangler.toml
});
```

**Step 3**: Add generation script
```json
{
  "scripts": {
    "config:generate": "tsx wrangler.config.ts > wrangler.toml"
  }
}
```

**Step 4**: Update build pipeline
```json
{
  "build": {
    "dependsOn": ["config:generate"]
  }
}
```

---

## Examples

### Complete Example

```typescript
import {
  defineConfig,
  defineEnvironment,
  d1Binding,
  kvBinding,
  validateConfig,
  generateTOML,
  writeConfigFile,
} from '@repo/wrangler-config';
import { commonBindings, environments } from '@repo/wrangler-config/presets';

// Define configuration
const config = defineConfig({
  name: 'my-api-worker',
  main: 'src/index.ts',
  accountId: process.env.CF_ACCOUNT_ID,
  compatibility_date: '2024-01-01',
  compatibility_flags: ['nodejs_compat'],
  bindings: [
    d1Binding('DB', 'my-database', 'dev-db-id'),
    commonBindings.cacheKV('CACHE', 'dev-kv-id'),
  ],
  env: {
    ...environments,
    production: defineEnvironment('production', {
      name: 'my-api-worker-prod',
      bindings: [
        d1Binding('DB', 'my-database', 'prod-db-id'),
        commonBindings.cacheKV('CACHE', 'prod-kv-id'),
      ],
    }),
  },
});

// Validate
const result = validateConfig(config);
if (!result.valid) {
  console.error('Validation failed:', result.errors);
  process.exit(1);
}

// Generate and write
await writeConfigFile(config, './wrangler.toml', 'toml');
console.log('✅ Generated wrangler.toml');
```

---

## Status

✅ **Complete** - Ready for implementation

All API endpoints, behaviors, and contracts have been specified with examples and test requirements.
