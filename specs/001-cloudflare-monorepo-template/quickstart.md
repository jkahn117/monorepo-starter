# Quickstart Guide: Cloudflare Monorepo Template

**Date**: 2025-12-18  
**Feature**: 001-cloudflare-monorepo-template  
**Target Audience**: Developers setting up a new Cloudflare project

## Overview

This guide walks you through setting up a new Cloudflare monorepo from the template, creating your first worker application, and deploying it to Cloudflare's edge network.

**Time to Complete**: ~15 minutes  
**Prerequisites**: Node.js 20+, Git, Cloudflare account

---

## Step 1: Prerequisites Check

### Required Software

Verify you have the required tools installed:

```bash
# Check Node.js version (20+ required)
node --version

# Check PNPM (install if needed)
pnpm --version
# If not installed:
npm install -g pnpm

# Check Git
git --version
```

### Cloudflare Account Setup

1. Create a free Cloudflare account at https://dash.cloudflare.com/sign-up
2. Get your Account ID:
   - Log in to Cloudflare Dashboard
   - Navigate to Workers & Pages
   - Copy your Account ID from the right sidebar
3. Create API token:
   - Go to My Profile > API Tokens
   - Click "Create Token"
   - Use "Edit Cloudflare Workers" template
   - Save the token securely

---

## Step 2: Initialize Template

### Clone or Download Template

**Option A: Use as Template (Recommended)**

If the template is on GitHub:

```bash
# Use template repository
gh repo create my-cloudflare-project --template cloudflare-monorepo-template

# Clone your new repository
git clone https://github.com/your-username/my-cloudflare-project
cd my-cloudflare-project
```

**Option B: Clone Directly**

```bash
git clone https://github.com/your-org/cloudflare-monorepo-template my-cloudflare-project
cd my-cloudflare-project

# Remove git history and start fresh
rm -rf .git
git init
git add .
git commit -m "feat: initialize from template"
```

### Install Dependencies

```bash
# Install all dependencies (monorepo + all packages)
pnpm install

# This should complete in under 2 minutes
```

**Expected Output**:
```
Packages: +250
Progress: resolved 250, reused 250, downloaded 0, added 250, done
Done in 45s
```

---

## Step 3: Configure Environment

### Create Environment File

```bash
# Create .env file in root
cp .env.example .env
```

### Edit .env File

```bash
# .env
NODE_ENV=development

# Cloudflare credentials
CLOUDFLARE_ACCOUNT_ID=your_account_id_here
CLOUDFLARE_API_TOKEN=your_api_token_here

# Database (optional, for D1)
CLOUDFLARE_D1_DATABASE_ID=
```

**Security Note**: Never commit `.env` file to Git (already in `.gitignore`)

---

## Step 4: Verify Setup

### Run Initial Build

```bash
# Build all packages
pnpm build
```

**Expected Output**:
```
• Packages in scope: @repo/eslint-config, @repo/prettier-config, @repo/tsconfig, @repo/shared-types, @repo/db, @repo/example-worker
• Running build in 6 packages
• Remote caching disabled

@repo/eslint-config:build: cache hit, replaying logs
@repo/prettier-config:build: cache hit, replaying logs
@repo/tsconfig:build: cache hit, replaying logs
@repo/shared-types:build: cache hit, replaying logs
@repo/db:build: cache hit, replaying logs
@repo/example-worker:build: cache hit, replaying logs

Tasks: 6 successful, 6 total
Cached: 6 cached, 6 total
Time: 1.2s
```

### Run Tests

```bash
# Run all tests
pnpm test
```

**Expected Output**:
```
Test Files  5 passed (5)
Tests  12 passed (12)
Start at  16:00:00
Duration  850ms
```

### Verify Linting

```bash
# Run linting
pnpm lint
```

**Expected Output**:
```
✓ All files passed linting
```

---

## Step 5: Create Your First Worker

### Run Generator

```bash
# Launch interactive generator
pnpm turbo gen cloudflare-worker
```

### Answer Prompts

```
? Worker name (lowercase with hyphens): my-api
? Worker type: http
? Include D1 database support? No
? Include KV namespace support? No
? Include R2 bucket support? No
? Import shared types package? Yes
```

