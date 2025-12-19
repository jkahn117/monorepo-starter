# Task Breakdown: Shared Wrangler Configuration

**Feature**: 002-shared-wrangler-config  
**Branch**: `002-shared-wrangler-config`  
**Date**: 2025-12-19  
**Status**: Ready for Implementation

## Overview

This document provides a detailed, actionable task breakdown for implementing the Shared Wrangler Configuration feature. Tasks are organized by user story to enable independent testing and incremental delivery.

**Implementation Strategy**:
1. Build foundational infrastructure first (Setup + Core)
2. Implement User Story 1 (P1) - MVP functionality
3. Implement User Story 5 (P2) - RPC Type Safety
4. Implement User Story 2 (P2) - Per-Application Overrides
5. Implement User Story 3 (P3) - Environment-Specific Configuration
6. Implement User Story 4 (P4) - Configuration Validation
7. Polish and documentation

**Task Format**: `- [ ] T### [P] [US#] Description (file path)`
- `T###`: Task ID
- `[P]`: Parallelizable (can run concurrently with other `[P]` tasks)
- `[US#]`: User Story ID (1-5)
- Tasks without `[P]` must run after previous tasks complete

---

## Phase 1: Setup & Package Infrastructure

**Goal**: Create the `@repo/wrangler-config` package structure and configure tooling.

### Package Structure

- [X] T001 [P] Create package directory `packages/wrangler-config/`
- [X] T002 [P] Create package.json for `@repo/wrangler-config` with dependencies (packages/wrangler-config/package.json)
- [X] T003 [P] Create tsconfig.json extending `@repo/tsconfig/base.json` (packages/wrangler-config/tsconfig.json)
- [X] T004 [P] Create vitest.config.ts for testing setup (packages/wrangler-config/vitest.config.ts)
- [X] T005 [P] Create eslint.config.mjs extending `@repo/eslint-config` (packages/wrangler-config/eslint.config.mjs)
- [X] T006 [P] Create README.md with overview and placeholder content (packages/wrangler-config/README.md)

### Source Structure

- [X] T007 [P] Create source directories: src/builders, src/validators, src/generators, src/types, src/presets (packages/wrangler-config/src/)
- [X] T008 [P] Create test directories: test/unit, test/integration, test/contract (packages/wrangler-config/test/)
- [X] T009 [P] Create main entry point with basic exports (packages/wrangler-config/src/index.ts)

### Dependencies

- [X] T010 Install core dependencies: @ltd/j-toml, jsonc-parser, zod (packages/wrangler-config/package.json)
- [X] T011 Install dev dependencies: vitest, tsx, @types/node (packages/wrangler-config/package.json)
- [X] T012 Add package to workspace root package.json references

### Verification

- [X] T013 Run `pnpm install` from monorepo root and verify package resolves
- [X] T014 Run `pnpm -F @repo/wrangler-config test` and verify vitest runs (should pass with no tests)
- [X] T015 Run `pnpm -F @repo/wrangler-config lint` and verify ESLint runs

**Commit checkpoint**: ✅ Package structure created

---

## Phase 2: Foundational Types & Core Builders

**Goal**: Implement core TypeScript types and basic builder functions.

### Core Types

- [X] T016 [P] Define BindingType discriminated union (packages/wrangler-config/src/types/bindings.ts)
- [X] T017 [P] Define D1Binding, KVBinding, R2Binding, DurableObjectBinding interfaces (packages/wrangler-config/src/types/bindings.ts)
- [X] T018 [P] Define ServiceBinding interface (packages/wrangler-config/src/types/bindings.ts)
- [X] T019 [P] Define Binding discriminated union type (packages/wrangler-config/src/types/bindings.ts)
- [X] T020 [P] Define WranglerConfig interface (packages/wrangler-config/src/types/config.ts)
- [X] T021 [P] Define EnvironmentConfig interface (packages/wrangler-config/src/types/environment.ts)
- [X] T022 [P] Define AccountConfig interface (packages/wrangler-config/src/types/config.ts)
- [X] T023 Export all types from types/index.ts (packages/wrangler-config/src/types/index.ts)

### Zod Schemas

