# Architecture

This document explains the structure and design decisions of the Cloudflare Monorepo Template.

## Overview

The template is organized as a PNPM workspace monorepo with Turborepo for build orchestration. It follows modern TypeScript best practices and is optimized for Cloudflare Workers development.

## Directory Structure

```
.
├── .github/workflows/      # CI/CD automation
├── .vscode/                # Editor configuration
├── apps/                   # Application packages
├── packages/               # Shared packages
├── tests/integration/      # Cross-package tests
└── docs/                   # Documentation
```

### Applications (`apps/`)

Contains deployable Cloudflare Workers applications. Each app is independent and can be deployed separately.

**Example**: `apps/example-worker/`
- Complete Cloudflare Worker with Hono framework
- Health check and API endpoints
- Database integration example (D1)
- Vitest tests with Miniflare

**Structure**:
```
apps/example-worker/
├── src/
│   ├── index.ts            # Worker entry point
│   └── types.ts            # Local type definitions
├── test/
│   └── index.test.ts       # Worker tests
├── wrangler.toml           # Cloudflare configuration
├── package.json            # Dependencies and scripts
└── README.md               # App-specific documentation
```

### Shared Packages (`packages/`)

Reusable packages shared across all applications.

#### `@repo/shared-types`

TypeScript type definitions shared across all applications.

**Modules**:
- `api.ts` - API response types (ApiResponse, ErrorResponse, HealthCheckResponse, PaginatedResponse)
- `common.ts` - Common utility types (Nullable, WithId, WithTimestamps, DeepPartial, DeepReadonly)
- `database.ts` - Database types (DatabaseConfig, DatabaseClient, QueryMetadata, Transaction, Migration)
- `worker.ts` - Cloudflare Workers types (WorkerEnv, KVNamespace, R2Bucket, DurableObjectNamespace, handler types)
- `events.ts` - Event-driven architecture types (BaseEvent, DomainEvent, IntegrationEvent, EventBus, EventStore)

**Usage**:
```typescript
import type { ApiResponse, ErrorResponse } from "@repo/shared-types";
```

#### `@repo/db`

Database package with Drizzle ORM supporting PostgreSQL and Cloudflare D1.

**Modules**:
- `schema/shared.ts` - Common schema utilities (timestamps, id fields)
- `schema/postgres.ts` - PostgreSQL schemas (users, posts tables)
- `schema/sqlite.ts` - D1/SQLite schemas (users, posts tables)
- `client/postgres.ts` - PostgreSQL client factory
- `client/d1.ts` - D1 client factory

**Configuration**:
- `drizzle.config.postgres.ts` - PostgreSQL migrations
- `drizzle.config.d1.ts` - D1 migrations

**Usage**:
```typescript
import { createD1Client } from "@repo/db/client";
import { users } from "@repo/db/schema";
```

#### `@repo/eslint-config`

Shared ESLint configurations for consistent code quality.

**Configurations**:
- `base.js` - Base JavaScript rules
- `typescript.js` - TypeScript-specific rules
- `workers.js` - Cloudflare Workers environment rules
- `index.js` - Exports all configurations

#### `@repo/prettier-config`

Shared Prettier configuration enforcing:
- 2-space indentation
- Trailing commas
- Double quotes
- Semicolons
- LF line endings

#### `@repo/tsconfig`

Shared TypeScript configurations.

**Configurations**:
- `base.json` - Strict TypeScript settings (no implicit any)
- `worker.json` - Cloudflare Workers-specific settings
- `nuxt.json` - Nuxt.js-specific settings

### Integration Tests (`tests/integration/`)

Cross-package integration tests validating the entire monorepo.

**Tests**:
- `monorepo-structure.test.ts` - Validates directory structure
- `workspace-config.test.ts` - Validates PNPM workspace setup
- `build-pipeline.test.ts` - Validates Turborepo builds
- `type-sharing.test.ts` - Validates cross-package type usage

## Build System

### Turborepo Configuration

The `turbo.json` defines the build pipeline with caching and dependencies.

**Tasks**:
- `build` - Compiles TypeScript, caches outputs, respects dependencies
- `dev` - Starts development servers (persistent, no cache)
- `test` - Runs Vitest tests, caches coverage
- `lint` - Runs ESLint, caches results
- `deploy` - Deploys workers (depends on build, test, lint)

**Key Features**:
- Incremental builds (only rebuild changed packages)
- Remote caching support (share cache across team)
- Dependency graph awareness (build dependencies first)

### Package Management

PNPM workspace protocol enables referencing internal packages:

```json
{
  "dependencies": {
    "@repo/shared-types": "workspace:*",
    "@repo/db": "workspace:*"
  }
}
```

**Benefits**:
- Type-safe imports across packages
- Instant updates when dependencies change
- No need to publish packages to npm

## Type System

### Type Sharing Strategy

1. **Define once**: Types are defined in `@repo/shared-types`
2. **Import everywhere**: Applications import types using workspace protocol
3. **Type safety**: TypeScript ensures consistency across packages
4. **IDE support**: Full autocomplete and type checking

### Type Organization

