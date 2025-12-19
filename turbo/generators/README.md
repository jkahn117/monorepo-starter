# Turborepo Generator

This directory contains the Turborepo generator for scaffolding new Cloudflare Worker applications.

## Usage

Generate a new Cloudflare Worker:

```bash
pnpm gen cloudflare-worker
```

The generator will prompt you for:

1. **Worker Name** - The name of your worker (e.g., `my-api-worker`)
   - Must be lowercase, alphanumeric with hyphens only
   - Will be used as the directory name in `apps/`
   - Will be used as the package name (`@repo/my-api-worker`)

2. **Worker Type** - Choose the type of worker:
   - **HTTP Worker** - Handles HTTP requests (uses Hono framework)
   - **Scheduled Worker** - Runs on a cron schedule
   - **Both** - Handles both HTTP requests and scheduled tasks

3. **Bindings** - Select Cloudflare bindings you need:
   - **D1 Database** - SQL database for persistent storage
   - **KV** - Key-Value storage for caching
   - **R2** - Object storage for files
   - **Durable Objects** - Stateful objects

4. **Database Package** - Whether to include `@repo/db` package
   - Automatically asked if you selected D1 binding
   - Provides Drizzle ORM integration

## What Gets Generated

The generator creates:

```
apps/your-worker-name/
├── src/
│   ├── index.ts          # HTTP handler (if HTTP or Both)
│   ├── scheduled.ts      # Scheduled handler (if Scheduled or Both)
│   └── types.ts          # Local type definitions
├── test/
│   └── index.test.ts     # Tests (if HTTP or Both)
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── wrangler.toml         # Cloudflare Workers configuration
├── vitest.config.ts      # Test configuration
├── .env.example          # Environment variables template
└── README.md             # Worker-specific documentation
```

## Post-Generation

After generation, the generator automatically:

1. ✅ Installs dependencies (`pnpm install`)
2. ✅ Runs type check to verify compilation
3. ✅ Runs lint check to verify code quality

## Next Steps

After generating a worker, follow these steps:

### 1. Configure Cloudflare

Update `apps/your-worker/wrangler.toml` with your account ID:

```toml
account_id = "your_cloudflare_account_id"
```

### 2. Set Up D1 Database (if selected)

```bash
# Create databases
npx wrangler d1 create your-worker-db-dev
npx wrangler d1 create your-worker-db-prod

# Update wrangler.toml with database IDs
# Copy the IDs from the command output

# Apply migrations
cd apps/your-worker
npx wrangler d1 migrations apply your-worker-db-dev --local
npx wrangler d1 migrations apply your-worker-db-prod
```

### 3. Set Up KV Namespace (if selected)

```bash
# Create namespaces
npx wrangler kv:namespace create CACHE
npx wrangler kv:namespace create CACHE --env production

# Update wrangler.toml with namespace IDs
```

### 4. Set Up R2 Bucket (if selected)

```bash
# Create buckets
npx wrangler r2 bucket create your-worker-bucket-dev
npx wrangler r2 bucket create your-worker-bucket-prod

# Bucket names are already configured in wrangler.toml
```

### 5. Development

```bash
# Start development server
pnpm --filter @repo/your-worker dev

# Run tests
pnpm --filter @repo/your-worker test

# Type check
pnpm --filter @repo/your-worker type-check

# Lint
pnpm --filter @repo/your-worker lint
```

### 6. Deployment

```bash
# Deploy to development
pnpm --filter @repo/your-worker deploy

# Deploy to production
pnpm --filter @repo/your-worker deploy:prod
```

## Customization

### Modify Templates

Templates are located in `turbo/generators/templates/worker/`. Each file uses Handlebars syntax:

- `{{ kebabCase name }}` - Worker name in kebab-case
- `{{ pascalCase name }}` - Worker name in PascalCase
- `{{#if includeDatabase}}...{{/if}}` - Conditional sections
- `{{#if (includes bindings "d1")}}...{{/if}}` - Check if binding is selected

### Modify Generator Logic

Edit `turbo/generators/config.ts` to:

- Add new prompts
- Modify validation logic
- Add/remove file generation
- Customize post-generation actions

## Examples

### Generate HTTP API Worker with Database

```bash
$ pnpm gen cloudflare-worker

✔ What is the name of your worker? · users-api
✔ What type of worker? · HTTP Worker
✔ Which Cloudflare bindings? · D1 Database, KV
✔ Include @repo/db package? · Yes

✅ Worker created successfully!
📁 Location: apps/users-api
```

### Generate Scheduled Worker

```bash
$ pnpm gen cloudflare-worker

✔ What is the name of your worker? · daily-sync
✔ What type of worker? · Scheduled Worker
✔ Which Cloudflare bindings? · D1 Database, R2
✔ Include @repo/db package? · Yes

✅ Worker created successfully!
📁 Location: apps/daily-sync
```

### Generate Hybrid Worker

```bash
$ pnpm gen cloudflare-worker

✔ What is the name of your worker? · events-processor
✔ What type of worker? · Both HTTP and Scheduled
✔ Which Cloudflare bindings? · D1 Database, KV, R2, Durable Objects
✔ Include @repo/db package? · Yes

✅ Worker created successfully!
📁 Location: apps/events-processor
```

## Troubleshooting

### "Worker already exists"

Delete the existing worker directory:

```bash
rm -rf apps/your-worker-name
```

### "Type check failed"

This usually means:
1. Templates have syntax errors
2. Dependencies aren't properly configured
3. Shared packages aren't built

Fix by:
```bash
pnpm build
pnpm --filter @repo/your-worker type-check
```

### "Lint check failed"

Run lint with auto-fix:

```bash
pnpm --filter @repo/your-worker lint --fix
```

### Generated worker won't start

Ensure all dependencies are installed:

```bash
pnpm install
pnpm build
```

## Architecture

The generator uses:

- **Turborepo Gen** - Turborepo's built-in generator powered by Plop
- **Handlebars** - Template engine for file generation
- **Node.js** - For validation and post-generation actions

Generator flow:

1. Prompt user for configuration
2. Validate inputs (name format, uniqueness)
3. Generate files from templates
4. Install dependencies
5. Run type check and lint
6. Display next steps

## Contributing

To add features to the generator:

1. Update prompts in `config.ts`
2. Create/modify templates in `templates/worker/`
3. Test with `pnpm gen cloudflare-worker`
4. Update this README with documentation

## Resources

- [Turborepo Generators](https://turbo.build/repo/docs/core-concepts/monorepos/code-generation)
- [Plop Documentation](https://plopjs.com/)
- [Handlebars Documentation](https://handlebarsjs.com/)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