- [X] T024 Create Zod schema for D1Binding (packages/wrangler-config/src/validators/schemas.ts)
- [X] T025 Create Zod schema for KVBinding (packages/wrangler-config/src/validators/schemas.ts)
- [X] T026 Create Zod schema for R2Binding (packages/wrangler-config/src/validators/schemas.ts)
- [X] T027 Create Zod schema for DurableObjectBinding (packages/wrangler-config/src/validators/schemas.ts)
- [X] T028 Create Zod schema for ServiceBinding (packages/wrangler-config/src/validators/schemas.ts)
- [X] T029 Create Zod discriminated union schema for all Bindings (packages/wrangler-config/src/validators/schemas.ts)
- [X] T030 Create Zod schema for WranglerConfig (packages/wrangler-config/src/validators/schemas.ts)
- [X] T031 Create Zod schema for EnvironmentConfig (packages/wrangler-config/src/validators/schemas.ts)

### Basic Builders

- [X] T032 Implement d1Binding() builder function (packages/wrangler-config/src/builders/bindings.ts)
- [X] T033 Implement kvBinding() builder function (packages/wrangler-config/src/builders/bindings.ts)
- [X] T034 Implement r2Binding() builder function (packages/wrangler-config/src/builders/bindings.ts)
- [X] T035 Implement durableObjectBinding() builder function (packages/wrangler-config/src/builders/bindings.ts)
- [X] T036 Implement serviceBinding() builder function (packages/wrangler-config/src/builders/bindings.ts)

### Unit Tests for Builders

- [X] T037 Write unit tests for d1Binding() (packages/wrangler-config/test/unit/builders.test.ts)
- [X] T038 Write unit tests for kvBinding() (packages/wrangler-config/test/unit/builders.test.ts)
- [X] T039 Write unit tests for r2Binding() (packages/wrangler-config/test/unit/builders.test.ts)
- [X] T040 Write unit tests for durableObjectBinding() (packages/wrangler-config/test/unit/builders.test.ts)
- [X] T041 Write unit tests for serviceBinding() (packages/wrangler-config/test/unit/builders.test.ts)

### Verification

- [X] T042 Run `pnpm test` and verify all builder tests pass (target: 100% coverage for builders)
- [X] T043 Run `pnpm lint` and ensure no errors

**Commit checkpoint**: ✅ Core types and builders implemented

---

## Phase 3: User Story 1 - Centralized Configuration Source (P1, MVP)

**Goal**: Enable workers to define and reference shared Cloudflare configuration.

**Acceptance**: Create a shared configuration package, reference it from two different workers, verify both workers have identical Cloudflare binding configurations without duplication.

### Configuration Builder

- [X] T044 Implement defineConfig() function (packages/wrangler-config/src/builders/worker.ts)
- [X] T045 Implement config validation inside defineConfig() (packages/wrangler-config/src/builders/worker.ts)
- [X] T046 Add default values for optional fields in defineConfig() (packages/wrangler-config/src/builders/worker.ts)
- [X] T047 Write unit tests for defineConfig() - happy path (packages/wrangler-config/test/unit/worker.test.ts)
- [X] T048 Write unit tests for defineConfig() - missing required fields (packages/wrangler-config/test/unit/worker.test.ts)
- [X] T049 Write unit tests for defineConfig() - default values (packages/wrangler-config/test/unit/worker.test.ts)

### TOML Generator

- [X] T050 Implement generateTOML() function using @ltd/j-toml (packages/wrangler-config/src/generators/toml.ts)
- [X] T051 Implement proper escaping for strings in TOML (packages/wrangler-config/src/generators/toml.ts)
- [X] T052 Implement binding serialization to TOML format (packages/wrangler-config/src/generators/toml.ts)
- [X] T053 Write unit tests for generateTOML() - basic config (packages/wrangler-config/test/unit/generators.test.ts)
- [X] T054 Write unit tests for generateTOML() - with bindings (packages/wrangler-config/test/unit/generators.test.ts)
- [X] T055 Write unit tests for generateTOML() - special characters (packages/wrangler-config/test/unit/generators.test.ts)

### File Writer

- [X] T056 Implement writeConfigFile() function (packages/wrangler-config/src/generators/toml.ts)
- [X] T057 Add directory creation logic to writeConfigFile() (packages/wrangler-config/src/generators/toml.ts)
- [X] T058 Write unit tests for writeConfigFile() (packages/wrangler-config/test/unit/generators.test.ts)

### Integration Test

- [X] T059 [US1] Write integration test: Create shared config, reference from two workers, verify identical output (packages/wrangler-config/test/integration/config-inheritance.test.ts)

