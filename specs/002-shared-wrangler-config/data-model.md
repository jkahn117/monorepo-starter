# Data Model: Shared Wrangler Configuration

**Feature**: 002-shared-wrangler-config  
**Date**: 2025-12-19  
**Status**: Complete

## Overview

This document defines the data structures and relationships for the Shared Wrangler Configuration system. All types are defined in TypeScript and validated using Zod schemas.

---

## Core Entities

### 1. WranglerConfig

**Purpose**: Root configuration object representing a complete wrangler.toml/jsonc file.

**Fields**:

| Field | Type | Required | Default | Validation Rules |
|-------|------|----------|---------|------------------|
| name | string | Yes | - | 1-64 characters, alphanumeric + hyphens |
| main | string | Yes | - | Must end with .ts or .js |
| accountId | string | No | - | Valid UUID format (if provided) |
| compatibility_date | string | Yes | - | Format: YYYY-MM-DD |
| compatibility_flags | string[] | No | [] | Array of valid Cloudflare compat flags |
| node_compat | boolean | No | false | - |
| bindings | Binding[] | No | [] | Array of binding configurations |
| vars | Record<string, string> | No | {} | Plain text environment variables |
| secrets | string[] | No | [] | Secret names (values from wrangler secret) |
| routes | Route[] | No | [] | Custom route configurations |
| triggers | TriggerConfig | No | - | Cron or queue triggers |
| env | Record<string, EnvironmentConfig> | No | {} | Environment-specific overrides |

**Relationships**:
- Contains zero or more `Binding` (composition)
- Contains zero or more `EnvironmentConfig` (composition)
- References `AccountConfig` (optional)

**State Transitions**: N/A (immutable configuration object)

**Example**:
```typescript
const config: WranglerConfig = {
  name: 'my-worker',
  main: 'src/index.ts',
  accountId: '550e8400-e29b-41d4-a716-446655440000',
  compatibility_date: '2024-01-01',
  compatibility_flags: ['nodejs_compat'],
  bindings: [
    { type: 'd1', binding: 'DB', database_name: 'my-db', database_id: 'abc123' },
    { type: 'kv', binding: 'CACHE', id: 'def456' },
  ],
  env: {
    production: {
      name: 'my-worker-prod',
      accountId: '660e8400-e29b-41d4-a716-446655440001',
    },
  },
};
```

---

### 2. Binding (Polymorphic)

**Purpose**: Represents a Cloudflare resource binding (D1, KV, R2, Durable Object, etc.).

**Base Fields** (all binding types):

| Field | Type | Required | Validation Rules |
|-------|------|----------|------------------|
| type | BindingType | Yes | One of: 'd1', 'kv', 'r2', 'do', 'service', 'analytics_engine', 'queue', 'hyperdrive' |
| binding | string | Yes | Valid JavaScript identifier |

**Type-Specific Fields**:

#### D1Binding
```typescript
{
  type: 'd1',
  binding: string,
  database_name: string,  // Human-readable name
  database_id: string,     // Cloudflare database UUID
}
```

#### KVBinding
```typescript
{
  type: 'kv',
  binding: string,
  id: string,              // KV namespace ID
}
```

#### R2Binding
```typescript
{
  type: 'r2',
  binding: string,
  bucket_name: string,     // R2 bucket name
}
```

#### DurableObjectBinding
```typescript
{
  type: 'do',
  binding: string,
  class_name: string,      // Durable Object class name
  script_name?: string,    // Optional: script containing the DO
}
```

#### ServiceBinding
```typescript
{
  type: 'service',
  binding: string,
  service: string,         // Service name
  environment?: string,    // Optional: service environment
}
```

**Validation Rules**:
- Binding names must be unique within a configuration
- Database IDs and namespace IDs must be valid Cloudflare identifiers
- Bucket names must follow R2 naming conventions

**Relationships**:
- Contained by `WranglerConfig` (one-to-many)
- May reference external Cloudflare resources (external reference)

---

### 3. EnvironmentConfig

**Purpose**: Environment-specific configuration overrides (development, staging, production).

**Fields**:

| Field | Type | Required | Default | Validation Rules |
|-------|------|----------|---------|------------------|
| name | string | No | - | Worker name for this environment |
| accountId | string | No | - | Account ID override |
| routes | Route[] | No | - | Environment-specific routes |
| bindings | Binding[] | No | - | Environment-specific bindings |
| vars | Record<string, string> | No | - | Environment-specific variables |

**Merge Behavior**:
- Shallow merge for primitive fields (name, accountId)
- Array replacement for bindings (not merge)
- Object merge for vars (combines base + environment)

**Validation Rules**:
- Cannot override `main` or `compatibility_date`
- Binding overrides must match base binding structure
- Environment names must be valid TOML keys

