# @repo/wrangler-config

Shared Cloudflare Workers configuration management for monorepos.

## Overview

This package provides a TypeScript-based configuration system for Cloudflare Workers that enables:

- **Centralized Configuration**: Define Cloudflare bindings and settings once, reuse across workers
- **Type Safety**: Full TypeScript support with IDE autocomplete
- **Environment Management**: Separate configurations for dev/staging/production
- **Validation**: Catch configuration errors before deployment
- **RPC Type Safety**: Auto-generate TypeScript types for inter-worker RPC calls

## Installation

```bash
pnpm add @repo/wrangler-config
```

## Quick Start

See [quickstart guide](../../specs/002-shared-wrangler-config/quickstart.md) for complete setup instructions.

## Documentation

- **API Reference**: [contracts/config-api.md](../../specs/002-shared-wrangler-config/contracts/config-api.md)
- **Data Model**: [data-model.md](../../specs/002-shared-wrangler-config/data-model.md)
- **Technical Decisions**: [research.md](../../specs/002-shared-wrangler-config/research.md)

## Status

🚧 **In Development** - Feature branch: `002-shared-wrangler-config`