### Update Main Exports

- [X] T060 Export all builder functions from main index (packages/wrangler-config/src/index.ts)
- [X] T061 Export all generator functions from main index (packages/wrangler-config/src/index.ts)

### Example Worker Migration

- [X] T062 [US1] Create wrangler.config.ts for example-worker using defineConfig() (apps/example-worker/wrangler.config.ts)
- [X] T063 [US1] Add config:generate script to example-worker package.json (apps/example-worker/package.json)
- [X] T064 [US1] Update turbo.json to add config:generate task with caching (turbo.json)
- [X] T065 [US1] Update turbo.json build task to depend on config:generate (turbo.json)
- [X] T066 [US1] Update turbo.json dev task to depend on config:generate (turbo.json)
- [X] T067 [US1] Run pnpm config:generate in example-worker and verify wrangler.toml is generated (apps/example-worker/wrangler.toml)
- [X] T068 [US1] Run pnpm dev in example-worker and verify wrangler dev starts successfully

### Contract Test

- [X] T069 [US1] Write contract test: Generate wrangler.toml and verify wrangler CLI can parse it (packages/wrangler-config/test/contract/wrangler-compatibility.test.ts)

### Verification

- [X] T070 [US1] Verify example-worker builds successfully with generated config
- [X] T071 [US1] Verify example-worker can be deployed (dry-run if no Cloudflare account)
- [X] T072 [US1] Run all tests and verify >90% coverage

**Commit checkpoint**: ✅ User Story 1 complete - Centralized configuration working

---

## Phase 4: User Story 5 - RPC Type Safety (P2)

**Goal**: Auto-generate TypeScript types for workers that expose RPC interfaces.

**Acceptance**: Create Worker B that exposes an RPC interface, configure Worker A to call Worker B via service binding, verify Worker A has full TypeScript autocomplete and type checking for Worker B's methods.

### RPC Type Generation Infrastructure

- [X] T073 [P] [US5] Create generated-types directory structure (packages/wrangler-config/generated-types/.gitkeep)
- [X] T074 [P] [US5] Add generated-types to .gitignore (packages/wrangler-config/.gitignore)
- [X] T075 [P] [US5] Define RPCTypeDefinition interface (packages/wrangler-config/src/types/rpc.ts)
- [X] T076 [P] [US5] Define ServiceBindingDeclaration interface (packages/wrangler-config/src/types/rpc.ts)

### RPC Configuration

- [X] T077 [US5] Add exposeRPC field to WranglerConfig type (packages/wrangler-config/src/types/config.ts)
- [X] T078 [US5] Update WranglerConfigSchema to include exposeRPC (packages/wrangler-config/src/validators/schemas.ts)
- [X] T079 [US5] Update defineConfig() to handle exposeRPC declaration (packages/wrangler-config/src/builders/worker.ts)

### Type Generation Functions

- [X] T080 [US5] Implement discoverRPCWorkers() function to scan configs (packages/wrangler-config/src/generators/typegen.ts)
- [X] T081 [US5] Implement generateRPCTypes() function calling wrangler types (packages/wrangler-config/src/generators/typegen.ts)
- [X] T082 [US5] Implement storeGeneratedTypes() to save to generated-types/[worker-name]/ (packages/wrangler-config/src/generators/typegen.ts)
- [X] T083 [US5] Write unit tests for discoverRPCWorkers() (packages/wrangler-config/test/unit/typegen.test.ts)
- [X] T084 [US5] Write unit tests for generateRPCTypes() (packages/wrangler-config/test/unit/typegen.test.ts)

### Turborepo Integration

- [ ] T085 [US5] Add types:generate task to turbo.json (turbo.json)
- [ ] T086 [US5] Configure types:generate to output to generated-types/ (turbo.json)
- [ ] T087 [US5] Update config:generate to depend on types:generate for workers with service bindings (turbo.json)

### Type Validation

- [ ] T088 [US5] Implement validateRPCTypes() to check for breaking changes (packages/wrangler-config/src/validators/rpc.ts)
- [ ] T089 [US5] Emit warnings when RPC interface types change (packages/wrangler-config/src/validators/rpc.ts)
- [ ] T090 [US5] Fail builds only for actual type mismatches (packages/wrangler-config/src/validators/rpc.ts)
- [ ] T091 [US5] Write unit tests for validateRPCTypes() (packages/wrangler-config/test/unit/rpc-validation.test.ts)