**Relationships**:
- Contained by `WranglerConfig.env` (one-to-many)
- Overrides values from parent `WranglerConfig`

**Example**:
```typescript
const envConfig: EnvironmentConfig = {
  name: 'my-worker-prod',
  accountId: 'prod-account-id',
  bindings: [
    { type: 'd1', binding: 'DB', database_name: 'my-db-prod', database_id: 'prod-db-id' },
  ],
  vars: {
    LOG_LEVEL: 'info',
  },
};
```

---

### 4. AccountConfig

**Purpose**: Account-level settings that can be shared across workers.

**Fields**:

| Field | Type | Required | Validation Rules |
|-------|------|----------|------------------|
| accountId | string | Yes | Valid UUID format |
| zone_id | string | No | Valid UUID format (if provided) |

**Usage**: Imported as a preset:
```typescript
import { accountConfig } from '@repo/wrangler-config/presets';

export default defineConfig({
  ...accountConfig,
  name: 'my-worker',
  // ... other fields
});
```

**Relationships**:
- Referenced by multiple `WranglerConfig` instances (many-to-one)

---

### 5. ValidationResult

**Purpose**: Output from configuration validation.

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| valid | boolean | True if configuration passed all validation rules |
| errors | ValidationError[] | Critical errors that must be fixed |
| warnings | ValidationWarning[] | Non-critical issues that should be reviewed |
| metadata | ValidationMetadata | Additional validation context |

**ValidationError Structure**:
```typescript
{
  path: string,        // JSON path to error (e.g., "bindings[0].database_id")
  code: string,        // Error code (e.g., "invalid_uuid")
  message: string,     // Human-readable error message
  expected: string,    // Expected value/format
  received: any,       // Actual value that failed validation
}
```

**ValidationWarning Structure**:
```typescript
{
  path: string,
  code: string,
  message: string,
  suggestion: string,  // Suggested fix
}
```

**Validation Rules**:
- If `errors.length > 0`, then `valid = false`
- Warnings don't affect `valid` status
- Errors must include actionable messages

**State Transitions**: N/A (immutable result object)

**Example**:
```typescript
const result: ValidationResult = {
  valid: false,
  errors: [
    {
      path: 'accountId',
      code: 'required',
      message: 'Account ID is required for deployment',
      expected: 'UUID string',
      received: undefined,
    },
  ],
  warnings: [
    {
      path: 'compatibility_date',
      code: 'outdated',
      message: 'Compatibility date is more than 6 months old',
      suggestion: 'Update to 2024-12-01 or later',
    },
  ],
  metadata: {
    validatedAt: '2024-12-19T10:30:00Z',
    schemaVersion: '1.0.0',
  },
};
```

---

### 6. ConfigPreset

**Purpose**: Pre-configured common settings that can be reused across workers.

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| name | string | Preset identifier |
| description | string | Human-readable description |
| config | Partial<WranglerConfig> | Configuration values |

**Built-in Presets**:

```typescript
// Common bindings
export const commonBindings = {
  productionD1: (name: string, dbName: string, dbId: string) => 
    d1Binding(name, dbName, dbId),
  cacheKV: (id: string) => 
    kvBinding('CACHE', id),
  storageBucket: (bucketName: string) => 
    r2Binding('STORAGE', bucketName),
};

// Common environment profiles
export const environments = {
  development: defineEnvironment('development', {
    vars: { LOG_LEVEL: 'debug', NODE_ENV: 'development' },
  }),
  staging: defineEnvironment('staging', {
    vars: { LOG_LEVEL: 'info', NODE_ENV: 'staging' },
  }),
  production: defineEnvironment('production', {
    vars: { LOG_LEVEL: 'warn', NODE_ENV: 'production' },
  }),
};
```

**Usage**:
```typescript
import { commonBindings, environments } from '@repo/wrangler-config/presets';

export default defineConfig({
  name: 'my-worker',
  bindings: [
    commonBindings.cacheKV('my-kv-id'),
    commonBindings.storageBucket('my-bucket'),
  ],
  env: environments,
});
```

---

## Relationships Diagram

```
WranglerConfig
├── accountId (reference to AccountConfig)
├── bindings[] (composition)
│   ├── D1Binding
│   ├── KVBinding
│   ├── R2Binding
│   └── DurableObjectBinding
└── env{} (composition)
    └── EnvironmentConfig
        └── bindings[] (override)

ConfigPreset
└── config (Partial<WranglerConfig>)

ValidationResult
└── errors[] (ValidationError)
```

---

## Data Flow

### Configuration Resolution Flow

```
1. Load wrangler.config.ts
   ↓
2. Execute TypeScript to get WranglerConfig object
   ↓
3. Validate with Zod schemas
   ↓
4. Resolve environment (if specified)
   ↓
5. Merge environment overrides
   ↓
6. Generate wrangler.toml/jsonc
   ↓
7. Write to disk
```

