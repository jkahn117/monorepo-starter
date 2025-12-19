# Research: Cloudflare Monorepo Template

**Date**: 2025-12-18  
**Feature**: 001-cloudflare-monorepo-template

## Overview

This document consolidates research findings for building a production-ready Cloudflare monorepo template using Turborepo, PNPM, TypeScript, Drizzle ORM, and optional Nuxt.js support.

---

## 1. Turborepo Configuration for Cloudflare Workers

### Decision: Optimal Pipeline Configuration

**Chosen Approach**: Use Turborepo with task dependencies, incremental caching, and Cloudflare-specific output exclusions.

**Rationale**:
- Turborepo provides excellent monorepo build orchestration with caching
- Task dependencies (`^build`) ensure proper build order
- Cloudflare Workers produce `.wrangler/` artifacts that need careful cache management
- Incremental builds reduce CI/CD times significantly

**Configuration** (`turbo.json`):

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": [".env", "tsconfig.json"],
  "globalEnv": ["NODE_ENV", "CLOUDFLARE_ACCOUNT_ID"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".wrangler/deploy/**", "!.wrangler/state/**"],
      "env": ["CLOUDFLARE_ACCOUNT_ID", "NODE_ENV"],
      "inputs": ["src/**", "wrangler.toml", "package.json"]
    },
    "dev": {
      "cache": false,
      "persistent": true,
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"],
      "inputs": ["src/**/*.ts", "test/**/*.ts", "vitest.config.ts"]
    },
    "lint": {
      "outputs": [],
      "inputs": ["src/**", ".eslintrc.js"]
    },
    "deploy": {
      "dependsOn": ["build", "test", "lint"],
      "cache": false
    }
  }
}
```

**Alternatives Considered**:
- **Nx**: More features but heavier, overkill for Cloudflare Workers
- **Lerna**: Lacks build orchestration and caching
- **Rush**: Microsoft-specific, less Cloudflare community adoption

---

## 2. Drizzle ORM Multi-Database Configuration

### Decision: Shared Database Package with Dual Config Support

**Chosen Approach**: Single `packages/db/` package with separate PostgreSQL and D1 configurations, allowing apps to choose their database type.

**Rationale**:
- Drizzle supports both PostgreSQL and SQLite (D1) with similar APIs
- Shared schema definitions reduce duplication
- Apps can independently choose database backend
- Type safety maintained across both database types

**Directory Structure**:

```
packages/db/
├── src/
│   ├── schema/
│   │   ├── shared.ts      # Shared schemas
│   │   ├── postgres.ts    # PostgreSQL-specific
│   │   ├── sqlite.ts      # D1/SQLite-specific
│   │   └── index.ts       # Exports
│   ├── client/
│   │   ├── postgres.ts    # PostgreSQL client
│   │   ├── d1.ts          # D1 client
│   │   └── index.ts       # Factory
│   └── index.ts
├── drizzle/
│   ├── postgres/          # PostgreSQL migrations
│   └── d1/                # D1 migrations
├── drizzle.config.postgres.ts
├── drizzle.config.d1.ts
└── package.json
```

**PostgreSQL Configuration** (`drizzle.config.postgres.ts`):

```typescript
import type { Config } from "drizzle-kit";

export default {
  schema: "./src/schema/index.ts",
  out: "./drizzle/postgres",
  dialect: "postgresql",
  dbCredentials: { 
    url: process.env.POSTGRES_URL!.replace(":6543", ":5432") // Non-pooling for migrations
  },
  casing: "snake_case",
} satisfies Config;
```

**D1 Configuration** (`drizzle.config.d1.ts`):

```typescript
import type { Config } from "drizzle-kit";

export default {
  schema: "./src/schema/index.ts",
  out: "./drizzle/d1",
  dialect: "sqlite",
  driver: "d1-http",
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    databaseId: process.env.CLOUDFLARE_D1_DATABASE_ID!,
    token: process.env.CLOUDFLARE_API_TOKEN!,
  },
  casing: "snake_case",
} satisfies Config;
```

**Client Factory Pattern**:

```typescript
// packages/db/src/client/index.ts
export function createPostgresClient() {
  return drizzle(sql, { schema, casing: "snake_case" });
}

