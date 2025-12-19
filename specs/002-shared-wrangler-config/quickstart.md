# Quickstart: Shared Wrangler Configuration

**Feature**: 002-shared-wrangler-config  
**Date**: 2025-12-19  
**Time to Complete**: ~10 minutes

## Overview

This guide shows you how to use the Shared Wrangler Configuration package to centralize and manage Cloudflare Workers configuration across your monorepo.

---

## Prerequisites

- PNPM workspace monorepo
- Turborepo configured
- Node.js 20+ LTS
- Cloudflare account with Workers access

---

## Installation

### Step 1: Install the Package

The `@repo/wrangler-config` package should already be available in your monorepo. If not, it will be added to your workspace automatically.

```bash
# Verify it's available
pnpm list @repo/wrangler-config
```

### Step 2: Add to Your Worker

Add the package as a dependency in your worker's `package.json`:

```json
{
  "name": "@repo/my-worker",
  "dependencies": {
    "@repo/wrangler-config": "workspace:*"
  },
  "scripts": {
    "config:generate": "tsx wrangler.config.ts",
    "dev": "pnpm config:generate && wrangler dev",
    "build": "pnpm config:generate && tsc --noEmit",
    "deploy": "pnpm config:generate && wrangler deploy"
  }
}
```

---

## Basic Usage

### Step 3: Create wrangler.config.ts

Create a new file `wrangler.config.ts` in your worker directory:

```typescript
// apps/my-worker/wrangler.config.ts
import { defineConfig, d1Binding, kvBinding } from '@repo/wrangler-config';

export default defineConfig({
  name: 'my-worker',
  main: 'src/index.ts',
  accountId: process.env.CF_ACCOUNT_ID,
  compatibility_date: '2024-01-01',
  compatibility_flags: ['nodejs_compat'],
  bindings: [
    d1Binding('DB', 'my-database', 'dev-db-id'),
    kvBinding('CACHE', 'dev-kv-id'),
  ],
});
```

### Step 4: Configure Turborepo

Update your `turbo.json` to include the config generation step:

```json
{
  "tasks": {
    "config:generate": {
      "cache": true,
      "outputs": ["wrangler.toml"],
      "inputs": ["wrangler.config.ts", "../../packages/wrangler-config/**"]
    },
    "dev": {
      "dependsOn": ["config:generate"],
      "cache": false,
      "persistent": true
    },
    "build": {
      "dependsOn": ["^build", "config:generate"],
      "outputs": ["dist/**"]
    }
  }
}
```

### Step 5: Generate Configuration

Run the generation command:

```bash
# Generate wrangler.toml
pnpm config:generate

# Or run dev (which generates automatically)
pnpm dev
```

Your `wrangler.toml` file is now generated from the TypeScript configuration!

---

## Adding Environments

### Step 6: Define Environment Profiles

Update your `wrangler.config.ts` to include environment-specific settings:

```typescript
import {
  defineConfig,
  defineEnvironment,
  d1Binding,
  kvBinding,
} from '@repo/wrangler-config';

export default defineConfig({
  name: 'my-worker',
  main: 'src/index.ts',
  accountId: process.env.CF_ACCOUNT_ID || 'dev-account-id',
  compatibility_date: '2024-01-01',
  compatibility_flags: ['nodejs_compat'],
  
  // Development bindings
  bindings: [
    d1Binding('DB', 'my-database', 'dev-db-id'),
    kvBinding('CACHE', 'dev-kv-id'),
  ],
  
  // Environment-specific overrides
  env: {
    staging: defineEnvironment('staging', {
      name: 'my-worker-staging',
      accountId: process.env.CF_STAGING_ACCOUNT_ID,
      bindings: [
        d1Binding('DB', 'my-database', 'staging-db-id'),
        kvBinding('CACHE', 'staging-kv-id'),
      ],
    }),
    
    production: defineEnvironment('production', {
      name: 'my-worker-prod',
      accountId: process.env.CF_PROD_ACCOUNT_ID,
      bindings: [
        d1Binding('DB', 'my-database', 'prod-db-id'),
        kvBinding('CACHE', 'prod-kv-id'),
      ],
    }),
  },
});
```