### Validation Flow

```
1. Parse configuration object
   ↓
2. Run Zod schema validation
   ↓
3. Run custom business rules
   ↓
4. Check for warnings
   ↓
5. Return ValidationResult
   ↓
6. If invalid, halt build process
```

### Environment Resolution Flow

```
1. Start with base WranglerConfig
   ↓
2. Select environment by name (e.g., "production")
   ↓
3. Get EnvironmentConfig from env{}
   ↓
4. Merge: base config + environment overrides
   ↓
5. Return resolved WranglerConfig
```

---

## Validation Rules Summary

### Required Fields Validation
- `name`: Must be present and 1-64 characters
- `main`: Must be present and end with .ts or .js
- `compatibility_date`: Must be present and valid date format

### Format Validation
- `accountId`: UUID format (if provided)
- `compatibility_date`: YYYY-MM-DD format
- `binding`: Valid JavaScript identifier (no spaces, starts with letter)

### Business Rules
- Binding names must be unique
- Environment overrides cannot change immutable fields
- Circular dependencies not allowed in service bindings
- Database IDs must exist in Cloudflare account (warning only)

### Cross-Field Validation
- If `node_compat = true`, compatibility_flags cannot include nodejs_compat
- Service bindings must reference existing services (warning)
- Route patterns must not conflict (warning)

---

## Type Definitions

### Complete TypeScript Types

```typescript
// Core configuration types
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

// Binding types (discriminated union)
export type Binding =
  | D1Binding
  | KVBinding
  | R2Binding
  | DurableObjectBinding
  | ServiceBinding
  | AnalyticsEngineBinding
  | QueueBinding
  | HyperdriveBinding;

export interface D1Binding {
  type: 'd1';
  binding: string;
  database_name: string;
  database_id: string;
}

export interface KVBinding {
  type: 'kv';
  binding: string;
  id: string;
}

export interface R2Binding {
  type: 'r2';
  binding: string;
  bucket_name: string;
}

export interface DurableObjectBinding {
  type: 'do';
  binding: string;
  class_name: string;
  script_name?: string;
}

// Environment configuration
export interface EnvironmentConfig {
  name?: string;
  accountId?: string;
  routes?: Route[];
  bindings?: Binding[];
  vars?: Record<string, string>;
}

// Validation types
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  metadata: ValidationMetadata;
}

export interface ValidationError {
  path: string;
  code: string;
  message: string;
  expected: string;
  received: any;
}

export interface ValidationWarning {
  path: string;
  code: string;
  message: string;
  suggestion: string;
}

export interface ValidationMetadata {
  validatedAt: string;
  schemaVersion: string;
}

// Preset types
export interface ConfigPreset {
  name: string;
  description: string;
  config: Partial<WranglerConfig>;
}
```

---

## Examples

### Complete Configuration Example

```typescript
import {
  defineConfig,
  defineEnvironment,
  d1Binding,
  kvBinding,
  r2Binding,
} from '@repo/wrangler-config';

export default defineConfig({
  name: 'my-api-worker',
  main: 'src/index.ts',
  accountId: '550e8400-e29b-41d4-a716-446655440000',
  compatibility_date: '2024-01-01',
  compatibility_flags: ['nodejs_compat'],
  bindings: [
    d1Binding('DB', 'my-database', 'dev-db-id'),
    kvBinding('CACHE', 'dev-kv-id'),
    r2Binding('STORAGE', 'my-bucket-dev'),
  ],
  vars: {
    LOG_LEVEL: 'debug',
    API_URL: 'https://api-dev.example.com',
  },
  env: {
    staging: defineEnvironment('staging', {
      name: 'my-api-worker-staging',
      accountId: 'staging-account-id',
      bindings: [
        d1Binding('DB', 'my-database', 'staging-db-id'),
        kvBinding('CACHE', 'staging-kv-id'),
      ],
      vars: {
        LOG_LEVEL: 'info',
        API_URL: 'https://api-staging.example.com',
      },
    }),
    production: defineEnvironment('production', {
      name: 'my-api-worker-prod',
      accountId: 'prod-account-id',
      bindings: [
        d1Binding('DB', 'my-database', 'prod-db-id'),
        kvBinding('CACHE', 'prod-kv-id'),
        r2Binding('STORAGE', 'my-bucket-prod'),
      ],
      vars: {
        LOG_LEVEL: 'warn',
        API_URL: 'https://api.example.com',
      },
    }),
  },
});
```

---

## Status

✅ **Complete** - Ready for implementation

All entities, relationships, validation rules, and type definitions have been specified. The data model supports all requirements from the feature specification.