**Generated Output**:
```
✓ Created directory: apps/my-api
✓ Generated package.json
✓ Generated wrangler.toml
✓ Generated TypeScript configuration
✓ Generated source files
✓ Generated test files

✅ Worker created successfully!

Next steps:
  1. cd apps/my-api
  2. pnpm install
  3. pnpm dev
```

---

## Step 6: Develop Your Worker

### Start Development Server

```bash
# Navigate to your worker
cd apps/my-api

# Start dev server with hot reload
pnpm dev
```

**Expected Output**:
```
⛅️ wrangler 3.22.0
-------------------
⎔ Starting local server...
[wrangler:inf] Ready on http://localhost:8787
```

### Test Your Worker

Open a new terminal and test the worker:

```bash
# Test the default route
curl http://localhost:8787

# Expected response:
# {"message":"Hello from my-api!"}
```

### Make Changes

Edit `apps/my-api/src/index.ts`:

```typescript
import { Hono } from 'hono';
import type { ApiResponse } from '@repo/shared-types';

const app = new Hono();

app.get('/', (c) => {
  const response: ApiResponse = {
    message: 'Hello from my updated API!',
    timestamp: new Date().toISOString(),
  };
  return c.json(response);
});

export default app;
```

Save the file - the dev server automatically reloads!

---

## Step 7: Add Shared Types

### Define Shared Type

Edit `packages/shared-types/src/api.ts`:

```typescript
export interface ApiResponse {
  message: string;
  timestamp: string;
  data?: unknown;
}

export interface ErrorResponse {
  error: string;
  code: string;
}
```

### Use in Worker

Your worker automatically picks up the shared types (as seen in Step 6).

### Rebuild Shared Types

```bash
# From monorepo root
pnpm --filter @repo/shared-types build

# Or rebuild everything
pnpm build
```

---

## Step 8: Deploy to Cloudflare

### Configure Wrangler

Edit `apps/my-api/wrangler.toml`:

```toml
name = "my-api"
main = "src/index.ts"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

# Update with your account ID
account_id = "your_account_id_here"

[env.production]
name = "my-api-prod"
```

### Deploy to Development

```bash
# From apps/my-api directory
pnpm deploy
```

**Expected Output**:
```
⛅️ wrangler 3.22.0
-------------------
Uploaded my-api (1.23 sec)
Published my-api (0.45 sec)
  https://my-api.your-subdomain.workers.dev
```

### Test Deployed Worker

```bash
curl https://my-api.your-subdomain.workers.dev
```

### Deploy to Production

```bash
# Deploy to production environment
pnpm deploy:prod
```

---

## Step 9: Add Database Support

### Create D1 Database

```bash
# From monorepo root
npx wrangler d1 create my-api-db

# Copy the database ID from output
```

### Update Wrangler Config

Edit `apps/my-api/wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "my-api-db"
database_id = "paste_database_id_here"
```

### Add Database Package

Edit `apps/my-api/package.json`:

```json
{
  "dependencies": {
    "@repo/db": "workspace:*",
    "hono": "^4.0.0"
  }
}
```

```bash
# Install new dependency
pnpm install
```

### Define Schema

Create `packages/db/src/schema/my-api.ts`:

```typescript
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date()),
});
```

### Generate Migrations

```bash
# From monorepo root
pnpm --filter @repo/db db:generate:d1

# Apply migrations
npx wrangler d1 migrations apply my-api-db --local
```

### Use in Worker

Update `apps/my-api/src/index.ts`:

```typescript
import { Hono } from 'hono';
import { createD1Client } from '@repo/db/client';
import { users } from '@repo/db/schema';

interface Env {
  DB: D1Database;
}

const app = new Hono<{ Bindings: Env }>();

app.get('/users', async (c) => {
  const db = createD1Client(c.env.DB);
  const allUsers = await db.select().from(users);
  return c.json(allUsers);
});

export default app;
```

---

## Step 10: Common Tasks

### Add Another Worker

```bash
# From monorepo root
pnpm turbo gen cloudflare-worker
```

