# Data Model: Cloudflare Monorepo Template

**Date**: 2025-12-18  
**Feature**: 001-cloudflare-monorepo-template

## Overview

This document defines the conceptual data entities for the Cloudflare monorepo template. Since this is a template/scaffolding project rather than an application, the "data model" represents the structural entities and their relationships within the template itself.

---

## Core Entities

### 1. Monorepo Template

**Description**: The root template structure that users clone or initialize to create their Cloudflare project.

**Attributes**:
- `name`: Template identifier (e.g., "cloudflare-monorepo-template")
- `version`: Semantic version of the template
- `workspaces`: Array of workspace paths (`apps/*`, `packages/*`)
- `packageManager`: Package manager specification (PNPM version)
- `turborepoVersion`: Required Turborepo version

**Relationships**:
- Contains multiple **Workspace Package** entities
- Contains one **Build Configuration** entity
- Contains one **Generator Configuration** entity

**Validation Rules**:
- `name` must be valid npm package name
- `version` must follow semver format
- `workspaces` must include at least `apps/*` and `packages/*`

---

### 2. Workspace Package

**Description**: An individual package or application within the monorepo workspace.

**Attributes**:
- `name`: Package name with scope (e.g., "@repo/api-worker")
- `type`: Package type (`app`, `config-package`, `shared-package`)
- `location`: Relative path from root (e.g., "apps/api-worker")
- `private`: Boolean indicating if package is publishable
- `dependencies`: Map of dependency names to versions
- `scripts`: Map of script names to commands

**Relationships**:
- Belongs to **Monorepo Template**
- May depend on other **Workspace Package** entities
- May have **Configuration File** entities
- **Worker Application** is a specialized type

**Validation Rules**:
- `name` must be unique within workspace
- `location` must exist and match workspace patterns
- Internal dependencies must use `workspace:*` protocol
- Apps must be marked `private: true`

**States**:
- `uninitialized`: Package directory exists but dependencies not installed
- `ready`: Dependencies installed, ready for development
- `building`: Build process in progress
- `built`: Build completed successfully
- `deployed`: (For apps only) Deployed to Cloudflare

---

### 3. Worker Application

**Description**: A Cloudflare Worker application within the monorepo (specialization of Workspace Package).

**Attributes**:
- Inherits all **Workspace Package** attributes
- `workerType`: Type of worker (`http`, `scheduled`, `queue-consumer`, `durable-object`)
- `bindings`: Array of Cloudflare bindings (D1, KV, R2, Durable Objects)
- `routes`: Array of route patterns (for HTTP workers)
- `compatibilityDate`: Cloudflare compatibility date
- `compatibilityFlags`: Array of compatibility flags

**Relationships**:
- Is a **Workspace Package**
- May use **Database Package**
- May use **Shared Types Package**
- Has one **Wrangler Configuration**

**Validation Rules**:
- Must have `wrangler.toml` configuration file
- `compatibilityDate` must be valid ISO date
- Bindings must reference valid Cloudflare resources
- Routes must be valid URL patterns (for HTTP workers)

---

### 4. Shared Types Package

**Description**: Package containing reusable TypeScript type definitions and interfaces.

**Attributes**:
- Inherits **Workspace Package** attributes
- `exports`: Map of export paths to file locations
- `typeDefinitions`: Array of exported type/interface names

**Relationships**:
- Is a **Workspace Package**
- Referenced by multiple **Worker Application** entities
- May reference external type definition packages

**Validation Rules**:
- Must export at least `index.ts` with type definitions
- All exports must be TypeScript types (no runtime code)
- Must have valid `tsconfig.json` with declaration output

---

### 5. Database Package

**Description**: Package providing database schema definitions and ORM client configuration.

**Attributes**:
- Inherits **Workspace Package** attributes
- `supportedDatabases`: Array of supported database types (`postgresql`, `d1`, `sqlite`)
- `schemaFiles`: Array of schema definition file paths
- `migrationDirectories`: Map of database types to migration directories

