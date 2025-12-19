# Implementation Plan: Shared Wrangler Configuration

**Branch**: `002-shared-wrangler-config` | **Date**: 2025-12-19 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/002-shared-wrangler-config/spec.md`

## Summary

Create a centralized, reusable shared configuration package for Cloudflare Workers that enables developers to define Cloudflare bindings and settings once and inherit them across multiple workers, with support for environment-specific overrides and configuration validation. The approach uses a TypeScript-based configuration package that exports configuration builders and validators, allowing workers to import and compose configurations declaratively.

## Technical Context

**Language/Version**: TypeScript 5.3+, Node.js 20+ LTS  
**Primary Dependencies**: TOML parser/serializer (@ltd/j-toml), JSONC parser (jsonc-parser), TypeScript for type safety, Zod for validation  
**Storage**: File-based (wrangler.toml/wrangler.jsonc)  
**Testing**: Vitest for unit and integration tests  
**Target Platform**: PNPM workspace monorepo with Turborepo, Cloudflare Workers ecosystem  
**Project Type**: Monorepo package  
**Performance Goals**: Configuration validation <100ms, build-time resolution <500ms per worker  
**Constraints**: Must work with existing wrangler.toml/wrangler.jsonc, no breaking changes to existing workers, zero runtime dependencies  
**Scale/Scope**: Support 10-50 workers, 20+ binding types, 3-5 environments

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify compliance with `.specify/memory/constitution.md`:

- [x] **Code Quality**: ESLint/Prettier configuration planned (extends @repo/eslint-config)
- [x] **Testing Standards**: Test strategy defined (unit tests for config builders, integration tests for file generation, contract tests for wrangler compatibility)
- [x] **Testing Standards**: Test-first workflow acknowledged (write tests for config builders before implementation)
- [x] **UX Consistency**: User-facing error handling defined (clear validation messages with examples)
- [x] **Performance**: Response time targets specified (<100ms validation, <500ms build-time)
- [x] **TypeScript**: Strict TypeScript configuration confirmed (extends @repo/tsconfig/base.json)
- [x] **Simplicity**: Setup time under 15 minutes (install package, import config, done); dependencies justified (@ltd/j-toml for TOML parsing, Zod for validation)
- [x] **Architecture**: SOLID principles applied (single responsibility for config builders, interface segregation for binding types)
- [x] **Commit Strategy**: Task-based commits planned per template

**Complexity Justification Required?**: No - This feature simplifies the existing workflow by centralizing configuration. Dependencies are minimal and well-justified.

## Project Structure

### Documentation (this feature)

```text
specs/002-shared-wrangler-config/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── config-api.md    # Configuration API contract
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
packages/
└── wrangler-config/     # NEW: Shared configuration package
    ├── src/
    │   ├── builders/
    │   │   ├── account.ts       # Account configuration builder
    │   │   ├── bindings.ts      # Binding configuration builders (D1, KV, R2, DO)
    │   │   ├── environment.ts   # Environment profile builder
    │   │   └── worker.ts        # Worker configuration builder
    │   ├── validators/
    │   │   ├── schemas.ts       # Zod validation schemas
    │   │   └── validate.ts      # Validation functions
    │   ├── generators/
    │   │   ├── toml.ts          # TOML file generator
    │   │   └── jsonc.ts         # JSONC file generator
    │   ├── types/
    │   │   ├── config.ts        # Configuration types
    │   │   ├── bindings.ts      # Binding types
    │   │   └── environment.ts   # Environment types
    │   ├── presets/
    │   │   ├── common.ts        # Common configuration presets
    │   │   └── environments.ts  # Default environment profiles
    │   └── index.ts             # Main exports
    ├── test/
    │   ├── unit/
    │   │   ├── builders.test.ts
    │   │   ├── validators.test.ts
    │   │   └── generators.test.ts
    │   ├── integration/
    │   │   ├── config-inheritance.test.ts
    │   │   └── environment-override.test.ts
    │   └── contract/
    │       └── wrangler-compatibility.test.ts
    ├── package.json
    ├── tsconfig.json
    ├── vitest.config.ts
    └── README.md