export function createD1Client(d1: D1Database) {
  return drizzle(d1, { schema, casing: "snake_case" });
}
```

**Alternatives Considered**:
- **Separate packages per database**: More complex, duplicates logic
- **Prisma**: Less Cloudflare D1 support, heavier runtime
- **Kysely**: Good alternative but less TypeScript inference

---

## 3. Turbo Generators for App Scaffolding

### Decision: Plop-Based Generators with Conditional Templates

**Chosen Approach**: Use Turborepo's built-in generator system (Plop.js wrapper) with Handlebars templates and conditional file generation.

**Rationale**:
- Built into Turborepo, no additional dependencies
- Handlebars provides flexible templating
- Supports conditional file generation based on user input
- Integrates seamlessly with PNPM workspaces

**Generator Configuration** (`turbo/generators/config.ts`):

```typescript
import type { PlopTypes } from "@turbo/gen";

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  plop.setGenerator("cloudflare-worker", {
    description: "Create a new Cloudflare Worker application",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Worker name:",
        validate: (input: string) => /^[a-z0-9-]+$/.test(input),
      },
      {
        type: "list",
        name: "workerType",
        message: "Worker type:",
        choices: ["http", "scheduled", "queue-consumer"],
      },
      {
        type: "confirm",
        name: "includeDb",
        message: "Include D1 database?",
        default: false,
      },
    ],
    actions: (data) => {
      const actions: PlopTypes.ActionType[] = [
        {
          type: "add",
          path: "apps/{{dashCase name}}/package.json",
          templateFile: "templates/package.json.hbs",
        },
        {
          type: "add",
          path: "apps/{{dashCase name}}/wrangler.toml",
          templateFile: "templates/wrangler.toml.hbs",
        },
        {
          type: "add",
          path: "apps/{{dashCase name}}/src/index.ts",
          templateFile: "templates/src/index.ts.hbs",
        },
      ];
      
      if (data?.includeDb) {
        actions.push({
          type: "add",
          path: "apps/{{dashCase name}}/schema.sql",
          templateFile: "templates/schema.sql.hbs",
        });
      }
      
      return actions;
    },
  });
}
```

**Template Example** (`turbo/generators/templates/wrangler.toml.hbs`):

```handlebars
name = "{{dashCase name}}"
main = "src/index.ts"
compatibility_date = "2024-01-01"

{{#if includeDb}}
[[d1_databases]]
binding = "DB"
database_name = "{{dashCase name}}-db"
database_id = "preview-database-id"
{{/if}}
```

**Alternatives Considered**:
- **Yeoman**: Older, less TypeScript support
- **Hygen**: Good but requires separate installation
- **Custom scripts**: More control but reinvents wheel

---

## 4. ESLint and Prettier Shared Configurations

### Decision: Shared Config Packages with 2-Space Indentation

**Chosen Approach**: Create `packages/eslint-config/` and `packages/prettier-config/` with TypeScript and Cloudflare Workers-specific rules.

**Rationale**:
- Centralized configuration ensures consistency
- Easy to update rules across all apps
- TypeScript-first approach catches errors early
- Cloudflare Workers-specific rules prevent runtime errors

**Prettier Configuration** (`packages/prettier-config/index.js`):

```javascript
export default {
  tabWidth: 2,
  useTabs: false,
  trailingComma: "all",
  semi: true,
  singleQuote: false,
  printWidth: 80,
  endOfLine: "lf",
  bracketSpacing: true,
  arrowParens: "always",
};
```

**ESLint Configuration** (`packages/eslint-config/workers.js`):

```javascript
import tseslint from "typescript-eslint";

export default [
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      globals: {
        // Cloudflare Workers runtime
        Request: "readonly",
        Response: "readonly",
        fetch: "readonly",
        crypto: "readonly",
        caches: "readonly",
      },
    },
    rules: {
      "@typescript-eslint/indent": ["error", 2],
      "@typescript-eslint/comma-dangle": ["error", "always-multiline"],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-floating-promises": "error",
      "no-restricted-globals": ["error", {
        name: "window",
        message: "window is not available in Cloudflare Workers",
      }],
    },
  },
];
```

**Consumption in Apps**:

```javascript
// apps/my-worker/eslint.config.mjs
import workersConfig from "@repo/eslint-config/workers";

export default [
  ...workersConfig,
  // App-specific overrides
];
```

**Alternatives Considered**:
- **Biome**: Faster but less ecosystem support
- **Standard**: Too opinionated, lacks TypeScript depth
- **Per-app configs**: Duplication, inconsistency

---

## 5. Testing Strategy

### Decision: Vitest + Miniflare for Local Testing

**Chosen Approach**: Use Vitest for unit/integration tests and Miniflare for Cloudflare Workers-specific testing.

**Rationale**:
- Vitest is fast, TypeScript-native, and Vite-compatible
- Miniflare simulates Cloudflare Workers runtime locally
- Constitution requires test-first workflow
- Supports both unit and integration testing

**Configuration** (`vitest.config.ts`):

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "miniflare",
    environmentOptions: {
      bindings: {
        DB: {} as D1Database,
      },
    },
  },
});
```

**Alternatives Considered**:
- **Jest**: Slower, requires more configuration
- **Node test runner**: Too basic for Workers
- **Playwright**: Overkill for Workers testing

---

## 6. Nuxt.js Integration (Optional)

### Decision: Separate Nuxt App with Cloudflare Pages Support

**Chosen Approach**: Nuxt.js app in `apps/web/` with Cloudflare Pages adapter for edge rendering.

