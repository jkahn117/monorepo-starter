# Generator Guide

The Cloudflare Monorepo Template includes a powerful code generator to quickly scaffold new Cloudflare Worker applications with consistent configuration.

## Quick Start

```bash
pnpm gen cloudflare-worker
```

Follow the interactive prompts to create your worker.

## Generator Features

- ✅ Interactive prompts for configuration
- ✅ Multiple worker types (HTTP, Scheduled, Both)
- ✅ Cloudflare bindings support (D1, KV, R2, Durable Objects)
- ✅ Optional database integration
- ✅ Automatic dependency installation
- ✅ Post-generation validation (type check, lint)
- ✅ Consistent with monorepo standards

## Configuration Options

### 1. Worker Name

The name of your worker application.

**Requirements**:
- Lowercase letters, numbers, and hyphens only
- Must be unique (not already exist in `apps/`)
- Used for directory name and package name

**Examples**:
- `users-api`
- `email-worker`
- `data-sync-service`

### 2. Worker Type

Choose the type of worker to generate:

#### HTTP Worker
- Handles HTTP requests
- Uses Hono framework for routing
- Includes health check and example endpoints
- Perfect for APIs and web services

**Generated files**:
- `src/index.ts` - HTTP handler with Hono
- `test/index.test.ts` - HTTP endpoint tests

#### Scheduled Worker
- Runs on a cron schedule
- No HTTP endpoints
- Perfect for background tasks

**Generated files**:
- `src/scheduled.ts` - Scheduled event handler
- `wrangler.toml` with cron configuration

#### Both HTTP and Scheduled
- Combines both capabilities
- Single worker with dual functionality
- Share code and bindings

**Generated files**:
- `src/index.ts` - HTTP handler
- `src/scheduled.ts` - Scheduled handler
- `test/index.test.ts` - Tests

### 3. Cloudflare Bindings

Select the Cloudflare services your worker needs:

#### D1 Database
- SQLite-compatible database
- Perfect for relational data
- Low latency queries

**Configuration added** (in `wrangler.config.ts`):
```typescript
import { d1Binding } from '@repo/wrangler-config';

bindings: [
  d1Binding('DB', 'your-worker-db', 'your-worker-db-dev'),
]
```

**Setup required**:
```bash
npx wrangler d1 create your-worker-db-dev
npx wrangler d1 create your-worker-db-prod
```

#### KV (Key-Value Storage)
- Fast key-value store
- Perfect for caching
- Global replication

**Configuration added** (in `wrangler.config.ts`):
```typescript
import { kvBinding } from '@repo/wrangler-config';

bindings: [
  kvBinding('CACHE', 'YOUR_KV_NAMESPACE_ID'),
]
```

**Setup required**:
```bash
npx wrangler kv:namespace create CACHE
npx wrangler kv:namespace create CACHE --env production
```

#### R2 (Object Storage)
- S3-compatible object storage
- Perfect for files and media
- No egress fees

**Configuration added** (in `wrangler.config.ts`):
```typescript
import { r2Binding } from '@repo/wrangler-config';

bindings: [
  r2Binding('STORAGE', 'your-worker-bucket'),
]
```

**Setup required**:
```bash
npx wrangler r2 bucket create your-worker-bucket-dev
npx wrangler r2 bucket create your-worker-bucket-prod
```

#### Durable Objects
- Stateful objects with coordination
- Perfect for real-time features
- Strong consistency

**Configuration added** (in `wrangler.config.ts`):
```typescript
import { durableObjectBinding } from '@repo/wrangler-config';

bindings: [
  durableObjectBinding('MY_DURABLE_OBJECT', 'MyDurableObject', 'your-worker'),
]
```

### 4. Database Package

Option to include `@repo/db` package with Drizzle ORM.

**When to use**:
- ✅ If you selected D1 binding
- ✅ If you want type-safe database queries
- ✅ If you want to share schemas across workers

**Includes**:
- Drizzle ORM client
- Pre-defined schemas (users, posts)
- Migration support
- Type-safe queries

## Generated Structure

```
apps/your-worker/
├── src/
│   ├── index.ts          # Main entry (HTTP)
│   ├── scheduled.ts      # Scheduled handler (optional)
│   └── types.ts          # Local type definitions
├── scripts/
│   └── generate-config.ts # Config generation script
├── test/
│   └── index.test.ts     # Integration tests
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── wrangler.config.ts    # TypeScript configuration (source)
├── wrangler.toml         # Generated TOML (auto-created)
├── vitest.config.ts      # Test configuration
├── .env.example          # Environment template
└── README.md             # Worker documentation
```

## Post-Generation Workflow

The generator automatically performs these steps:

### 1. File Generation
Creates all files from templates with your configuration.

### 2. Dependency Installation
Runs `pnpm install` to install dependencies.

### 3. Type Checking
Runs `pnpm type-check` to ensure code compiles.

### 4. Lint Checking
Runs `pnpm lint` to verify code quality.

### 5. Success Message
Displays next steps for configuration.

## Next Steps After Generation

### Step 1: Configure Cloudflare Account

Update `wrangler.config.ts`:

```typescript
import { defineConfig } from '@repo/wrangler-config';

export default defineConfig({
  name: 'your-worker',
  main: 'src/index.ts',
  compatibility_date: '2024-01-01',
  account_id: 'YOUR_CLOUDFLARE_ACCOUNT_ID', // Add this
  bindings: [
    // Your bindings here
  ],
});
```