apps/
└── example-worker/      # UPDATED: Use shared config
    ├── wrangler.config.ts   # NEW: TypeScript config file
    └── wrangler.toml        # UPDATED: Generated from wrangler.config.ts

turbo/generators/
└── templates/worker/
    └── wrangler.config.ts.hbs  # UPDATED: Use shared config in generator
```

**Structure Decision**: Create a new `packages/wrangler-config` package that exports configuration builders, validators, and generators. This package will be imported by workers via `wrangler.config.ts` files (TypeScript) that are used to generate `wrangler.toml` or `wrangler.jsonc` files at build time. This approach:

1. **Reusable**: Any worker can import and compose configuration
2. **Type-safe**: TypeScript provides autocomplete and validation
3. **Repeatable**: Same pattern for all workers
4. **Easy to understand**: Declarative configuration API
5. **Gradual adoption**: Existing workers can migrate incrementally

## Phase 0: Research & Design Decisions

### Research Tasks

1. **Configuration Format Strategy**
   - Research: How to support both wrangler.toml and wrangler.jsonc
   - Decision needed: Generate files at build time vs. runtime resolution
   - Best practices: Review Wrangler CLI configuration patterns

2. **Configuration Inheritance Patterns**
   - Research: TypeScript configuration composition patterns (merging, overriding)
   - Decision needed: Deep merge strategy for nested configurations
   - Alternatives: Object spread vs. lodash merge vs. custom merger

3. **Environment Management Approach**
   - Research: How other monorepos handle multi-environment configuration
   - Decision needed: Environment variables vs. profile files vs. both
   - Best practices: 12-factor app configuration principles

4. **Validation Strategy**
   - Research: Zod vs. JSON Schema vs. custom validation
   - Decision needed: Validation timing (build vs. pre-deploy)
   - Performance: Validation performance benchmarks

5. **Build Integration**
   - Research: Turborepo task dependencies for config generation
   - Decision needed: Pre-build hook vs. separate task
   - Compatibility: Ensure wrangler CLI can read generated files

### Expected Research Outputs

- **decision-format.md**: Build-time generation recommended (allows validation, keeps wrangler.toml simple)
- **decision-inheritance.md**: TypeScript function composition recommended (type-safe, no runtime overhead)
- **decision-environment.md**: Profile-based with environment variable fallback (flexible, testable)
- **decision-validation.md**: Zod schemas recommended (TypeScript integration, clear errors)
- **decision-integration.md**: Pre-build Turborepo task recommended (explicit, cacheable)

## Phase 1: Design Artifacts

### Data Model (data-model.md)

**Entities**:

1. **WranglerConfig**: Root configuration object
   - Fields: name, main, accountId, compatibility_date, compatibility_flags, bindings, env
   - Validation: Required fields, format constraints
   - Relationships: Contains multiple binding definitions, environment profiles

2. **AccountConfig**: Account-level settings
   - Fields: accountId, zone_id (optional)
   - Validation: Valid UUID format
   - Relationships: Referenced by WranglerConfig

3. **BindingDefinition**: Generic binding configuration
   - Fields: type (D1, KV, R2, DO, etc.), binding (name), configuration (type-specific)
   - Validation: Type-specific constraints
   - Relationships: Polymorphic (different types have different fields)

4. **EnvironmentProfile**: Environment-specific overrides
   - Fields: name (dev/staging/prod), overrides (partial config)
   - Validation: Only overrides allowed fields
   - Relationships: Merges with base config

5. **ValidationResult**: Validation output
   - Fields: valid (boolean), errors (array of ValidationError), warnings (array)
   - State transitions: N/A (immutable result)
   - Relationships: References config being validated

### API Contracts (contracts/config-api.md)

**Core API**:

```typescript
// Configuration Builder API
export function defineConfig(config: WranglerConfigInput): WranglerConfig;
export function defineAccount(account: AccountConfigInput): AccountConfig;
export function defineEnvironment(name: string, overrides: Partial<WranglerConfig>): EnvironmentProfile;

// Binding Builders
export function d1Binding(name: string, databaseName: string, databaseId: string): D1Binding;
export function kvBinding(name: string, namespaceId: string): KVBinding;
export function r2Binding(name: string, bucketName: string): R2Binding;
export function durableObjectBinding(name: string, className: string, scriptName?: string): DOBinding;

