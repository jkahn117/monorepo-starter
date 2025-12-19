# Generator API Contract

**Version**: 1.0.0  
**Date**: 2025-12-18  
**Feature**: 001-cloudflare-monorepo-template

## Overview

This document defines the interface contract for the Turbo generator that scaffolds new Cloudflare Worker applications. The generator provides a CLI-based interface for creating new applications with consistent structure and configuration.

---

## CLI Interface

### Command

```bash
turbo gen cloudflare-worker
```

### Interactive Prompts

The generator presents a series of interactive prompts to collect user input:

#### 1. Worker Name

**Prompt**: `Worker name (lowercase with hyphens):`

**Input Type**: Text input

**Validation**:
- Required: Yes
- Format: Lowercase letters, numbers, and hyphens only
- Pattern: `/^[a-z0-9-]+$/`
- Min length: 1 character
- Max length: 50 characters

**Error Messages**:
- Empty input: "Worker name is required"
- Invalid format: "Name must contain only lowercase letters, numbers, and hyphens"
- Too long: "Name must be 50 characters or less"

**Examples**:
- Valid: `api-worker`, `user-service`, `data-processor`
- Invalid: `ApiWorker`, `api_worker`, `API-WORKER`

---

#### 2. Worker Type

**Prompt**: `Worker type:`

**Input Type**: Single-choice selection (list)

**Options**:
1. `http` - HTTP request/response worker
2. `scheduled` - Cron-scheduled worker
3. `queue-consumer` - Queue consumer worker
4. `durable-object` - Durable Object worker

**Default**: `http`

**Validation**:
- Required: Yes
- Must be one of the predefined options

**Implications**:
- `http`: Generates worker with Hono framework and HTTP routes
- `scheduled`: Adds cron triggers to wrangler.toml
- `queue-consumer`: Configures queue bindings
- `durable-object`: Creates Durable Object class template

---

#### 3. Include Database (D1)

**Prompt**: `Include D1 database support?`

**Input Type**: Boolean (yes/no confirmation)

**Default**: `false`

**Validation**: None (boolean selection)

**Implications**:
- `true`: 
  - Adds `@repo/db` dependency
  - Configures D1 binding in wrangler.toml
  - Includes database initialization code
  - Generates schema.sql template
- `false`: No database-related code or configuration

---

#### 4. Include Key-Value Store (KV)

**Prompt**: `Include KV namespace support?`

**Input Type**: Boolean (yes/no confirmation)

**Default**: `false`

**Validation**: None (boolean selection)

**Implications**:
- `true`:
  - Configures KV binding in wrangler.toml
  - Includes KV helper utilities
  - Adds KV usage examples
- `false`: No KV-related code or configuration

---

#### 5. Include R2 Storage

**Prompt**: `Include R2 bucket support?`

**Input Type**: Boolean (yes/no confirmation)

**Default**: `false`

**Validation**: None (boolean selection)

**Implications**:
- `true`:
  - Configures R2 binding in wrangler.toml
  - Includes R2 upload/download utilities
  - Adds R2 usage examples
- `false`: No R2-related code or configuration

---

#### 6. Include Shared Types

**Prompt**: `Import shared types package?`

**Input Type**: Boolean (yes/no confirmation)

**Default**: `true`

**Validation**: None (boolean selection)

**Implications**:
- `true`:
  - Adds `@repo/shared-types` dependency
  - Imports common types in generated code
- `false`: Worker uses only local type definitions

---

## Generated File Structure

Based on user inputs, the generator creates the following structure:

```
apps/
└── {worker-name}/
    ├── src/
    │   ├── index.ts                 # Main entry point (always)
    │   ├── types.ts                 # Local type definitions (always)
    │   ├── routes/                  # HTTP routes (if workerType = http)
    │   │   └── index.ts
    │   ├── handlers/                # Event handlers (if workerType = scheduled/queue)
    │   │   └── scheduled.ts
    │   ├── db/                      # Database utilities (if includeDb = true)
    │   │   └── client.ts
    │   ├── kv/                      # KV utilities (if includeKv = true)
    │   │   └── cache.ts
    │   └── r2/                      # R2 utilities (if includeR2 = true)
    │       └── storage.ts
    ├── test/
    │   └── index.test.ts            # Test file (always)
    ├── wrangler.toml                # Cloudflare config (always)
    ├── package.json                 # Package manifest (always)
    ├── tsconfig.json                # TypeScript config (always)
    ├── vitest.config.ts             # Test config (always)
    ├── schema.sql                   # Database schema (if includeDb = true)
    └── README.md                    # Documentation (always)
```