### Integration Test

- [ ] T092 [US5] Create test Worker B that exposes RPC interface (packages/wrangler-config/test/fixtures/worker-b/)
- [ ] T093 [US5] Create test Worker A with service binding to Worker B (packages/wrangler-config/test/fixtures/worker-a/)
- [ ] T094 [US5] Write integration test: Generate types for Worker B, verify Worker A can import them (packages/wrangler-config/test/integration/rpc-types.test.ts)
- [ ] T095 [US5] Write integration test: Verify TypeScript compilation succeeds with generated types (packages/wrangler-config/test/integration/rpc-types.test.ts)

### Documentation

- [ ] T096 [US5] Document RPC type generation in README (packages/wrangler-config/README.md)
- [ ] T097 [US5] Add example of declaring exposeRPC in wrangler.config.ts (packages/wrangler-config/README.md)
- [ ] T098 [US5] Document versioning guidance for RPC interfaces (packages/wrangler-config/README.md)

### Verification

- [ ] T099 [US5] Run types:generate task and verify types are generated
- [ ] T100 [US5] Verify Worker A gets TypeScript autocomplete for Worker B's methods
- [ ] T101 [US5] Run all RPC-related tests and verify passing

**Commit checkpoint**: ✅ User Story 5 complete - RPC type safety working

---

## Phase 5: User Story 2 - Per-Application Configuration Overrides (P2)

**Goal**: Enable workers to override specific configuration values while keeping shared defaults.

**Acceptance**: Define a shared base configuration, create a worker that overrides the worker name and adds a custom binding, verify the worker uses both shared and custom settings correctly.

### Environment Builder

- [ ] T102 [P] [US2] Implement defineEnvironment() function (packages/wrangler-config/src/builders/environment.ts)
- [ ] T103 [P] [US2] Add validation for environment overrides (packages/wrangler-config/src/builders/environment.ts)
- [ ] T104 [P] [US2] Write unit tests for defineEnvironment() (packages/wrangler-config/test/unit/environment.test.ts)

### Configuration Merging

- [ ] T105 [US2] Implement resolveEnvironment() merge function (packages/wrangler-config/src/builders/environment.ts)
- [ ] T106 [US2] Implement primitive field override logic (packages/wrangler-config/src/builders/environment.ts)
- [ ] T107 [US2] Implement array replacement for bindings (packages/wrangler-config/src/builders/environment.ts)
- [ ] T108 [US2] Implement deep merge for vars object (packages/wrangler-config/src/builders/environment.ts)
- [ ] T109 [US2] Write unit tests for resolveEnvironment() - primitives (packages/wrangler-config/test/unit/environment.test.ts)
- [ ] T110 [US2] Write unit tests for resolveEnvironment() - bindings (packages/wrangler-config/test/unit/environment.test.ts)
- [ ] T111 [US2] Write unit tests for resolveEnvironment() - vars merge (packages/wrangler-config/test/unit/environment.test.ts)
- [ ] T112 [US2] Write unit tests for resolveEnvironment() - immutability (packages/wrangler-config/test/unit/environment.test.ts)

### Environment Resolution

- [ ] T113 [US2] Implement getEnvironmentConfig() function (packages/wrangler-config/src/builders/environment.ts)
- [ ] T114 [US2] Add error handling for missing environments (packages/wrangler-config/src/builders/environment.ts)
- [ ] T115 [US2] Write unit tests for getEnvironmentConfig() (packages/wrangler-config/test/unit/environment.test.ts)

### Integration with Generation

- [ ] T116 [US2] Update generateTOML() to support environment parameter (packages/wrangler-config/src/generators/toml.ts)
- [ ] T117 [US2] Update writeConfigFile() to accept environment name (packages/wrangler-config/src/generators/toml.ts)
- [ ] T118 [US2] Write unit tests for environment-specific generation (packages/wrangler-config/test/unit/generators.test.ts)

### Integration Test

- [ ] T119 [US2] Create shared base configuration preset (packages/wrangler-config/test/fixtures/base-config.ts)
- [ ] T120 [US2] Write integration test: Override worker name and add binding (packages/wrangler-config/test/integration/config-override.test.ts)
- [ ] T121 [US2] Write integration test: Verify both shared and custom settings present (packages/wrangler-config/test/integration/config-override.test.ts)