**Relationships**:
- Is a **Workspace Package**
- Used by multiple **Worker Application** entities
- Contains multiple **Database Schema** entities
- Contains multiple **Database Configuration** entities

**Validation Rules**:
- Must have at least one database configuration
- Each database type must have corresponding migration directory
- Schema files must export Drizzle schema definitions

---

### 6. Database Schema

**Description**: A logical grouping of database tables and relationships.

**Attributes**:
- `name`: Schema identifier (e.g., "shared", "app-specific")
- `tables`: Array of table names
- `databaseType`: Target database (`postgresql`, `d1`)
- `namespace`: Optional schema namespace (PostgreSQL only)

**Relationships**:
- Belongs to **Database Package**
- May be used by multiple **Worker Application** entities

**Validation Rules**:
- Table names must be unique within schema
- PostgreSQL schemas may have namespace
- D1/SQLite schemas are global (no namespace)

---

### 7. Configuration Package

**Description**: Shared configuration package for tooling (ESLint, Prettier, TypeScript).

**Attributes**:
- Inherits **Workspace Package** attributes
- `configurationType`: Type of configuration (`eslint`, `prettier`, `tsconfig`)
- `extends`: Array of base configurations
- `rules`: Map of rule names to rule configurations

**Relationships**:
- Is a **Workspace Package**
- Used by all **Workspace Package** entities

**Validation Rules**:
- ESLint configs must export valid ESLint configuration
- Prettier configs must export valid Prettier options
- TSConfig must extend base TypeScript configuration

---

### 8. Build Configuration

**Description**: Turborepo build pipeline configuration.

**Attributes**:
- `tasks`: Map of task names to task configurations
- `globalDependencies`: Array of files that invalidate all caches
- `globalEnv`: Array of environment variables affecting all tasks

**Task Configuration Attributes**:
- `dependsOn`: Array of dependency tasks
- `outputs`: Array of output paths to cache
- `inputs`: Array of input paths that affect cache
- `cache`: Boolean indicating if task is cacheable
- `persistent`: Boolean for long-running tasks

**Relationships**:
- Belongs to **Monorepo Template**
- Defines build pipeline for all **Workspace Package** entities

**Validation Rules**:
- Task dependencies must form DAG (no cycles)
- Output paths must be within package directory
- Dev tasks must set `cache: false` and `persistent: true`

---

### 9. Generator Configuration

**Description**: Turbo generator configuration for scaffolding new applications.

**Attributes**:
- `generators`: Array of generator definitions
- `templates`: Map of template names to file paths

**Generator Definition Attributes**:
- `name`: Generator identifier (e.g., "cloudflare-worker")
- `description`: Human-readable description
- `prompts`: Array of user prompts
- `actions`: Array of file generation actions

**Relationships**:
- Belongs to **Monorepo Template**
- Generates **Worker Application** entities
- Uses **Template File** entities

**Validation Rules**:
- Generator names must be unique
- Prompt names must be unique within generator
- Template files must exist in template directory

---

### 10. Configuration File

**Description**: Individual configuration file within a package.

**Attributes**:
- `filename`: File name (e.g., "wrangler.toml", "package.json")
- `format`: File format (`json`, `toml`, `typescript`, `javascript`)
- `content`: Structured file content
- `required`: Boolean indicating if file is mandatory

**Relationships**:
- Belongs to **Workspace Package**
- May reference **Configuration Package** entities

**Validation Rules**:
- JSON files must be valid JSON
- TOML files must be valid TOML
- TypeScript/JavaScript must be syntactically valid
- Required files must exist in package

**Common Configuration Files**:
- `package.json`: Package manifest
- `tsconfig.json`: TypeScript configuration
- `wrangler.toml`: Cloudflare Workers configuration
- `vitest.config.ts`: Test configuration
- `eslint.config.mjs`: Linting configuration

---

### 11. Wrangler Configuration

**Description**: Cloudflare Workers-specific configuration (wrangler.toml).

