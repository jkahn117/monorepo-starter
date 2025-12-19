# @repo/wrangler-config

> Shared Cloudflare Workers configuration management for TypeScript monorepos

[![Tests](https://img.shields.io/badge/tests-67%20passing-brightgreen)]()
[![Coverage](https://img.shields.io/badge/coverage-%3E90%25-brightgreen)]()

## Overview

A type-safe, centralized configuration system for managing Cloudflare Workers in monorepos. Define your wrangler configuration once in TypeScript and share it across multiple workers.

### Key Features

- ✅ **Centralized Configuration**: Single source of truth for Cloudflare bindings and settings
- ✅ **Type Safety**: Full TypeScript support with IDE autocomplete and validation
- ✅ **Environment Management**: Built-in dev/staging/production environment profiles
- ✅ **Build-time Generation**: Generates `wrangler.toml` from TypeScript configuration
- ✅ **Turborepo Integration**: Optimized caching and parallel execution
- ✅ **RPC Type Safety**: Infrastructure for auto-generating types for inter-worker communication

## Installation

```bash
pnpm add @repo/wrangler-config
```

## Quick Start

### 1. Create Configuration File

Create `wrangler.config.ts` in your worker directory:

```typescript
import { defineConfig, d1Binding, kvBinding } from '@repo/wrangler-config';

export default defineConfig({
  name: 'my-worker',
  main: 'src/index.ts',
  compatibility_date: '2024-01-01',
  compatibility_flags: ['nodejs_compat'],
  
  bindings: [
    d1Binding('DB', 'my-database', 'db-id'),
    kvBinding('CACHE', 'kv-namespace-id'),
  ],
});
```

### 2. Add Generation Script

Add to your worker's `package.json`:

```json
{
  "scripts": {
    "config:generate": "tsx scripts/generate-config.ts"
  }
}
```

Create `scripts/generate-config.ts`:

```typescript
import { writeFileSync } from 'node:fs';
import { generateTOML } from '@repo/wrangler-config';
import config from '../wrangler.config.js';

writeFileSync('wrangler.toml', generateTOML(config), 'utf-8');
console.log('✅ Generated wrangler.toml');
```

### 3. Configure Turborepo

Update `turbo.json`:

```json
{
  "tasks": {
    "config:generate": {
      "cache": true,
      "outputs": ["wrangler.toml"]
    },
    "build": {
      "dependsOn": ["config:generate"]
    },
    "dev": {
      "dependsOn": ["config:generate"]
    }
  }
}
```

### 4. Generate Configuration

```bash
pnpm config:generate
# ✅ Generated wrangler.toml
```

## Core API

### Configuration Builders

#### `defineConfig(config)`

Create a validated Wrangler configuration:

```typescript
import { defineConfig } from '@repo/wrangler-config';

const config = defineConfig({
  name: 'my-worker',
  main: 'src/index.ts',
  compatibility_date: '2024-01-01',
  // ... other options
});
```

#### Binding Builders

Create type-safe bindings for Cloudflare resources:

```typescript
import {
  d1Binding,
  kvBinding,
  r2Binding,
  durableObjectBinding,
  serviceBinding,
} from '@repo/wrangler-config';

// D1 Database
d1Binding('DB', 'my-database', 'database-id');

// KV Namespace
kvBinding('CACHE', 'namespace-id');

// R2 Bucket
r2Binding('STORAGE', 'bucket-name');

// Durable Object
durableObjectBinding('COUNTER', 'CounterClass', 'counter-worker');

// Service Binding (for RPC)
serviceBinding('AUTH', 'auth-service', 'production');
```

### Environment Configuration

#### `defineEnvironment(name, overrides)`

Define environment-specific configurations:

```typescript
import { defineConfig, defineEnvironment, d1Binding } from '@repo/wrangler-config';

export default defineConfig({
  name: 'my-worker',
  main: 'src/index.ts',
  compatibility_date: '2024-01-01',
  
  // Base bindings (development)
  bindings: [d1Binding('DB', 'my-db', 'dev-id')],
  
  // Environment overrides
  env: {
    production: defineEnvironment('production', {
      name: 'my-worker-prod',
      bindings: [d1Binding('DB', 'my-db', 'prod-id')],
    }),
  },
});
```

### Code Generation

#### `generateTOML(config, options?)`

Generate wrangler.toml content:

```typescript
import { generateTOML } from '@repo/wrangler-config';

const toml = generateTOML(config);
console.log(toml);
```

#### `generateJSONC(config, options?)`

Generate wrangler.jsonc content:

```typescript
import { generateJSONC } from '@repo/wrangler-config';

const jsonc = generateJSONC(config);
```

#### `writeConfigFile(config, path, format)`

Write configuration directly to file:

```typescript
import { writeConfigFile } from '@repo/wrangler-config';

await writeConfigFile(config, './wrangler.toml', 'toml');
```

## Presets

Use pre-configured patterns for common scenarios:

```typescript
import { defineConfig } from '@repo/wrangler-config';
import { commonBindings, environments } from '@repo/wrangler-config/presets';

export default defineConfig({
  name: 'my-worker',
  main: 'src/index.ts',
  compatibility_date: '2024-01-01',
  
  // Use common binding presets
  bindings: [
    commonBindings.cacheKV('CACHE', 'kv-id'),
    commonBindings.storageBucket('STORAGE', 'bucket-name'),
    commonBindings.productionD1('DB', 'database', 'db-id'),
  ],
  
  // Use standard environment profiles
  env: environments,
});
```

### Available Presets

**Binding Presets** (`commonBindings`):
- `productionD1(binding, dbName, dbId)` - Production D1 database
- `cacheKV(binding, namespaceId)` - Cache KV namespace
- `storageBucket(binding, bucketName)` - Storage R2 bucket
- `sessionKV(namespaceId)` - Session storage KV

**Environment Presets** (`environments`):
- `development` - Debug logging, development settings
- `staging` - Info logging, staging settings
- `production` - Warning logging, production settings

## Advanced Features

### Shared Base Configurations

Create reusable base configurations:

```typescript
// shared/base-config.ts
export const baseConfig = {
  compatibility_date: '2024-01-01',
  compatibility_flags: ['nodejs_compat'],
  bindings: [
    d1Binding('DB', 'shared-db', 'shared-db-id'),
  ],
};

// worker-a/wrangler.config.ts
import { defineConfig } from '@repo/wrangler-config';
import { baseConfig } from '../shared/base-config.js';

export default defineConfig({
  name: 'worker-a',
  main: 'src/index.ts',
  ...baseConfig,
});
```

### RPC Type Safety

Declare workers that expose RPC interfaces:

```typescript
export default defineConfig({
  name: 'auth-service',
  main: 'src/index.ts',
  compatibility_date: '2024-01-01',
  exposeRPC: true, // Enables type generation for this worker
});
```

Discover workers exposing RPC:

```typescript
import { discoverRPCWorkers } from '@repo/wrangler-config';

const workers = [workerA, workerB, workerC];
const rpcWorkers = discoverRPCWorkers(workers);
// Returns workers with exposeRPC: true
```

## Validation

Configuration is automatically validated when calling `defineConfig()`:

```typescript
try {
  const config = defineConfig({
    name: '', // Invalid: name cannot be empty
    main: 'src/index.ts',
    compatibility_date: '2024-01-01',
  });
} catch (error) {
  if (error instanceof ConfigValidationError) {
    console.error(error.path); // 'name'
    console.error(error.message); // 'String must contain at least 1 character(s)'
  }
}
```

## Migration Guide

Migrating from manual `wrangler.toml`:

1. **Install package**: `pnpm add @repo/wrangler-config`
2. **Create config file**: Copy values from `wrangler.toml` to `wrangler.config.ts`
3. **Add generation script**: Create `scripts/generate-config.ts`
4. **Update turbo.json**: Add `config:generate` task with dependencies
5. **Test**: Run `pnpm config:generate` and verify output

## Troubleshooting

### Configuration not generating

**Solution**: Ensure `tsx` is installed and the generate script exists:
```bash
pnpm add -D tsx
```

### Build fails with validation errors

**Solution**: Check the error message for the specific field and expected format. Common issues:
- Missing required fields (name, main, compatibility_date)
- Invalid date format (must be YYYY-MM-DD)
- Invalid main file extension (must be .ts or .js)

### Types not importing correctly

**Solution**: Ensure package exports are correctly configured in your tsconfig:
```json
{
  "compilerOptions": {
    "moduleResolution": "bundler"
  }
}
```

## Additional Documentation

- **Complete API Reference**: [contracts/config-api.md](../../specs/002-shared-wrangler-config/contracts/config-api.md)
- **Data Model**: [data-model.md](../../specs/002-shared-wrangler-config/data-model.md)
- **Technical Decisions**: [research.md](../../specs/002-shared-wrangler-config/research.md)
- **Quickstart Guide**: [quickstart.md](../../specs/002-shared-wrangler-config/quickstart.md)

## Contributing

This package is part of the monorepo starter template. For contribution guidelines, see [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

MIT