### Update Main Exports

- [ ] T122 [US2] Export environment functions from main index (packages/wrangler-config/src/index.ts)

### Verification

- [ ] T123 [US2] Run all environment override tests and verify passing
- [ ] T124 [US2] Verify example-worker can define environment-specific overrides
- [ ] T125 [US2] Test that non-overridden values are inherited correctly

**Commit checkpoint**: ✅ User Story 2 complete - Configuration overrides working

---

## Phase 6: User Story 3 - Environment-Specific Configuration (P3)

**Goal**: Manage different Cloudflare configurations for development, staging, and production environments.

**Acceptance**: Configure shared environment definitions (dev, staging, prod), deploy the same worker to two different environments, verify each deployment uses environment-appropriate configuration.

### Environment Presets

- [ ] T126 [P] [US3] Create development environment preset (packages/wrangler-config/src/presets/environments.ts)
- [ ] T127 [P] [US3] Create staging environment preset (packages/wrangler-config/src/presets/environments.ts)
- [ ] T128 [P] [US3] Create production environment preset (packages/wrangler-config/src/presets/environments.ts)
- [ ] T129 [P] [US3] Write unit tests for environment presets (packages/wrangler-config/test/unit/presets.test.ts)

### Environment Variable Integration

- [ ] T130 [US3] Add environment variable resolution in defineEnvironment() (packages/wrangler-config/src/builders/environment.ts)
- [ ] T131 [US3] Add validation for required environment variables in production (packages/wrangler-config/src/validators/validate.ts)
- [ ] T132 [US3] Write unit tests for environment variable resolution (packages/wrangler-config/test/unit/environment.test.ts)

### CLI Support

- [ ] T133 [US3] Add --environment flag support to config:generate script (packages/wrangler-config/src/cli.ts)
- [ ] T134 [US3] Update example-worker package.json with environment-specific scripts (apps/example-worker/package.json)
- [ ] T135 [US3] Write unit tests for CLI environment selection (packages/wrangler-config/test/unit/cli.test.ts)

### Integration Test

- [ ] T136 [US3] Write integration test: Generate config for development environment (packages/wrangler-config/test/integration/environment-deployment.test.ts)
- [ ] T137 [US3] Write integration test: Generate config for production environment (packages/wrangler-config/test/integration/environment-deployment.test.ts)
- [ ] T138 [US3] Write integration test: Verify different account IDs and binding IDs per environment (packages/wrangler-config/test/integration/environment-deployment.test.ts)

### Update Main Exports

- [ ] T139 [US3] Export environment presets from main index (packages/wrangler-config/src/index.ts)
- [ ] T140 [US3] Export from presets/index.ts (packages/wrangler-config/src/presets/index.ts)

### Documentation

- [ ] T141 [US3] Document environment-specific configuration in README (packages/wrangler-config/README.md)
- [ ] T142 [US3] Add examples of development, staging, production configs (packages/wrangler-config/README.md)
- [ ] T143 [US3] Document environment variable naming conventions (packages/wrangler-config/README.md)

### Verification

- [ ] T144 [US3] Test generating config for all three environment presets
- [ ] T145 [US3] Verify environment variables are correctly resolved
- [ ] T146 [US3] Run all environment tests and verify passing

**Commit checkpoint**: ✅ User Story 3 complete - Environment-specific config working

---

## Phase 7: User Story 4 - Configuration Validation (P4)

**Goal**: Validate configuration and warn when required Cloudflare settings are missing or invalid.

**Acceptance**: Create a worker with missing required configuration, run validation, verify it reports specific missing values with helpful error messages.

### Validation Types

- [ ] T147 [P] [US4] Define ValidationResult interface (packages/wrangler-config/src/types/validation.ts)
- [ ] T148 [P] [US4] Define ValidationError interface (packages/wrangler-config/src/types/validation.ts)
- [ ] T149 [P] [US4] Define ValidationWarning interface (packages/wrangler-config/src/types/validation.ts)
- [ ] T150 [P] [US4] Define ValidationMetadata interface (packages/wrangler-config/src/types/validation.ts)

### Validation Functions

