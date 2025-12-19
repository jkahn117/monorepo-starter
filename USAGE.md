# Monorepo Usage Guide

> A comprehensive guide to building full-stack applications with this Cloudflare-focused monorepo template

## Table of Contents

- [Getting Started](#getting-started)
- [Creating Your Project](#creating-your-project)
- [Adding Cloudflare Workers](#adding-cloudflare-workers)
- [Using Wrangler Configuration](#using-wrangler-configuration)
- [Adding Frontend Applications](#adding-frontend-applications)
- [Development Workflow](#development-workflow)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## Getting Started

### Prerequisites

Before you begin, ensure you have:

- **Node.js** 20+ LTS ([Download](https://nodejs.org/))
- **pnpm** 8.14+ ([Install](https://pnpm.io/installation))
- **Cloudflare Account** ([Sign up](https://dash.cloudflare.com/sign-up))
- **Git** for version control

### Verify Installation

```bash
node --version    # Should be v20.x.x or higher
pnpm --version    # Should be 8.14.x or higher
```

---

## Creating Your Project

### Step 1: Clone the Template

```bash
# Clone this template repository
git clone https://github.com/your-org/monorepo-starter.git my-awesome-project
cd my-awesome-project

# Remove the template's git history and start fresh
rm -rf .git
git init
git add .
git commit -m "Initial commit from monorepo template"
```

### Step 2: Customize Your Project

Update the project name and details:

```bash
# Update package.json
nano package.json  # Change "name" field to "my-awesome-project"

# Update README.md
nano README.md  # Add your project description
```

### Step 3: Install Dependencies

```bash
# Install all workspace dependencies
pnpm install

# Verify installation
pnpm --version
pnpm list --depth=0
```

### Step 4: Set Up Environment Variables

```bash
# Copy example environment file
cp .env.example .env

# Edit with your Cloudflare credentials
nano .env
```

Add your Cloudflare Account ID:

```bash
# .env
CLOUDFLARE_ACCOUNT_ID=your-account-id-here
NODE_ENV=development
```

> 💡 **Finding your Account ID**: Log into [Cloudflare Dashboard](https://dash.cloudflare.com/) → Workers & Pages → Overview → Copy Account ID from the right sidebar

### Step 5: Verify Everything Works

```bash
# Run tests across all packages
pnpm test

# Check for linting issues
pnpm lint

# Type-check all TypeScript
pnpm type-check
```

**Expected Output:**
```
✓ All tests passing
✓ No linting errors
✓ No type errors
```

---

## Adding Cloudflare Workers

### Using the Built-in Generator

This template includes a Turborepo generator for creating new Cloudflare Workers.

### Step 1: Generate a New Worker

```bash
# Interactive generator
pnpm gen cloudflare-worker

# Or specify the name directly
pnpm gen cloudflare-worker --name my-api-worker
```

**You'll be prompted for:**
- Worker name (e.g., `my-api-worker`)
- Description (e.g., "REST API for user management")

### Step 2: Review Generated Files

The generator creates a complete worker structure:

```
apps/my-api-worker/
├── src/
│   └── index.ts              # Worker entry point with Hono
├── test/
│   └── index.test.ts         # Example tests
├── scripts/
│   └── generate-config.ts    # Config generation script
├── wrangler.config.ts        # TypeScript configuration
├── wrangler.toml             # Generated from wrangler.config.ts
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript config
├── vitest.config.ts          # Test configuration
└── README.md                 # Worker documentation
```

### Step 3: Customize Your Worker

#### Update the Route Handler

Edit `apps/my-api-worker/src/index.ts`:

```typescript
import { Hono } from 'hono';
import type { Env } from './types';

const app = new Hono<{ Bindings: Env }>();

// Add your routes
app.get('/', (c) => {
  return c.json({ 
    message: 'Welcome to my API',
    version: '1.0.0'
  });
});

app.get('/users', async (c) => {
  // Access D1 database
  const db = c.env.DB;
  const users = await db.prepare('SELECT * FROM users').all();
  return c.json(users);
});

app.post('/users', async (c) => {
  const body = await c.req.json();
  const db = c.env.DB;
  
  await db.prepare('INSERT INTO users (name, email) VALUES (?, ?)')
    .bind(body.name, body.email)
    .run();
    
  return c.json({ success: true });
});

export default app;
```

#### Add Database Schema

Create `apps/my-api-worker/schema.sql`:

```sql
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO users (name, email) VALUES 
  ('Alice', 'alice@example.com'),
  ('Bob', 'bob@example.com');
```

### Step 4: Configure Bindings

Edit `apps/my-api-worker/wrangler.config.ts`:

```typescript
import { defineConfig, defineEnvironment, d1Binding, kvBinding } from '@repo/wrangler-config';

export default defineConfig({
  name: 'my-api-worker',
  main: 'src/index.ts',
  compatibility_date: '2024-01-01',
  compatibility_flags: ['nodejs_compat'],
  
  bindings: [
    d1Binding('DB', 'my-database', 'dev-db-id'),
    kvBinding('CACHE', 'dev-cache-id'),
  ],
  
  env: {
    production: defineEnvironment('production', {
      name: 'my-api-worker-prod',
      bindings: [
        d1Binding('DB', 'my-database', 'prod-db-id'),
        kvBinding('CACHE', 'prod-cache-id'),
      ],
    }),
  },
});
```

### Step 5: Generate Configuration

```bash
# Generate wrangler.toml from TypeScript config
pnpm --filter my-api-worker config:generate
```

### Step 6: Test Your Worker

```bash
# Run tests
pnpm --filter my-api-worker test

# Start dev server
pnpm --filter my-api-worker dev
```

Visit: `http://localhost:8787`

---

## Using Wrangler Configuration

The template includes `@repo/wrangler-config` for type-safe, centralized worker configuration.

### Basic Configuration

#### Simple Worker (No Bindings)

```typescript
// apps/hello-worker/wrangler.config.ts
import { defineConfig } from '@repo/wrangler-config';

export default defineConfig({
  name: 'hello-worker',
  main: 'src/index.ts',
  compatibility_date: '2024-01-01',
});
```

#### Worker with Bindings

```typescript
import { defineConfig, d1Binding, kvBinding, r2Binding } from '@repo/wrangler-config';

export default defineConfig({
  name: 'full-stack-worker',
  main: 'src/index.ts',
  compatibility_date: '2024-01-01',
  
  bindings: [
    // D1 Database
    d1Binding('DB', 'my-database', 'db-id-here'),
    
    // KV Cache
    kvBinding('CACHE', 'kv-namespace-id'),
    
    // R2 Storage
    r2Binding('STORAGE', 'my-bucket'),
  ],
});
```

### Environment-Specific Configuration

```typescript
import { defineConfig, defineEnvironment, d1Binding } from '@repo/wrangler-config';

export default defineConfig({
  name: 'my-worker',
  main: 'src/index.ts',
  compatibility_date: '2024-01-01',
  
  // Development defaults
  bindings: [d1Binding('DB', 'my-db', 'local-db')],
  vars: {
    LOG_LEVEL: 'debug',
    API_URL: 'http://localhost:3000',
  },
  
  // Environment overrides
  env: {
    staging: defineEnvironment('staging', {
      name: 'my-worker-staging',
      bindings: [d1Binding('DB', 'my-db', 'staging-db-id')],
      vars: {
        LOG_LEVEL: 'info',
        API_URL: 'https://staging-api.example.com',
      },
    }),
    
    production: defineEnvironment('production', {
      name: 'my-worker-prod',
      bindings: [d1Binding('DB', 'my-db', 'prod-db-id')],
      vars: {
        LOG_LEVEL: 'warn',
        API_URL: 'https://api.example.com',
      },
    }),
  },
});
```

### Using Presets

```typescript
import { defineConfig } from '@repo/wrangler-config';
import { commonBindings, environments } from '@repo/wrangler-config/presets';

export default defineConfig({
  name: 'my-worker',
  main: 'src/index.ts',
  compatibility_date: '2024-01-01',
  
  // Use preset bindings
  bindings: [
    commonBindings.cacheKV('CACHE', 'my-kv-id'),
    commonBindings.storageBucket('STORAGE', 'my-bucket'),
    commonBindings.productionD1('DB', 'my-db', 'db-id'),
  ],
  
  // Use preset environments
  env: environments,
});
```

### Shared Base Configuration

Create reusable configurations:

```typescript
// shared/worker-base.ts
import { d1Binding } from '@repo/wrangler-config';

export const sharedConfig = {
  compatibility_date: '2024-01-01',
  compatibility_flags: ['nodejs_compat'],
  bindings: [
    d1Binding('DB', 'shared-database', 'shared-db-id'),
  ],
};

// apps/worker-a/wrangler.config.ts
import { defineConfig } from '@repo/wrangler-config';
import { sharedConfig } from '../../shared/worker-base';

export default defineConfig({
  name: 'worker-a',
  main: 'src/index.ts',
  ...sharedConfig,
});
```

### Generating Configuration Files

```bash
# Generate for a specific worker
pnpm --filter my-worker config:generate

# Generate for all workers
pnpm --recursive config:generate

# Or use turbo for parallel generation
pnpm turbo config:generate
```

---

## Adding Frontend Applications

### Option 1: Nuxt Application

#### Step 1: Create Nuxt App

```bash
# Navigate to apps directory
cd apps

# Create new Nuxt app
pnpm dlx nuxi@latest init my-frontend

# Move into the app
cd my-frontend
```

#### Step 2: Configure for Monorepo

Update `apps/my-frontend/package.json`:

```json
{
  "name": "@repo/my-frontend",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "nuxt dev",
    "build": "nuxt build",
    "preview": "nuxt preview",
    "lint": "eslint .",
    "type-check": "nuxt typecheck"
  },
  "dependencies": {
    "@repo/shared-types": "workspace:*",
    "nuxt": "^3.10.0",
    "vue": "^3.4.0"
  },
  "devDependencies": {
    "@nuxt/eslint": "^0.3.0",
    "@repo/eslint-config": "workspace:*",
    "@repo/tsconfig": "workspace:*"
  }
}
```

#### Step 3: Configure TypeScript

Create `apps/my-frontend/tsconfig.json`:

```json
{
  "extends": "@repo/tsconfig/nuxt.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "~/*": ["./*"],
      "@/*": ["./*"]
    }
  }
}
```

#### Step 4: Add to Workspace

Update root `pnpm-workspace.yaml` (if not already included):

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

#### Step 5: Configure API Integration

Create `apps/my-frontend/composables/useApi.ts`:

```typescript
export const useApi = () => {
  const config = useRuntimeConfig();
  const baseURL = config.public.apiBaseUrl;

  const fetchUsers = async () => {
    return await $fetch('/users', {
      baseURL,
    });
  };

  const createUser = async (data: { name: string; email: string }) => {
    return await $fetch('/users', {
      method: 'POST',
      baseURL,
      body: data,
    });
  };

  return {
    fetchUsers,
    createUser,
  };
};
```

#### Step 6: Configure Environment

Create `apps/my-frontend/nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8787',
    },
  },
  
  devtools: { enabled: true },
  
  modules: ['@nuxt/eslint'],
});
```

#### Step 7: Create Sample Page

Create `apps/my-frontend/pages/index.vue`:

```vue
<template>
  <div class="container">
    <h1>Users</h1>
    
    <div v-if="pending">Loading...</div>
    <div v-else-if="error">Error: {{ error.message }}</div>
    
    <ul v-else>
      <li v-for="user in users" :key="user.id">
        {{ user.name }} ({{ user.email }})
      </li>
    </ul>
    
    <form @submit.prevent="handleSubmit">
      <input v-model="newUser.name" placeholder="Name" required />
      <input v-model="newUser.email" placeholder="Email" type="email" required />
      <button type="submit">Add User</button>
    </form>
  </div>
</template>

<script setup lang="ts">
const api = useApi();

const { data: users, pending, error, refresh } = await useAsyncData(
  'users',
  () => api.fetchUsers()
);

const newUser = ref({ name: '', email: '' });

const handleSubmit = async () => {
  await api.createUser(newUser.value);
  newUser.value = { name: '', email: '' };
  await refresh();
};
</script>
```

### Option 2: Other Frameworks

The template supports any frontend framework:

```bash
# React (Vite)
cd apps
pnpm create vite my-react-app --template react-ts

# SvelteKit
cd apps
pnpm create svelte@latest my-svelte-app

# Solid.js
cd apps
pnpm create solid my-solid-app
```

Then follow similar steps to integrate with the monorepo.

---

## Development Workflow

### Running Development Servers

#### Start All Services

```bash
# Start all workers and apps in parallel
pnpm dev

# Or use turbo directly
pnpm turbo dev
```

#### Start Specific Services

```bash
# Single worker
pnpm --filter my-api-worker dev

# Single frontend
pnpm --filter my-frontend dev

# Multiple specific services
pnpm --filter my-api-worker --filter my-frontend dev
```

#### Common Development Ports

- **Workers**: Usually `localhost:8787`, `localhost:8788`, etc.
- **Nuxt**: Usually `localhost:3000`
- **Vite**: Usually `localhost:5173`

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Test specific package
pnpm --filter my-api-worker test

# Test with coverage
pnpm turbo test:coverage
```

### Code Quality Checks

```bash
# Lint all packages
pnpm lint

# Fix linting issues
pnpm lint --fix

# Type check everything
pnpm type-check

# Format code with Prettier
pnpm format
```

### Building for Production

```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter my-api-worker build

# Build with turbo (parallel, cached)
pnpm turbo build
```

### Working with Turborepo

#### Understanding Task Dependencies

Your `turbo.json` defines task relationships:

```json
{
  "tasks": {
    "config:generate": {
      "cache": true,
      "outputs": ["wrangler.toml"]
    },
    "build": {
      "dependsOn": ["^build", "config:generate"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true,
      "dependsOn": ["config:generate"]
    }
  }
}
```

This means:
- `build` runs `config:generate` first
- `build` also waits for dependencies to build (`^build`)
- Results are cached for faster subsequent runs

#### Useful Turbo Commands

```bash
# Run with verbose output
pnpm turbo dev --verbose

# Force re-run without cache
pnpm turbo build --force

# Run only changed packages
pnpm turbo test --filter=...[origin/main]

# Visualize task dependency graph
pnpm turbo build --graph
```

---

## Deployment

### Deploying Cloudflare Workers

#### Step 1: Set Up Cloudflare Account

```bash
# Login to Cloudflare (one-time setup)
pnpm wrangler login
```

#### Step 2: Create Resources

**Create D1 Database:**

```bash
# Create development database
pnpm wrangler d1 create my-database-dev

# Create production database
pnpm wrangler d1 create my-database-prod

# Note the database IDs and update wrangler.config.ts
```

**Create KV Namespace:**

```bash
# Create KV namespace
pnpm wrangler kv:namespace create "CACHE"
pnpm wrangler kv:namespace create "CACHE" --preview

# Note the IDs
```

**Create R2 Bucket:**

```bash
# Create R2 bucket
pnpm wrangler r2 bucket create my-bucket
```

#### Step 3: Run Migrations

```bash
# Apply database schema
pnpm wrangler d1 execute my-database-dev --file=./apps/my-api-worker/schema.sql

# For production
pnpm wrangler d1 execute my-database-prod --file=./apps/my-api-worker/schema.sql
```

#### Step 4: Update Configuration

Edit `apps/my-api-worker/wrangler.config.ts` with real IDs:

```typescript
import { defineConfig, defineEnvironment, d1Binding, kvBinding } from '@repo/wrangler-config';

export default defineConfig({
  name: 'my-api-worker',
  main: 'src/index.ts',
  compatibility_date: '2024-01-01',
  compatibility_flags: ['nodejs_compat'],
  
  bindings: [
    d1Binding('DB', 'my-database-dev', 'your-dev-db-id-here'),
    kvBinding('CACHE', 'your-dev-kv-id-here'),
  ],
  
  env: {
    production: defineEnvironment('production', {
      name: 'my-api-worker-prod',
      bindings: [
        d1Binding('DB', 'my-database-prod', 'your-prod-db-id-here'),
        kvBinding('CACHE', 'your-prod-kv-id-here'),
      ],
    }),
  },
});
```

#### Step 5: Deploy

```bash
# Deploy to development (default)
pnpm --filter my-api-worker deploy

# Deploy to production
pnpm --filter my-api-worker deploy:prod

# Or deploy all workers
pnpm turbo deploy
```

#### Step 6: Verify Deployment

```bash
# Check worker status
pnpm wrangler deployments list

# View logs
pnpm wrangler tail my-api-worker

# Test the deployed worker
curl https://my-api-worker.your-subdomain.workers.dev
```

### Deploying Frontend Applications

#### Option 1: Cloudflare Pages

```bash
# Build your frontend
pnpm --filter my-frontend build

# Deploy to Pages
pnpm wrangler pages deploy apps/my-frontend/.output/public --project-name=my-frontend
```

#### Option 2: Cloudflare Pages with Git Integration

1. Push your code to GitHub/GitLab
2. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) → Pages
3. Connect your repository
4. Configure build settings:
   - **Build command**: `cd apps/my-frontend && pnpm build`
   - **Build output**: `apps/my-frontend/.output/public`
   - **Root directory**: `/`

#### Configure Environment Variables

In Cloudflare Pages dashboard:
1. Go to Settings → Environment Variables
2. Add: `NUXT_PUBLIC_API_BASE_URL` = `https://my-api-worker.your-subdomain.workers.dev`

### CI/CD with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-workers:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Build
        run: pnpm turbo build
      
      - name: Deploy Workers
        run: pnpm turbo deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

---

## Troubleshooting

### Common Issues

#### Issue: `pnpm` not found

**Solution:**
```bash
npm install -g pnpm@latest
```

#### Issue: Wrangler login fails

**Solution:**
```bash
# Try manual authentication
pnpm wrangler login --browser=false

# Or use API token
export CLOUDFLARE_API_TOKEN=your-token-here
```

#### Issue: Worker builds but won't deploy

**Solution:**
```bash
# Ensure you're in the correct directory
cd apps/my-worker

# Regenerate config
pnpm config:generate

# Check for syntax errors
pnpm wrangler deploy --dry-run

# Check account ID is correct
grep CLOUDFLARE_ACCOUNT_ID ../../.env
```

#### Issue: Database binding not working

**Solution:**
```bash
# Verify database exists
pnpm wrangler d1 list

# Check database ID matches your config
cat wrangler.toml | grep database_id

# Test local connection
pnpm wrangler d1 execute my-database-dev --command="SELECT 1"
```

#### Issue: Type errors in worker

**Solution:**
```bash
# Regenerate types
pnpm --filter my-worker type-check

# Ensure shared types are built
pnpm --filter @repo/shared-types build

# Clean and reinstall
pnpm clean
pnpm install
```

#### Issue: Turbo cache issues

**Solution:**
```bash
# Clear turbo cache
pnpm turbo clean

# Remove node_modules and reinstall
pnpm clean
pnpm install
```

#### Issue: Frontend can't connect to worker

**Solution:**

1. Check CORS configuration in your worker:

```typescript
// Add CORS middleware
import { cors } from 'hono/cors';

app.use('/*', cors({
  origin: ['http://localhost:3000', 'https://your-frontend.pages.dev'],
}));
```

2. Verify API URL in frontend:

```bash
# Check environment variable
echo $NUXT_PUBLIC_API_BASE_URL

# Or in .env file
cat .env | grep API_BASE_URL
```

### Getting Help

- **Template Issues**: [GitHub Issues](https://github.com/your-org/monorepo-starter/issues)
- **Cloudflare Workers**: [Workers Docs](https://developers.cloudflare.com/workers/)
- **Turborepo**: [Turbo Docs](https://turbo.build/repo/docs)
- **pnpm**: [pnpm Docs](https://pnpm.io/)

---

## Quick Reference

### Essential Commands

```bash
# Setup
pnpm install                          # Install dependencies
pnpm gen cloudflare-worker           # Create new worker

# Development
pnpm dev                              # Start all services
pnpm --filter my-worker dev          # Start specific worker
pnpm test                             # Run all tests
pnpm lint                             # Lint all code

# Configuration
pnpm --filter my-worker config:generate  # Generate wrangler.toml

# Build & Deploy
pnpm build                            # Build all packages
pnpm --filter my-worker deploy       # Deploy specific worker
pnpm turbo deploy                     # Deploy all workers

# Maintenance
pnpm clean                            # Clean all build artifacts
pnpm turbo clean                      # Clear turbo cache
```

### Project Structure Overview

```
monorepo-starter/
├── apps/                    # Applications (workers, frontends)
│   ├── example-worker/      # Example Cloudflare Worker
│   └── [your-apps]/         # Your applications
├── packages/                # Shared packages
│   ├── db/                  # Database utilities (Drizzle ORM)
│   ├── shared-types/        # Shared TypeScript types
│   ├── wrangler-config/     # Worker configuration management
│   ├── eslint-config/       # Shared ESLint configuration
│   ├── prettier-config/     # Shared Prettier configuration
│   └── tsconfig/            # Shared TypeScript configurations
├── turbo/                   # Turborepo generators
├── .github/                 # CI/CD workflows
├── turbo.json               # Turborepo configuration
├── pnpm-workspace.yaml      # pnpm workspace configuration
└── package.json             # Root package configuration
```

---

## Next Steps

Now that you understand the basics, you can:

1. ✅ **Create your first worker** with the generator
2. ✅ **Add a frontend** (Nuxt, React, etc.)
3. ✅ **Connect frontend to backend** via API calls
4. ✅ **Set up databases and storage** with Cloudflare resources
5. ✅ **Deploy to production** with Cloudflare Workers and Pages
6. ✅ **Set up CI/CD** with GitHub Actions

**Happy building! 🚀**