### Run All Tests

```bash
pnpm test
```

### Build All Packages

```bash
pnpm build
```

### Lint All Code

```bash
pnpm lint
```

### Format All Code

```bash
pnpm format
```

### Deploy All Workers

```bash
# Build and test first
pnpm build
pnpm test

# Deploy all
pnpm --filter "@repo/*-worker" deploy
```

### Update Dependencies

```bash
# Update all dependencies
pnpm update -r

# Update specific package
pnpm --filter @repo/my-api update hono
```

---

## Troubleshooting

### Issue: "Package not found"

**Symptom**: Import errors for `@repo/*` packages

**Solution**:
```bash
# Rebuild all packages
pnpm build

# Verify workspace configuration
cat pnpm-workspace.yaml
```

### Issue: "Wrangler authentication failed"

**Symptom**: Deploy fails with auth error

**Solution**:
```bash
# Re-authenticate
npx wrangler login

# Or use API token
export CLOUDFLARE_API_TOKEN=your_token
```

### Issue: "Type errors in shared types"

**Symptom**: TypeScript can't find shared types

**Solution**:
```bash
# Rebuild shared-types package
pnpm --filter @repo/shared-types build

# Restart TypeScript server in your IDE
```

### Issue: "Tests failing"

**Symptom**: Vitest tests fail

**Solution**:
```bash
# Run tests in watch mode to see details
pnpm --filter @repo/my-api test:watch

# Check test file syntax
pnpm --filter @repo/my-api type-check
```

---

## Next Steps

### Learn More

- **Turborepo Docs**: https://turbo.build/repo/docs
- **Cloudflare Workers**: https://developers.cloudflare.com/workers/
- **Drizzle ORM**: https://orm.drizzle.team/docs/overview
- **Hono Framework**: https://hono.dev/
- **PNPM Workspaces**: https://pnpm.io/workspaces

### Explore Examples

Check `apps/example-worker/` for:
- HTTP routing patterns
- Database integration
- Error handling
- Testing examples

### Add Features

- Set up CI/CD with GitHub Actions
- Add more shared packages
- Configure staging environments
- Set up monitoring and logging

---

## Quick Reference

### Common Commands

```bash
# Development
pnpm dev                    # Start all dev servers
pnpm build                  # Build all packages
pnpm test                   # Run all tests
pnpm lint                   # Lint all code
pnpm format                 # Format all code

# Worker-specific (from apps/{worker}/)
pnpm dev                    # Start worker dev server
pnpm deploy                 # Deploy to development
pnpm deploy:prod            # Deploy to production
pnpm test                   # Run worker tests

# Generator
pnpm turbo gen cloudflare-worker    # Create new worker

# Database (from monorepo root)
pnpm --filter @repo/db db:generate:d1       # Generate D1 migrations
pnpm --filter @repo/db db:generate:postgres # Generate PostgreSQL migrations
```

### Workspace Structure

```
monorepo-root/
├── apps/               # Your worker applications
│   ├── my-api/        # Example HTTP API
│   └── my-worker/     # Example worker
├── packages/          # Shared packages
│   ├── shared-types/  # TypeScript types
│   ├── db/            # Database package
│   ├── eslint-config/ # ESLint config
│   ├── prettier-config/ # Prettier config
│   └── tsconfig/      # TypeScript configs
└── turbo/
    └── generators/    # App generators
```

---

## Success Checklist

- [ ] Node.js 20+ installed
- [ ] PNPM installed
- [ ] Template cloned/initialized
- [ ] Dependencies installed successfully
- [ ] Initial build completed without errors
- [ ] All tests passing
- [ ] Cloudflare account set up
- [ ] Environment variables configured
- [ ] First worker generated
- [ ] Worker running locally
- [ ] Worker deployed to Cloudflare
- [ ] Shared types working across apps

**Time Taken**: ______ minutes (target: under 15 minutes)

---

## Support

If you encounter issues not covered in this guide:

1. Check the troubleshooting section above
2. Review example workers in `apps/`
3. Consult Cloudflare Workers documentation
4. Open an issue in the template repository

Happy building! 🚀