- [ ] T151 [US4] Implement validateConfig() using Zod schemas (packages/wrangler-config/src/validators/validate.ts)
- [ ] T152 [US4] Implement validateBeforeDeploy() with deployment-specific checks (packages/wrangler-config/src/validators/validate.ts)
- [ ] T153 [US4] Add custom validation rules for business logic (packages/wrangler-config/src/validators/validate.ts)
- [ ] T154 [US4] Implement warning checks (outdated compatibility_date, etc.) (packages/wrangler-config/src/validators/validate.ts)
- [ ] T155 [US4] Format error messages with actionable suggestions (packages/wrangler-config/src/validators/validate.ts)

### Unit Tests

- [ ] T156 [US4] Write unit tests for validateConfig() - valid config (packages/wrangler-config/test/unit/validators.test.ts)
- [ ] T157 [US4] Write unit tests for validateConfig() - missing required fields (packages/wrangler-config/test/unit/validators.test.ts)
- [ ] T158 [US4] Write unit tests for validateConfig() - invalid formats (packages/wrangler-config/test/unit/validators.test.ts)
- [ ] T159 [US4] Write unit tests for validateBeforeDeploy() - missing accountId (packages/wrangler-config/test/unit/validators.test.ts)
- [ ] T160 [US4] Write unit tests for validateBeforeDeploy() - missing binding IDs (packages/wrangler-config/test/unit/validators.test.ts)
- [ ] T161 [US4] Write unit tests for warning generation (packages/wrangler-config/test/unit/validators.test.ts)

### Error Messages

- [ ] T162 [US4] Create error message templates with examples (packages/wrangler-config/src/validators/messages.ts)
- [ ] T163 [US4] Add JSON path information to errors (packages/wrangler-config/src/validators/validate.ts)
- [ ] T164 [US4] Write unit tests for error message formatting (packages/wrangler-config/test/unit/messages.test.ts)

### Integration with defineConfig

- [ ] T165 [US4] Add automatic validation call in defineConfig() (packages/wrangler-config/src/builders/worker.ts)
- [ ] T166 [US4] Throw ConfigValidationError on validation failure (packages/wrangler-config/src/builders/worker.ts)
- [ ] T167 [US4] Write integration tests for validation in defineConfig() (packages/wrangler-config/test/integration/validation.test.ts)

### Integration Test

- [ ] T168 [US4] Create test worker config with missing accountId (packages/wrangler-config/test/fixtures/invalid-worker.ts)
- [ ] T169 [US4] Write integration test: Run validation on invalid config (packages/wrangler-config/test/integration/validation.test.ts)
- [ ] T170 [US4] Write integration test: Verify specific error messages (packages/wrangler-config/test/integration/validation.test.ts)
- [ ] T171 [US4] Write integration test: Verify warnings don't fail builds (packages/wrangler-config/test/integration/validation.test.ts)

### Update Main Exports

- [ ] T172 [US4] Export validation functions from main index (packages/wrangler-config/src/index.ts)
- [ ] T173 [US4] Export validation types from main index (packages/wrangler-config/src/index.ts)

### Verification

- [ ] T174 [US4] Test validation catches all required field errors
- [ ] T175 [US4] Verify error messages are clear and actionable
- [ ] T176 [US4] Run all validation tests and verify passing

**Commit checkpoint**: ✅ User Story 4 complete - Configuration validation working

---

## Phase 8: Polish & Documentation

**Goal**: Complete documentation, update generator templates, and finalize the feature.

### JSONC Generator

- [X] T177 [P] Implement generateJSONC() function using jsonc-parser (packages/wrangler-config/src/generators/jsonc.ts)
- [X] T178 [P] Implement comment preservation in JSONC (packages/wrangler-config/src/generators/jsonc.ts)
- [X] T179 [P] Write unit tests for generateJSONC() (packages/wrangler-config/test/unit/generators.test.ts)

### Common Binding Presets

- [X] T180 [P] Create productionD1 preset (packages/wrangler-config/src/presets/common.ts)
- [X] T181 [P] Create cacheKV preset (packages/wrangler-config/src/presets/common.ts)
- [X] T182 [P] Create storageBucket preset (packages/wrangler-config/src/presets/common.ts)
- [X] T183 [P] Write unit tests for binding presets (packages/wrangler-config/test/unit/presets.test.ts)

### Update Turbo Generator

- [X] T184 Update worker generator template to use wrangler.config.ts (turbo/generators/templates/worker/wrangler.config.ts.hbs)
- [X] T185 Remove wrangler.toml.hbs template (turbo/generators/templates/worker/wrangler.toml.hbs)
- [X] T186 Update generator config.ts to include wrangler.config.ts (turbo/generators/config.ts)
- [X] T187 Test generator: Create new worker and verify wrangler.config.ts is created