---

## Generated File Templates

### package.json

```json
{
  "name": "@repo/{worker-name}",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "wrangler dev",
    "build": "tsc && wrangler deploy --dry-run",
    "deploy": "wrangler deploy",
    "deploy:prod": "wrangler deploy --env production",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint src",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "hono": "^4.0.0"
    // Conditional dependencies added based on prompts
  },
  "devDependencies": {
    "@repo/eslint-config": "workspace:*",
    "@repo/prettier-config": "workspace:*",
    "@repo/tsconfig": "workspace:*",
    "@cloudflare/workers-types": "^4.0.0",
    "wrangler": "^3.22.0",
    "typescript": "^5.3.0",
    "vitest": "^1.1.0"
  },
  "prettier": "@repo/prettier-config"
}
```

**Conditional Dependencies**:
- If `includeDb = true`: Add `"@repo/db": "workspace:*"`
- If `includeSharedTypes = true`: Add `"@repo/shared-types": "workspace:*"`

---

### wrangler.toml

**Base Configuration** (all workers):

```toml
name = "{worker-name}"
main = "src/index.ts"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

# Development
[env.development]
name = "{worker-name}-dev"
```

**Conditional Sections**:

**If workerType = scheduled**:

```toml
[triggers]
crons = ["0 0 * * *"]  # Daily at midnight UTC
```

**If workerType = queue-consumer**:

```toml
[[queues.consumers]]
queue = "{worker-name}-queue"
max_batch_size = 10
max_batch_timeout = 30
```

**If includeDb = true**:

```toml
[[d1_databases]]
binding = "DB"
database_name = "{worker-name}-db"
database_id = ""  # User fills this in

[env.production.d1_databases]
binding = "DB"
database_name = "{worker-name}-db-prod"
database_id = ""  # User fills this in
```

**If includeKv = true**:

```toml
[[kv_namespaces]]
binding = "KV"
id = ""  # User fills this in

[[env.production.kv_namespaces]]
binding = "KV"
id = ""  # User fills this in
```

**If includeR2 = true**:

```toml
[[r2_buckets]]
binding = "BUCKET"
bucket_name = "{worker-name}-bucket"

[[env.production.r2_buckets]]
binding = "BUCKET"
bucket_name = "{worker-name}-bucket-prod"
```

---

### src/index.ts

**HTTP Worker** (workerType = http):

```typescript
import { Hono } from 'hono';
// Conditional imports based on prompts

interface Env {
  // Conditional bindings
}

const app = new Hono<{ Bindings: Env }>();

app.get('/', (c) => {
  return c.json({ message: 'Hello from {worker-name}!' });
});

// Conditional routes/handlers

export default app;
```

**Scheduled Worker** (workerType = scheduled):

```typescript
interface Env {
  // Conditional bindings
}

export default {
  async scheduled(
    event: ScheduledEvent,
    env: Env,
    ctx: ExecutionContext
  ): Promise<void> {
    console.log('Scheduled task running:', new Date().toISOString());
    // Task logic here
  },
};
```

---

### test/index.test.ts

```typescript
import { describe, it, expect } from 'vitest';

describe('{worker-name}', () => {
  it('should pass basic test', () => {
    expect(true).toBe(true);
  });
  
  // Additional tests based on worker type
});
```

---

## Output Messages

### Success Messages

**Start**:
```
🚀 Creating new Cloudflare Worker: {worker-name}
```

**Progress**:
```
✓ Created directory: apps/{worker-name}
✓ Generated package.json
✓ Generated wrangler.toml
✓ Generated TypeScript configuration
✓ Generated source files
✓ Generated test files
```

**Completion**:
```
✅ Worker created successfully!

Next steps:
  1. cd apps/{worker-name}
  2. pnpm install
  3. Update wrangler.toml with your resource IDs
  4. pnpm dev

For deployment:
  pnpm deploy
```

### Error Messages

**Directory Already Exists**:
```
❌ Error: Worker '{worker-name}' already exists at apps/{worker-name}
Please choose a different name or remove the existing directory.
```

**Invalid Input**:
```
❌ Error: Invalid worker name '{input}'
Name must contain only lowercase letters, numbers, and hyphens.
```

**File Generation Failed**:
```
❌ Error: Failed to create file: {file-path}
{error-details}
```

---

## Post-Generation Actions

The generator automatically performs these actions after file generation:

1. **Update PNPM Workspace**: Verifies new package is recognized
2. **Type Check**: Runs `tsc --noEmit` to verify generated code compiles
3. **Lint Check**: Runs `eslint` to ensure code quality
4. **Install Dependencies**: Optionally runs `pnpm install` in the new package

---

## Exit Codes

- `0`: Success - worker created successfully
- `1`: Validation error - invalid user input
- `2`: File system error - failed to create files
- `3`: Workspace error - failed to update PNPM workspace
- `4`: Compilation error - generated code doesn't compile

---

## Configuration Options

### Non-Interactive Mode

```bash
turbo gen cloudflare-worker -- \
  --name api-worker \
  --type http \
  --db \
  --kv \
  --no-r2 \
  --shared-types
```

**Flags**:
- `--name <string>`: Worker name (required)
- `--type <http|scheduled|queue|durable>`: Worker type (default: http)
- `--db`: Include D1 database support
- `--kv`: Include KV namespace support
- `--r2`: Include R2 bucket support
- `--shared-types`: Import shared types package (default: true)
- `--no-shared-types`: Skip shared types import

---

## Validation Rules

1. **Worker Name Uniqueness**: Must not conflict with existing apps
2. **File System Access**: Must have write permissions to `apps/` directory
3. **PNPM Workspace**: Must be run from monorepo root
4. **Dependency Availability**: Referenced packages must exist in workspace
5. **Template Integrity**: All template files must exist and be valid

---

## Extensibility

### Adding Custom Worker Types

To add a new worker type:

1. Add type to generator prompt choices
2. Create template files in `turbo/generators/templates/{type}/`
3. Update generator actions to handle new type
4. Document new type in generator help text

### Adding Custom Bindings

To add a new binding type:

1. Add boolean prompt for new binding
2. Create template snippet for wrangler.toml
3. Create utility file template for binding usage
4. Update TypeScript Env interface template

---

## Example Usage Scenarios

### Scenario 1: Simple HTTP API

**Inputs**:
- Name: `user-api`
- Type: `http`
- Database: Yes
- KV: No
- R2: No
- Shared Types: Yes

**Generated Structure**:
```
apps/user-api/
├── src/
│   ├── index.ts        # HTTP routes with Hono
│   ├── db/client.ts    # D1 client
│   └── types.ts
├── wrangler.toml       # With D1 binding
└── package.json        # With @repo/db dependency
```

---

### Scenario 2: Scheduled Background Job

**Inputs**:
- Name: `data-sync`
- Type: `scheduled`
- Database: Yes
- KV: Yes
- R2: No
- Shared Types: Yes

**Generated Structure**:
```
apps/data-sync/
├── src/
│   ├── index.ts           # Scheduled handler
│   ├── handlers/
│   │   └── sync.ts
│   ├── db/client.ts       # D1 client
│   └── kv/cache.ts        # KV utilities
├── wrangler.toml          # With cron trigger, D1 and KV bindings
└── package.json
```

---

### Scenario 3: Static Asset Worker

**Inputs**:
- Name: `cdn-worker`
- Type: `http`
- Database: No
- KV: Yes (for cache)
- R2: Yes (for assets)
- Shared Types: No

**Generated Structure**:
```
apps/cdn-worker/
├── src/
│   ├── index.ts          # HTTP handler
│   ├── kv/cache.ts       # Cache layer
│   └── r2/storage.ts     # Asset storage
├── wrangler.toml         # With KV and R2 bindings
└── package.json
```

---

## Testing the Generator

### Unit Tests

Test each component:
- Input validation logic
- Template rendering
- File generation
- Error handling

### Integration Tests

Test complete workflow:
- Run generator with various input combinations
- Verify generated files exist and are valid
- Compile generated TypeScript
- Run generated tests
- Deploy to Cloudflare (staging)

### Contract Tests

Verify:
- CLI interface matches documentation
- Output messages are consistent
- Exit codes are correct
- Non-interactive mode works

---

## Maintenance

### Version Compatibility

- Generator version must match template version
- Template updates require generator updates
- Breaking changes require major version bump

### Template Updates

When updating templates:
1. Update template files in `turbo/generators/templates/`
2. Update this contract documentation
3. Test with all worker type combinations
4. Update generator version in config

---

## Notes

- This contract defines the **user-facing interface** only
- Internal implementation details are not specified
- Templates must follow constitution requirements (2-space indentation, trailing commas, strict TypeScript)
- Generated code must pass linting and type checking
- All generated workers must be immediately deployable after configuration