Types are organized by domain:
- **API types**: Request/response structures
- **Common types**: Utility types for general use
- **Database types**: Database client and query types
- **Worker types**: Cloudflare Workers-specific types
- **Event types**: Event-driven architecture types

## Database Architecture

### Dual Database Support

The `@repo/db` package supports two database types:

1. **PostgreSQL** - For traditional server environments
   - Uses `@vercel/postgres` for serverless PostgreSQL
   - Schema in `schema/postgres.ts`
   - Client factory in `client/postgres.ts`

2. **Cloudflare D1** - For Workers environment
   - SQLite-compatible database
   - Schema in `schema/sqlite.ts`
   - Client factory in `client/d1.ts`

### Schema Design

Schemas are organized for code reuse:

- `shared.ts` - Common utilities (timestamps, id generation)
- `postgres.ts` - PostgreSQL-specific tables
- `sqlite.ts` - D1/SQLite-specific tables

Tables are defined once and adapted for each database type.

### Migrations

Drizzle Kit handles migrations:

```bash
# Generate migrations
pnpm --filter @repo/db db:generate

# Push to database
pnpm --filter @repo/db db:push:postgres  # For PostgreSQL
pnpm --filter @repo/db db:push:d1        # For D1
```

## Development Workflow

### Adding a New Worker

1. Create directory in `apps/`
2. Copy structure from `apps/example-worker/`
3. Update `package.json` with unique name
4. Configure `wrangler.toml` with bindings
5. Implement worker logic in `src/index.ts`
6. Add tests in `test/`

### Adding a Shared Package

1. Create directory in `packages/`
2. Add `package.json` with exports field
3. Add `tsconfig.json` extending `@repo/tsconfig/base.json`
4. Implement package logic
5. Add tests with Vitest
6. Reference in apps using `workspace:*`

### Making Changes

1. Make changes in any package
2. Run `pnpm build` - Turborepo rebuilds affected packages
3. Run `pnpm test` - Tests run for affected packages
4. Run `pnpm lint` - Linting checks code quality
5. Commit changes

## CI/CD Workflow

### Continuous Integration (`.github/workflows/ci.yml`)

Runs on push to `main` or `develop`:

1. **Setup** - Install Node.js 20, PNPM 8, dependencies
2. **Lint** - ESLint + Prettier format check
3. **Type Check** - TypeScript compilation check
4. **Test** - Vitest unit and integration tests
5. **Build** - Turborepo build with caching

### Pull Request Validation (`.github/workflows/pr.yml`)

Runs on all pull requests:

1. **Semantic PR** - Validates PR title format (conventional commits)
2. **Commit Format** - Checks commit message format
3. **Security** - Runs `npm audit` for vulnerabilities
4. **Conflicts** - Detects merge conflicts

## Performance Targets

- **Build time**: < 5 minutes for full monorepo with 10 apps
- **Install time**: < 2 minutes with PNPM
- **Worker cold start**: < 200ms
- **Test suite**: < 2 minutes

## Design Principles

1. **Type Safety**: Strict TypeScript with no implicit any
2. **Code Quality**: ESLint + Prettier enforce consistent style
3. **Test Coverage**: All packages have Vitest tests
4. **Fast Builds**: Turborepo caching minimizes rebuild time
5. **Developer Experience**: Hot reload, fast installs, clear errors
6. **Modularity**: Packages are independent and reusable
7. **Scalability**: Add new apps without affecting existing ones

## Technology Stack

- **Runtime**: Node.js 20+ LTS
- **Package Manager**: PNPM 8.14+
- **Build System**: Turborepo 1.11+
- **Language**: TypeScript 5.3+ (strict mode)
- **ORM**: Drizzle ORM 0.29+
- **Testing**: Vitest 1.1+
- **Linting**: ESLint 8.56+
- **Formatting**: Prettier 3.1+
- **Workers**: Cloudflare Workers (Wrangler CLI 3.22+)
- **Framework**: Hono (for HTTP routing)

## Extension Points

### Adding New Shared Types

1. Create new module in `packages/shared-types/src/`
2. Export from `packages/shared-types/src/index.ts`
3. Add tests in `packages/shared-types/test/`
4. Import in applications using `@repo/shared-types`

### Adding New Database Tables

1. Add schema to `packages/db/src/schema/postgres.ts` or `sqlite.ts`
2. Generate migrations with `pnpm db:generate`
3. Push to database with `pnpm db:push:*`
4. Import schema in workers

### Adding New ESLint Rules

1. Update configuration in `packages/eslint-config/`
2. Test in example worker
3. Run `pnpm lint` to validate

## Security Considerations

- Environment variables are not committed (`.env` in `.gitignore`)
- API tokens use Cloudflare Wrangler secrets
- Dependencies audited in CI/CD pipeline
- TypeScript strict mode prevents type errors
- ESLint rules prevent common security issues

## Future Enhancements

- [ ] Generator command (`turbo gen cloudflare-worker`)
- [ ] Nuxt.js example application
- [ ] Changesets for package versioning
- [ ] Remote caching configuration
- [ ] Docker support for local development
- [ ] End-to-end testing with Playwright

## References

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [PNPM Workspaces](https://pnpm.io/workspaces)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Hono Framework](https://hono.dev/)