// Presets
export const commonBindings: {
  productionD1: (name: string) => D1Binding;
  cacheKV: (namespaceId: string) => KVBinding;
  storageBucket: (bucketName: string) => R2Binding;
};

// Validation API
export function validateConfig(config: WranglerConfig): ValidationResult;
export function validateBeforeDeploy(config: WranglerConfig, environment: string): ValidationResult;

// Generation API
export function generateTOML(config: WranglerConfig, options?: GenerateOptions): string;
export function generateJSONC(config: WranglerConfig, options?: GenerateOptions): string;
export function writeConfigFile(config: WranglerConfig, outputPath: string, format: 'toml' | 'jsonc'): Promise<void>;

// Environment Resolution
export function resolveEnvironment(base: WranglerConfig, environment: EnvironmentProfile): WranglerConfig;
export function getEnvironmentConfig(config: WranglerConfig, envName: string): WranglerConfig;
```

### Quickstart (quickstart.md)

**Setup Steps**:

1. Install package: `pnpm add @repo/wrangler-config --workspace`
2. Create `wrangler.config.ts` in worker directory
3. Define configuration using builders
4. Add build script to generate wrangler.toml
5. Test with `pnpm build && wrangler dev`

**Example Configuration**:

```typescript
// apps/my-worker/wrangler.config.ts
import { defineConfig, defineEnvironment, d1Binding, kvBinding } from '@repo/wrangler-config';

export default defineConfig({
  name: 'my-worker',
  main: 'src/index.ts',
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
  compatibility_date: '2024-01-01',
  compatibility_flags: ['nodejs_compat'],
  bindings: [
    d1Binding('DB', 'my-db', 'my-db-dev'),
    kvBinding('CACHE', process.env.KV_NAMESPACE_ID),
  ],
  environments: [
    defineEnvironment('production', {
      name: 'my-worker-prod',
      bindings: [
        d1Binding('DB', 'my-db-prod', 'my-db-prod-id'),
      ],
    }),
  ],
});
```

## Phase 2: Task Breakdown (Generated by `/speckit.tasks`)

*This section intentionally left incomplete. Task breakdown will be generated by `/speckit.tasks` command after this plan is approved.*

**Expected task categories**:

1. **Setup Tasks**: Create package structure, configure TypeScript, add dependencies
2. **Core Builder Tasks**: Implement configuration builders (account, bindings, environment)
3. **Validation Tasks**: Implement Zod schemas and validation functions
4. **Generator Tasks**: Implement TOML and JSONC generators
5. **Integration Tasks**: Integrate with Turborepo build pipeline
6. **Test Tasks**: Write unit, integration, and contract tests
7. **Documentation Tasks**: Write README, API docs, migration guide
8. **Migration Tasks**: Update existing workers and generator templates

## Risks & Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Wrangler format changes | High | Medium | Contract tests detect breakage; maintain version compatibility matrix |
| Performance overhead | Medium | Low | Benchmark validation and generation; cache results; optimize hot paths |
| Complex merge logic bugs | High | Medium | Comprehensive test coverage; visual diff testing; strict typing |
| Developer adoption friction | Medium | Medium | Excellent documentation; migration guide; pair programming sessions |
| Environment variable leakage | High | Low | Validate env vars at build time; never commit secrets; use .env.example |

## Success Metrics (from spec)

- **SC-001**: New worker setup time < 5 minutes (measured by timer in quickstart)
- **SC-002**: Config propagation verified by integration tests
- **SC-003**: 100% validation coverage (measured by test coverage)
- **SC-004**: Independent deployment verified by CI/CD pipeline
- **SC-005**: Validation timing < 30 seconds (measured by benchmarks)
- **SC-006**: Multi-environment deployment tested in integration tests
- **SC-007**: Impact analysis implemented in validation output
- **SC-008**: Zero config-related deployment failures (tracked in deployment logs)

## Next Steps

1. Review and approve this plan
2. Run `/speckit.clarify` if any design decisions need discussion
3. Run `/speckit.tasks` to generate detailed task breakdown
4. Begin Phase 0 research tasks
5. Implement Phase 1 design artifacts
6. Execute task-based implementation with test-first workflow
