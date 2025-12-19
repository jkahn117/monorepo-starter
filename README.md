# Cloudflare Monorepo Template

A production-ready monorepo template for building Cloudflare applications with TypeScript, Turborepo, and PNPM.

## Features

✨ **Monorepo Setup**
- 🏗️ [Turborepo](https://turbo.build/repo) for build orchestration and caching
- 📦 [PNPM](https://pnpm.io/) for fast, efficient package management
- 🔧 Workspace protocol for internal dependencies

✨ **Code Quality**
- 📝 TypeScript with strict mode (no implicit any)
- 🎨 Prettier with 2-space indentation and trailing commas
- 🔍 ESLint with TypeScript and Cloudflare Workers rules
- 📐 EditorConfig for consistent code formatting

✨ **Shared Packages**
- 📘 `@repo/shared-types` - Reusable TypeScript types
- 🗄️ `@repo/db` - Database package with Drizzle ORM (PostgreSQL + D1)
- ⚙️ `@repo/wrangler-config` - Type-safe Cloudflare Worker configuration builder
- 🎨 `@repo/prettier-config` - Shared Prettier configuration
- 🔍 `@repo/eslint-config` - Shared ESLint rules
- 📋 `@repo/tsconfig` - Shared TypeScript configurations

✨ **Testing**
- ✅ Vitest for fast unit and integration testing
- 🧪 Miniflare for local Cloudflare Workers testing
- 📊 Coverage reporting built-in

✨ **Developer Experience**
- 🔥 Hot reload during development
- ⚡ Incremental builds with Turborepo caching
- 🚀 Fast installs with PNPM
- 📖 Example worker application included
- 🤖 CI/CD workflows for GitHub Actions
- 🎯 VS Code settings and extensions
- 📋 Contribution guidelines

## Quick Start

### Prerequisites

- Node.js 20+ LTS
- PNPM 8.14+ (`npm install -g pnpm`)
- Cloudflare account (for deployment)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd cloudflare-monorepo-template

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test
```

### Development

```bash
# Start all development servers
pnpm dev

# Start specific package
pnpm --filter @repo/example-worker dev

# Run linting
pnpm lint

# Format code
pnpm format

# Type check
pnpm type-check
```

## Project Structure

```
.
├── .github/
│   └── workflows/          # CI/CD workflows (ci.yml, pr.yml)
├── .vscode/                # VS Code settings and extensions
├── apps/
│   └── example-worker/     # Example Cloudflare Worker
├── docs/                   # Documentation
│   ├── ARCHITECTURE.md     # Template architecture
│   ├── DEPLOYMENT.md       # Deployment guide
│   └── GENERATOR.md        # Generator guide
├── packages/
│   ├── db/                 # Database package (Drizzle ORM)
│   ├── shared-types/       # Shared TypeScript types
│   ├── wrangler-config/    # Cloudflare Worker configuration builder
│   ├── eslint-config/      # ESLint configuration
│   ├── prettier-config/    # Prettier configuration
│   └── tsconfig/           # TypeScript configurations
├── tests/
│   └── integration/        # Monorepo-level integration tests
├── turbo/generators/       # Code generator for workers
├── CONTRIBUTING.md         # Contribution guidelines
├── turbo.json              # Turborepo configuration
├── pnpm-workspace.yaml     # PNPM workspace definition
└── package.json            # Root package configuration
```

## Adding a New Application

Use the built-in generator to scaffold a new Cloudflare Worker:

```bash
# Generate a new worker
pnpm gen cloudflare-worker
```

The generator will prompt you for:
- Worker name
- Worker type (HTTP, Scheduled, or Both)
- Cloudflare bindings (D1, KV, R2, Durable Objects)
- Database integration option

For detailed generator documentation, see [docs/GENERATOR.md](docs/GENERATOR.md).

Alternatively, manually create in apps/ directory:

```bash
mkdir -p apps/my-new-worker
cd apps/my-new-worker
# Copy structure from apps/example-worker
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm build` | Build all packages |
| `pnpm dev` | Start development servers |
| `pnpm test` | Run all tests |
| `pnpm lint` | Lint all packages |
| `pnpm format` | Format all code |
| `pnpm type-check` | Type check all packages |
| `pnpm clean` | Clean build artifacts |
| `pnpm deploy` | Deploy all workers |

## Configuration

### Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required variables:
- `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID
- `CLOUDFLARE_API_TOKEN` - Your Cloudflare API token

### Cloudflare Setup

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Get your Account ID from Workers & Pages
3. Create an API token with Workers permissions
4. Update `wrangler.config.ts` in each worker with your account ID
5. Run `pnpm config:generate` to generate `wrangler.toml` from the TypeScript config

## Deployment

```bash
# Deploy all workers
pnpm deploy

# Deploy specific worker
pnpm --filter @repo/example-worker deploy

# Deploy to production environment
pnpm --filter @repo/example-worker deploy:prod
```

## Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests for specific package
pnpm --filter @repo/example-worker test

# Run integration tests
pnpm --filter @repo/example-worker test tests/integration
```

## Shared Types Usage

Import shared types in any application:

```typescript
import type { ApiResponse, ErrorResponse } from "@repo/shared-types";

const response: ApiResponse<User> = {
  data: user,
  message: "User created successfully",
  timestamp: new Date().toISOString(),
};
```

## Code Style

This template enforces:
- ✅ 2-space indentation (spaces, not tabs)
- ✅ Trailing commas in multi-line structures
- ✅ Double quotes for strings
- ✅ Semicolons
- ✅ LF line endings

## Performance

- **Build time**: < 5 minutes for full monorepo with 10 apps
- **Install time**: < 2 minutes with PNPM
- **Worker cold start**: < 200ms
- **Test suite**: < 2 minutes

## CI/CD

This template includes GitHub Actions workflows:

- **`.github/workflows/ci.yml`** - Runs on push to main/develop
  - ✅ Linting (ESLint + Prettier)
  - ✅ Type checking (TypeScript)
  - ✅ Testing (Vitest)
  - ✅ Building (Turborepo)

- **`.github/workflows/pr.yml`** - Runs on pull requests
  - ✅ Semantic PR title validation
  - ✅ Conventional commit format checks
  - ✅ Security audit (npm audit)
  - ✅ Merge conflict detection

All workflows use caching to speed up builds and support Node.js 20+ LTS.

## VS Code Setup

This template includes optimized VS Code settings:

- **`.vscode/settings.json`** - Editor configuration
  - Format on save enabled
  - ESLint auto-fix on save
  - TypeScript integration
  - Recommended file exclusions

- **`.vscode/extensions.json`** - Recommended extensions
  - ESLint
  - Prettier
  - TypeScript
  - GitHub Copilot
  - Error Lens

Install recommended extensions when prompted by VS Code for the best experience.

## Troubleshooting

### "Package not found" errors

```bash
# Rebuild all packages
pnpm build

# Verify workspace configuration
cat pnpm-workspace.yaml
```

### Type errors with shared packages

```bash
# Rebuild shared-types package
pnpm --filter @repo/shared-types build

# Restart TypeScript server in your IDE
```

### Wrangler authentication

```bash
# Login to Cloudflare
npx wrangler login

# Or use API token
export CLOUDFLARE_API_TOKEN=your_token
```

## Documentation

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [PNPM Workspaces](https://pnpm.io/workspaces)
- [Hono Framework](https://hono.dev/)

## License

MIT © 2025

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.

## Support

For issues and questions:
1. Check existing documentation
2. Search [Issues](../../issues)
3. Create a new issue with reproduction steps

---

**Built with ❤️ for the Cloudflare community**