### Step 7: Deploy to Different Environments

```bash
# Development (default)
pnpm dev

# Staging
CF_STAGING_ACCOUNT_ID=xxx pnpm deploy --env staging

# Production
CF_PROD_ACCOUNT_ID=xxx pnpm deploy --env production
```

---

## Using Presets

### Step 8: Import Common Bindings

Use pre-configured binding patterns for common scenarios:

```typescript
import { defineConfig } from '@repo/wrangler-config';
import { commonBindings, environments } from '@repo/wrangler-config/presets';

export default defineConfig({
  name: 'my-worker',
  main: 'src/index.ts',
  compatibility_date: '2024-01-01',
  
  bindings: [
    // Use preset for cache
    commonBindings.cacheKV('CACHE', 'my-kv-id'),
    
    // Use preset for storage
    commonBindings.storageBucket('STORAGE', 'my-bucket'),
    
    // Use preset for database
    commonBindings.productionD1('DB', 'my-db', 'my-db-id'),
  ],
  
  // Use preset environments
  env: environments,
});
```

---

## Configuration Validation

### Step 9: Validate Before Deployment

Add validation to your pre-deploy script:

```typescript
// scripts/validate-config.ts
import { validateBeforeDeploy } from '@repo/wrangler-config';
import config from '../wrangler.config.js';

const environment = process.env.CF_ENVIRONMENT || 'development';
const result = validateBeforeDeploy(config, environment);

if (!result.valid) {
  console.error('❌ Configuration validation failed:');
  result.errors.forEach(error => {
    console.error(`  - ${error.path}: ${error.message}`);
  });
  process.exit(1);
}

if (result.warnings.length > 0) {
  console.warn('⚠️  Configuration warnings:');
  result.warnings.forEach(warning => {
    console.warn(`  - ${warning.path}: ${warning.message}`);
  });
}

console.log('✅ Configuration is valid');
```

Update `package.json`:

```json
{
  "scripts": {
    "validate": "tsx scripts/validate-config.ts",
    "predeploy": "pnpm validate"
  }
}
```

---

## Sharing Configuration

### Step 10: Create Shared Base Config

Create a shared configuration file that multiple workers can use:

```typescript
// packages/wrangler-config/src/presets/my-base-config.ts
import { defineConfig, d1Binding } from '../builders';

export const myBaseConfig = defineConfig({
  accountId: process.env.CF_ACCOUNT_ID,
  compatibility_date: '2024-01-01',
  compatibility_flags: ['nodejs_compat'],
  bindings: [
    d1Binding('DB', 'shared-db', 'shared-db-id'),
  ],
});
```

### Step 11: Use in Multiple Workers

```typescript
// apps/worker-a/wrangler.config.ts
import { defineConfig } from '@repo/wrangler-config';
import { myBaseConfig } from '@repo/wrangler-config/presets/my-base-config';

export default defineConfig({
  ...myBaseConfig,
  name: 'worker-a',
  main: 'src/index.ts',
});
```

```typescript
// apps/worker-b/wrangler.config.ts
import { defineConfig } from '@repo/wrangler-config';
import { myBaseConfig } from '@repo/wrangler-config/presets/my-base-config';

export default defineConfig({
  ...myBaseConfig,
  name: 'worker-b',
  main: 'src/index.ts',
});
```

---

## Environment Variables

### Step 12: Set Up .env Files

Create environment variable files:

```bash
# .env.development
CF_ACCOUNT_ID=dev-account-id-123
CF_DB_ID=dev-db-id-456

# .env.production
CF_ACCOUNT_ID=prod-account-id-789
CF_DB_ID=prod-db-id-012
```

Load them in your config:

```typescript
import { config } from 'dotenv';

// Load environment-specific vars
config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

export default defineConfig({
  accountId: process.env.CF_ACCOUNT_ID,
  bindings: [
    d1Binding('DB', 'my-db', process.env.CF_DB_ID!),
  ],
});
```

---

## Testing

### Step 13: Test Configuration Generation

Create a test file:

```typescript
// apps/my-worker/test/config.test.ts
import { describe, it, expect } from 'vitest';
import { validateConfig } from '@repo/wrangler-config';
import config from '../wrangler.config.js';

describe('Worker Configuration', () => {
  it('should have valid configuration', () => {
    const result = validateConfig(config);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should have production environment', () => {
    expect(config.env).toHaveProperty('production');
  });

  it('should have required bindings', () => {
    expect(config.bindings).toContainEqual(
      expect.objectContaining({ binding: 'DB' })
    );
  });
});
```

Run tests:

```bash
pnpm test
```

---

## Common Patterns

### Pattern 1: Multiple Binding Types

```typescript
import {
  defineConfig,
  d1Binding,
  kvBinding,
  r2Binding,
  durableObjectBinding,
} from '@repo/wrangler-config';

export default defineConfig({
  name: 'full-featured-worker',
  main: 'src/index.ts',
  compatibility_date: '2024-01-01',
  bindings: [
    d1Binding('DB', 'database', 'db-id'),
    kvBinding('CACHE', 'kv-id'),
    r2Binding('STORAGE', 'bucket-name'),
    durableObjectBinding('COUNTER', 'Counter', 'counter-worker'),
  ],
});
```

### Pattern 2: Conditional Bindings

```typescript
const isDevelopment = process.env.NODE_ENV === 'development';

export default defineConfig({
  name: 'my-worker',
  main: 'src/index.ts',
  compatibility_date: '2024-01-01',
  bindings: [
    d1Binding('DB', 'my-db', isDevelopment ? 'local-db' : 'prod-db'),
    ...(isDevelopment ? [kvBinding('DEBUG', 'debug-kv')] : []),
  ],
});
```

### Pattern 3: Computed Values

```typescript
const workerName = process.env.WORKER_NAME || 'default-worker';
const dbId = `${workerName}-db-${process.env.NODE_ENV}`;

export default defineConfig({
  name: workerName,
  main: 'src/index.ts',
  compatibility_date: '2024-01-01',
  bindings: [
    d1Binding('DB', workerName, dbId),
  ],
});
```

---

## Troubleshooting

### Problem: "Cannot find module @repo/wrangler-config"

**Solution**: Install dependencies
```bash
pnpm install
```

### Problem: "wrangler.toml is not generated"

**Solution**: Run config generation manually
```bash
pnpm config:generate
```

Check that the script exists in package.json and turbo.json dependencies are correct.

### Problem: "Invalid configuration"

**Solution**: Run validation
```bash
pnpm validate
```

Read the error messages - they include the exact field and expected format.

### Problem: "Environment variables not loaded"

**Solution**: Check .env file location and name
```bash
# Create .env file
cp .env.example .env

# Load in config
import { config } from 'dotenv';
config();
```

### Problem: "Wrangler can't parse generated file"

**Solution**: Check generated wrangler.toml syntax
```bash
# View generated file
cat wrangler.toml

# Validate with wrangler
wrangler dev --dry-run
```

---

## Next Steps

1. ✅ Configure your first worker with shared config
2. ✅ Add environment profiles (staging, production)
3. ✅ Set up environment variables
4. ✅ Create shared base configurations
5. ✅ Add validation to CI/CD pipeline
6. ✅ Migrate existing workers gradually

---

## Resources

- **API Documentation**: See [contracts/config-api.md](./contracts/config-api.md)
- **Data Model**: See [data-model.md](./data-model.md)
- **Research Decisions**: See [research.md](./research.md)
- **Implementation Plan**: See [plan.md](./plan.md)

---

## Example Repository Structure

```
monorepo/
├── packages/
│   └── wrangler-config/
│       ├── src/
│       │   ├── builders/
│       │   ├── validators/
│       │   ├── generators/
│       │   └── presets/
│       └── package.json
├── apps/
│   ├── worker-a/
│   │   ├── wrangler.config.ts    # TypeScript config
│   │   ├── wrangler.toml          # Generated file
│   │   └── package.json
│   └── worker-b/
│       ├── wrangler.config.ts
│       ├── wrangler.toml
│       └── package.json
├── .env.development
├── .env.production
└── turbo.json
```

---

## Status

✅ **Complete** - Ready to use

Follow this guide to get started with Shared Wrangler Configuration in under 10 minutes!