### Comprehensive Documentation

- [X] T188 Write complete README.md with API reference (packages/wrangler-config/README.md)
- [X] T189 Add installation instructions (packages/wrangler-config/README.md)
- [X] T190 Add quickstart guide with code examples (packages/wrangler-config/README.md)
- [X] T191 Document all builder functions with examples (packages/wrangler-config/README.md)
- [X] T192 Document validation functions with examples (packages/wrangler-config/README.md)
- [X] T193 Document environment management (packages/wrangler-config/README.md)
- [X] T194 Document RPC type generation (packages/wrangler-config/README.md)
- [X] T195 Add migration guide from manual wrangler.toml (packages/wrangler-config/README.md)
- [X] T196 Add troubleshooting section (packages/wrangler-config/README.md)

### Update Monorepo Documentation

- [ ] T197 Update root README.md to mention wrangler-config package (README.md)
- [ ] T198 Update ARCHITECTURE.md with wrangler-config design (docs/ARCHITECTURE.md)
- [ ] T199 Add section to DEPLOYMENT.md about environment-specific configs (docs/DEPLOYMENT.md)
- [ ] T200 Update GENERATOR.md to document wrangler.config.ts template (docs/GENERATOR.md)

### Performance Optimization

- [ ] T201 Add benchmarks for config validation (<100ms target) (packages/wrangler-config/test/benchmarks/validation.bench.ts)
- [ ] T202 Add benchmarks for TOML generation (<50ms target) (packages/wrangler-config/test/benchmarks/generation.bench.ts)
- [ ] T203 Profile and optimize hot paths if benchmarks fail targets
- [ ] T204 Verify Turborepo caching works correctly for config:generate

### Final Testing

- [ ] T205 Run full test suite and verify >90% code coverage
- [ ] T206 Test creating new worker with pnpm gen cloudflare-worker
- [ ] T207 Test migrating existing worker to shared config
- [ ] T208 Test multi-environment deployment workflow
- [ ] T209 Run ESLint and fix any remaining issues
- [ ] T210 Run Prettier and format all files

### Verification & QA

- [ ] T211 Verify all acceptance criteria met for User Story 1
- [ ] T212 Verify all acceptance criteria met for User Story 2
- [ ] T213 Verify all acceptance criteria met for User Story 3
- [ ] T214 Verify all acceptance criteria met for User Story 4
- [ ] T215 Verify all acceptance criteria met for User Story 5
- [ ] T216 Test all edge cases documented in spec.md
- [ ] T217 Verify success criteria SC-001 through SC-010

**Commit checkpoint**: ✅ Feature complete and documented

---

## Summary Statistics

- **Total Tasks**: 217
- **Parallelizable Tasks**: 38 (marked with [P])
- **User Story Distribution**:
  - US1 (P1): 11 tasks
  - US2 (P2): 24 tasks
  - US3 (P3): 21 tasks
  - US4 (P4): 31 tasks
  - US5 (P2): 29 tasks
  - Infrastructure: 101 tasks

## Dependency Graph

```
Phase 1 (Setup)
  ↓
Phase 2 (Core)
  ↓
Phase 3 (US1 - MVP) ←─────────┐
  ↓                           │
  ├──→ Phase 4 (US5 - RPC)    │ Can run in parallel
  │                           │ after Phase 3
  └──→ Phase 5 (US2 - Overrides) ┘
         ↓
       Phase 6 (US3 - Environments)
         ↓
       Phase 7 (US4 - Validation)
         ↓
       Phase 8 (Polish)
```

## Next Steps

1. **Review this task breakdown** with the team
2. **Begin Phase 1** with `/speckit.implement` command
3. **Use task-based commits**: Commit after completing each task or logical group
4. **Test incrementally**: Run tests after each phase
5. **Update this document**: Check off tasks as they're completed

## Notes

- Tasks marked `[P]` can run in parallel with other `[P]` tasks in the same section
- Each user story can be tested independently after its phase completes
- Phase 3 (US1) is the MVP - can ship after this phase if needed
- Phases 4-7 can be partially parallelized after Phase 3
- All file paths are relative to monorepo root

---

**Status**: ✅ Ready for implementation with `/speckit.implement`