**Attributes**:
- `name`: Worker name
- `main`: Entry point file path
- `compatibilityDate`: Cloudflare compatibility date
- `compatibilityFlags`: Array of compatibility flags
- `bindings`: Array of resource bindings
- `routes`: Array of route patterns
- `environments`: Map of environment names to configurations

**Binding Types**:
- `d1_databases`: D1 database bindings
- `kv_namespaces`: KV namespace bindings
- `r2_buckets`: R2 bucket bindings
- `durable_objects`: Durable Object bindings
- `service_bindings`: Service-to-service bindings

**Relationships**:
- Belongs to **Worker Application**
- May reference **Database Package** (via D1 bindings)

**Validation Rules**:
- `name` must match package name convention
- `main` must point to existing entry file
- Binding names must be valid JavaScript identifiers
- Routes must be valid URL patterns

---

## Relationships Diagram

```
Monorepo Template
├── Build Configuration
├── Generator Configuration
│   └── Template Files
└── Workspace Packages
    ├── Worker Applications
    │   ├── Wrangler Configuration
    │   ├── Configuration Files
    │   └── uses → Shared Types Package
    │   └── uses → Database Package
    │   └── uses → Configuration Packages
    ├── Shared Types Package
    │   └── Configuration Files
    ├── Database Package
    │   ├── Database Schemas
    │   ├── Database Configurations
    │   └── Configuration Files
    └── Configuration Packages
        ├── ESLint Config
        ├── Prettier Config
        └── TSConfig
```

---

## State Transitions

### Worker Application Lifecycle

```
[Created by Generator]
       ↓
[Uninitialized] → (pnpm install) → [Ready]
       ↓                              ↓
       ↓                        (turbo build)
       ↓                              ↓
       ↓                          [Building]
       ↓                              ↓
       ↓                        (build success)
       ↓                              ↓
       ↓                           [Built]
       ↓                              ↓
       ↓                      (wrangler deploy)
       ↓                              ↓
       └─────────────────────────→ [Deployed]
```

### Database Package Lifecycle

```
[Created]
    ↓
(define schema)
    ↓
[Schema Defined]
    ↓
(drizzle-kit generate)
    ↓
[Migrations Generated]
    ↓
(drizzle-kit migrate/push)
    ↓
[Database Updated]
```

---

## Example Data Instances

### Example Worker Application

```json
{
  "name": "@repo/api-worker",
  "type": "app",
  "location": "apps/api-worker",
  "workerType": "http",
  "private": true,
  "bindings": [
    { "type": "d1_databases", "name": "DB", "databaseId": "xxx" },
    { "type": "kv_namespaces", "name": "CACHE", "id": "yyy" }
  ],
  "compatibilityDate": "2024-01-01",
  "routes": ["api.example.com/*"],
  "dependencies": {
    "@repo/shared-types": "workspace:*",
    "@repo/db": "workspace:*",
    "hono": "^4.0.0"
  }
}
```

### Example Database Schema

```json
{
  "name": "shared",
  "tables": ["users", "sessions", "api_keys"],
  "databaseType": "postgresql",
  "namespace": "public"
}
```

---

## Constraints and Invariants

1. **Unique Names**: All workspace packages must have unique names
2. **Workspace Protocol**: Internal dependencies must use `workspace:*`
3. **Private Apps**: All applications in `apps/` must be `private: true`
4. **Configuration Consistency**: All packages must use shared configurations from `packages/`
5. **Build Order**: Dependencies must be built before dependents (enforced by Turborepo)
6. **TypeScript Strict**: All packages must use strict TypeScript mode
7. **Testing Required**: All applications must have test files (constitution requirement)
8. **2-Space Indentation**: All code files must use 2-space indentation (enforced by Prettier)
9. **Trailing Commas**: All multi-line structures must have trailing commas
10. **Wrangler Config**: Worker applications must have valid `wrangler.toml`

---

## Notes

This data model represents the **template structure** rather than runtime application data. The template provides the foundation for users to build their own applications with their own data models using the shared database package.
