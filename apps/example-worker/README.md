# Example Worker

A sample Cloudflare Worker demonstrating the monorepo template structure.

## Features

- ✅ TypeScript with strict type checking
- ✅ Hono framework for routing
- ✅ Shared types from `@repo/shared-types`
- ✅ Database support with `@repo/db` (Drizzle ORM + D1)
- ✅ ESLint and Prettier pre-configured
- ✅ Vitest for testing with Miniflare
- ✅ Hot reload during development

## Development

```bash
# Start development server
pnpm dev

# Run tests
pnpm test

# Type check
pnpm type-check

# Lint
pnpm lint
```

## Database Setup

This worker uses Cloudflare D1 for database storage. To set up the database:

```bash
# Create D1 databases (run from root or this directory)
npx wrangler d1 create example-db-dev
npx wrangler d1 create example-db-prod

# Update wrangler.toml with the database IDs returned above

# Generate migrations from schema
pnpm --filter @repo/db db:generate:d1

# Apply migrations to development database
npx wrangler d1 migrations apply example-db-dev --local

# Apply migrations to production database (when ready)
npx wrangler d1 migrations apply example-db-prod
```

The database schema is defined in `packages/db/src/schema/sqlite.ts`. After modifying the schema:

1. Generate new migrations: `pnpm --filter @repo/db db:generate:d1`
2. Apply to local: `npx wrangler d1 migrations apply example-db-dev --local`
3. Test your changes
4. Apply to production: `npx wrangler d1 migrations apply example-db-prod`

## Deployment

```bash
# Deploy to development
pnpm deploy

# Deploy to production
pnpm deploy:prod
```

## Project Structure

```
src/
├── index.ts        # Main entry point
├── types.ts        # Local type definitions
├── routes/         # Route handlers
└── handlers/       # Event handlers

test/
└── index.test.ts   # Integration tests
```

## API Endpoints

- `GET /` - Root endpoint
- `GET /health` - Health check
- `GET /api/users` - List all users (with database integration)
- `POST /api/users` - Create a new user (requires: `{ email, name }`)