Get your account ID from [Cloudflare Dashboard](https://dash.cloudflare.com).

Then generate `wrangler.toml`:

```bash
pnpm --filter @repo/your-worker config:generate
```

### Step 2: Set Up Bindings

Follow the setup instructions for each binding you selected:

- **D1**: Create databases and apply migrations
- **KV**: Create namespaces and update IDs
- **R2**: Create buckets
- **DO**: Implement Durable Object class

### Step 3: Review Generated Code

Check the generated files and customize:

- `src/index.ts` or `src/scheduled.ts` - Main logic
- `src/types.ts` - Add custom types
- `test/index.test.ts` - Add more tests
- `README.md` - Update documentation

### Step 4: Development

```bash
# Start development server
pnpm --filter @repo/your-worker dev

# Open http://localhost:8787
```

### Step 5: Testing

```bash
# Run tests
pnpm --filter @repo/your-worker test

# Watch mode
pnpm --filter @repo/your-worker test:watch
```

### Step 6: Deployment

```bash
# Deploy to development
pnpm --filter @repo/your-worker deploy

# Deploy to production
pnpm --filter @repo/your-worker deploy:prod
```

## Examples

### Example 1: REST API with Database

```bash
$ pnpm gen cloudflare-worker

✔ Worker name? · users-api
✔ Worker type? · HTTP Worker
✔ Bindings? · D1 Database, KV
✔ Include @repo/db? · Yes
```

**Use case**: User management API with caching

**Next steps**:
1. Create D1 databases
2. Apply migrations
3. Implement user CRUD endpoints
4. Add authentication

### Example 2: Daily Background Job

```bash
$ pnpm gen cloudflare-worker

✔ Worker name? · daily-reports
✔ Worker type? · Scheduled Worker
✔ Bindings? · D1 Database, R2
✔ Include @repo/db? · Yes
```

**Use case**: Generate daily reports and store in R2

**Next steps**:
1. Create D1 database for query data
2. Create R2 bucket for reports
3. Implement report generation logic
4. Configure cron schedule

### Example 3: WebSocket Server

```bash
$ pnpm gen cloudflare-worker

✔ Worker name? · websocket-server
✔ Worker type? · Both HTTP and Scheduled
✔ Bindings? · Durable Objects, KV
✔ Include @repo/db? · No
```

**Use case**: Real-time WebSocket server with cleanup job

**Next steps**:
1. Implement Durable Object for WebSocket connections
2. Add HTTP endpoint for connection upgrades
3. Add scheduled handler for stale connection cleanup
4. Configure connection tracking in KV

## Advanced Customization

### Modify Templates

Templates are in `turbo/generators/templates/worker/`.

**Edit existing template**:

```bash
# Edit the HTTP handler template
vim turbo/generators/templates/worker/src/index.ts.hbs
```

**Handlebars helpers available**:
- `{{ kebabCase name }}` - Lowercase with hyphens
- `{{ pascalCase name }}` - UpperCamelCase
- `{{#if condition}}...{{/if}}` - Conditional blocks
- `{{#if (includes bindings "d1")}}...{{/if}}` - Check array

### Modify Generator Logic

Edit `turbo/generators/config.ts` to:

**Add new prompt**:

```typescript
{
  type: "confirm",
  name: "includeAuth",
  message: "Do you want to include authentication?",
  default: false,
}
```

**Add new validation**:

```typescript
validate: (input: string) => {
  if (input.length < 3) {
    return "Name must be at least 3 characters";
  }
  return true;
}
```

**Add new action**:

```typescript
{
  type: "add",
  path: `${basePath}/src/auth.ts`,
  templateFile: "templates/worker/src/auth.ts.hbs",
}
```

## Troubleshooting

### Problem: "Worker already exists"

**Solution**:
```bash
rm -rf apps/your-worker
pnpm gen cloudflare-worker
```

### Problem: "Type check failed after generation"

**Causes**:
- Templates have syntax errors
- Shared packages not built

**Solution**:
```bash
pnpm build
pnpm --filter @repo/your-worker type-check
```

### Problem: "Cannot find module '@repo/shared-types'"

**Solution**:
```bash
pnpm build
pnpm install
```

### Problem: "Lint errors after generation"

**Solution**:
```bash
pnpm --filter @repo/your-worker lint --fix
pnpm format
```

### Problem: "Generator prompts not appearing"

**Solution**:
- Ensure `@turbo/gen` is installed: `pnpm install`
- Check Node.js version: `node --version` (should be 20+)
- Run with verbose output: `pnpm gen cloudflare-worker --verbose`

## Best Practices

### 1. Naming Conventions

- Use kebab-case: `my-api-worker`
- Be descriptive: `user-auth-api` not `api1`
- Include purpose: `email-sender`, `data-processor`

### 2. Worker Types

- Choose **HTTP** for APIs and web services
- Choose **Scheduled** for batch jobs and maintenance
- Choose **Both** only when you need to share state/bindings

### 3. Bindings

- Only select bindings you need (avoid over-provisioning)
- Use **D1** for relational data
- Use **KV** for caching and simple key-value
- Use **R2** for large files and media
- Use **DO** for real-time and stateful features

### 4. Database Package

- Include `@repo/db` if using D1
- Skip if you don't need database access
- Share schemas across workers when possible

### 5. After Generation

- Review all generated code before deploying
- Update README with worker-specific documentation
- Add tests for your custom logic
- Configure secrets for sensitive data

## Resources

- [Turborepo Generators](https://turbo.build/repo/docs/core-concepts/monorepos/code-generation)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Hono Framework](https://hono.dev/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Generator README](../turbo/generators/README.md)