**Rationale**:
- Nuxt.js provides excellent DX for web frontends
- Cloudflare Pages supports Nuxt with SSR on edge
- Can share types with workers via `packages/shared-types/`
- Optional - not all projects need web frontend

**Configuration** (`apps/web/nuxt.config.ts`):

```typescript
export default defineNuxtConfig({
  modules: ["@nuxthub/core"],
  nitro: {
    preset: "cloudflare-pages",
  },
  typescript: {
    strict: true,
    typeCheck: true,
  },
});
```

**Alternatives Considered**:
- **Next.js**: Good but Vercel-centric
- **Remix**: Cloudflare support improving but less mature
- **SvelteKit**: Smaller community for Cloudflare

---

## 7. Package Manager: PNPM

### Decision: PNPM with Workspaces

**Chosen Approach**: PNPM 8.14+ with workspace protocol for internal dependencies.

**Rationale**:
- Faster installs than npm/yarn
- Efficient disk usage (content-addressable store)
- Excellent monorepo support
- `workspace:*` protocol for internal dependencies

**Configuration** (`pnpm-workspace.yaml`):

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

**Internal Dependencies**:

```json
{
  "dependencies": {
    "@repo/shared-types": "workspace:*",
    "@repo/db": "workspace:*"
  }
}
```

**Alternatives Considered**:
- **npm workspaces**: Slower, less features
- **Yarn**: Similar but less efficient disk usage
- **Bun**: Too new, less stable

---

## 8. TypeScript Configuration Strategy

### Decision: Shared Base Config with Project-Specific Extends

**Chosen Approach**: `packages/tsconfig/` with `base.json`, `worker.json`, and `nuxt.json` configurations.

**Rationale**:
- Single source of truth for TypeScript settings
- Project-specific overrides for different environments
- Strict mode enforced per constitution
- Cloudflare Workers-specific types included

**Base Configuration** (`packages/tsconfig/base.json`):

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "moduleResolution": "bundler",
    "module": "ESNext",
    "target": "ES2022",
    "lib": ["ES2022"]
  }
}
```

**Worker Configuration** (`packages/tsconfig/worker.json`):

```json
{
  "extends": "./base.json",
  "compilerOptions": {
    "types": ["@cloudflare/workers-types"],
    "lib": ["ES2022", "WebWorker"]
  }
}
```

**Alternatives Considered**:
- **Per-app configs**: Duplication
- **Single root config**: No flexibility
- **TSConfig paths**: Complex, prefer exports

---

## 9. Deployment Strategy

### Decision: Wrangler CLI + Turborepo Filtering

**Chosen Approach**: Use Wrangler CLI for deployment with Turborepo filters for selective deployment.

**Rationale**:
- Wrangler is official Cloudflare tool
- Turborepo filters enable deploying only changed apps
- CI/CD friendly with `--filter=[origin/main]`
- Supports environments (dev, staging, prod)

**Commands**:

```bash
# Deploy all workers
turbo run deploy

# Deploy only changed workers
turbo run deploy --filter=[origin/main]

# Deploy specific worker
turbo run deploy --filter=@repo/api-worker...
```

**Alternatives Considered**:
- **Manual deployments**: Error-prone
- **Custom scripts**: Reinvents wheel
- **GitHub Actions only**: Less flexible

---

## 10. Documentation Strategy

### Decision: Multi-Level Documentation

**Chosen Approach**:
- Root `README.md`: Template overview and quick start
- `quickstart.md`: Step-by-step setup guide
- Per-package READMEs: Package-specific docs
- JSDoc/TSDoc comments: Inline code documentation

**Rationale**:
- Different audiences (template users vs. contributors)
- Progressive disclosure of information
- Constitution requires comprehensive documentation
- Enables self-service learning

**Alternatives Considered**:
- **Single README**: Too long
- **Wiki**: Separate from code
- **No docs**: Poor UX

---

## Summary of Key Decisions

| Area | Decision | Rationale |
|------|----------|-----------|
| **Build Tool** | Turborepo 1.11+ | Best caching, task orchestration |
| **Package Manager** | PNPM 8.14+ | Fast, efficient, workspace support |
| **ORM** | Drizzle ORM 0.29+ | TypeScript-first, dual DB support |
| **Testing** | Vitest + Miniflare | Fast, Workers runtime simulation |
| **Linting** | ESLint 9 (flat config) | TypeScript + Workers rules |
| **Formatting** | Prettier 3 | 2-space, trailing commas |
| **Generator** | Turbo Gen (Plop) | Built-in, Handlebars templates |
| **TypeScript** | Strict mode, 5.3+ | Constitution compliance |
| **Web Framework** | Nuxt.js (optional) | SSR on Cloudflare Pages |
| **Deployment** | Wrangler CLI | Official Cloudflare tool |

All decisions align with constitution principles: code quality, testing standards, TypeScript-first development, simplicity, and performance requirements.
