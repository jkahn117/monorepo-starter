# Tasks: Cloudflare Monorepo Template

**Input**: Design documents from `/specs/001-cloudflare-monorepo-template/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are MANDATORY per constitution (Principle II). Test tasks must be included for all features and must be written FIRST (test-first workflow).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Monorepo template**: Template files at repository root
- All paths relative to repository root
- Configuration packages in `packages/`
- Example apps in `apps/`
- Generator templates in `turbo/generators/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic monorepo structure

- [x] T001 Create root .gitignore file with node_modules, dist, .wrangler, coverage, .env patterns
- [x] T002 Create LICENSE file (MIT) in root
- [x] T003 [P] Create pnpm-workspace.yaml defining apps/* and packages/* workspaces
- [x] T004 [P] Create root package.json with workspace configuration and turbo scripts
- [x] T005 [P] Create .prettierignore excluding node_modules, dist, coverage, .wrangler
- [x] T006 [P] Create .eslintignore excluding node_modules, dist, coverage
- [x] T007 [P] Create .editorconfig enforcing 2-space indentation and LF line endings
- [x] T008 [P] Create .nvmrc or .node-version specifying Node.js 20 LTS

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Configuration Packages

- [x] T009 [P] Create packages/prettier-config/package.json with config exports
- [x] T010 [P] Create packages/prettier-config/index.js with 2-space, trailing comma config
- [x] T011 [P] Create packages/eslint-config/package.json with multiple config exports
- [x] T012 [P] Create packages/eslint-config/base.js with base JavaScript rules
- [x] T013 [P] Create packages/eslint-config/typescript.js with TypeScript-specific rules
- [x] T014 [P] Create packages/eslint-config/workers.js with Cloudflare Workers globals and restrictions
- [x] T015 [P] Create packages/eslint-config/index.js exporting all configurations
- [x] T016 [P] Create packages/tsconfig/package.json with exports field
- [x] T017 [P] Create packages/tsconfig/base.json with strict TypeScript settings
- [x] T018 [P] Create packages/tsconfig/worker.json extending base with Workers types
- [x] T019 [P] Create packages/tsconfig/nuxt.json extending base for Nuxt apps

### Root Configuration Files

- [x] T020 Create root .prettierrc.json referencing prettier-config package
- [x] T021 Create root eslint.config.mjs using eslint-config package
- [x] T022 Create root tsconfig.json extending tsconfig/base.json

### Turborepo Configuration

- [x] T023 Create turbo.json with build, dev, test, lint, deploy tasks
- [x] T024 Configure build task in turbo.json with outputs and dependency graph
- [x] T025 Configure test task in turbo.json with coverage outputs
- [x] T026 Configure dev task in turbo.json as persistent non-cached
- [x] T027 Configure lint task in turbo.json with source inputs
- [x] T028 Configure deploy task in turbo.json depending on build, test, lint

### Tests for Configuration Packages

- [ ] T029 [P] Create packages/prettier-config/test/config.test.ts validating exported config
- [ ] T030 [P] Create packages/eslint-config/test/base.test.ts validating base rules
- [ ] T031 [P] Create packages/eslint-config/test/typescript.test.ts validating TS rules
- [ ] T032 [P] Create packages/eslint-config/test/workers.test.ts validating Workers rules
- [ ] T033 [P] Create packages/tsconfig/test/config.test.ts validating TypeScript configs

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Initialize New Cloudflare Monorepo (Priority: P1) 🎯 MVP

**Goal**: Provide complete monorepo structure with working build pipeline and example application

**Independent Test**: Clone template, run pnpm install, run pnpm build - all packages build successfully without errors

### Tests for User Story 1 (MANDATORY - Constitution Principle II) ⚠️

> **NON-NEGOTIABLE: Write these tests FIRST, ensure they FAIL before implementation (Red-Green-Refactor)**

- [x] T034 [P] [US1] Create tests/integration/monorepo-structure.test.ts validating directory structure
- [x] T035 [P] [US1] Create tests/integration/workspace-config.test.ts validating PNPM workspace setup
- [x] T036 [P] [US1] Create tests/integration/build-pipeline.test.ts validating Turborepo builds
- [ ] T037 [P] [US1] Create tests/integration/type-checking.test.ts validating TypeScript compilation
- [ ] T038 [P] [US1] Create tests/integration/linting.test.ts validating ESLint passes

### Implementation for User Story 1

- [x] T039 [P] [US1] Create packages/shared-types/package.json with exports configuration
- [x] T040 [P] [US1] Create packages/shared-types/tsconfig.json extending tsconfig/base.json
- [x] T041 [P] [US1] Create packages/shared-types/src/index.ts exporting all type modules
- [x] T042 [P] [US1] Create packages/shared-types/src/api.ts with ApiResponse and ErrorResponse interfaces
- [x] T043 [P] [US1] Create packages/shared-types/src/common.ts with common utility types
- [x] T044 [P] [US1] Create packages/shared-types/vitest.config.ts for package tests
- [x] T045 [P] [US1] Create packages/shared-types/test/types.test.ts validating type exports
- [x] T046 [US1] Create apps/example-worker/package.json with dependencies and scripts
- [x] T047 [US1] Create apps/example-worker/tsconfig.json extending tsconfig/worker.json
- [x] T048 [US1] Create apps/example-worker/wrangler.toml with worker configuration
- [x] T049 [US1] Create apps/example-worker/src/index.ts with Hono HTTP handler
- [x] T050 [US1] Create apps/example-worker/src/routes/index.ts with example routes
- [x] T051 [US1] Create apps/example-worker/src/types.ts with local type definitions
- [x] T052 [US1] Create apps/example-worker/vitest.config.ts with Miniflare environment
- [x] T053 [US1] Create apps/example-worker/test/index.test.ts with HTTP request tests
- [x] T054 [US1] Create apps/example-worker/.env.example with placeholder values
- [x] T055 [US1] Create apps/example-worker/README.md with setup instructions
- [x] T056 [US1] Create root README.md with template overview and quickstart
- [x] T057 [US1] Create root .env.example with global environment variables

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Share Types Across Applications (Priority: P2)

**Goal**: Enable seamless type sharing between all applications in monorepo

**Independent Test**: Define type in shared-types package, import in example-worker, verify build succeeds and IDE provides autocomplete

### Tests for User Story 2 (MANDATORY - Constitution Principle II) ⚠️

- [x] T058 [P] [US2] Create packages/shared-types/test/import.test.ts validating types are importable
- [x] T059 [P] [US2] Create packages/shared-types/test/type-inference.test.ts validating TypeScript inference
- [x] T060 [P] [US2] Create tests/integration/type-sharing.test.ts validating cross-package type usage

### Implementation for User Story 2

- [x] T061 [P] [US2] Create packages/shared-types/src/database.ts with database-related types
- [x] T062 [P] [US2] Create packages/shared-types/src/worker.ts with Cloudflare Workers types
- [x] T063 [P] [US2] Create packages/shared-types/src/events.ts with event types
- [x] T064 [US2] Update apps/example-worker/src/index.ts to use shared types
- [x] T065 [US2] Update apps/example-worker/src/routes/index.ts to use shared ApiResponse
- [x] T066 [US2] Update apps/example-worker/test/index.test.ts to validate shared types usage
- [x] T067 [US2] Create packages/shared-types/README.md documenting exported types
- [x] T068 [US2] Create packages/shared-types/CHANGELOG.md tracking type changes

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Generate New Cloudflare Worker Application (Priority: P3)

**Goal**: Automated scaffolding of new worker applications with consistent configuration

**Independent Test**: Run turbo gen cloudflare-worker, verify generated app builds and passes linting

### Tests for User Story 3 (MANDATORY - Constitution Principle II) ⚠️

- [x] T069 [P] [US3] Create tests/integration/generator-validation.test.ts validating generator config
- [x] T070 [P] [US3] Create tests/integration/generator-output.test.ts validating generated files
- [x] T071 [P] [US3] Create tests/integration/generator-compilation.test.ts validating generated code compiles

### Implementation for User Story 3

- [x] T072 [P] [US3] Create turbo/generators/config.ts with generator configuration
- [x] T073 [P] [US3] Create turbo/generators/templates/worker/package.json.hbs template
- [x] T074 [P] [US3] Create turbo/generators/templates/worker/tsconfig.json.hbs template
- [x] T075 [P] [US3] Create turbo/generators/templates/worker/wrangler.toml.hbs with conditional bindings
- [x] T076 [P] [US3] Create turbo/generators/templates/worker/vitest.config.ts.hbs template
- [x] T077 [P] [US3] Create turbo/generators/templates/worker/src/index.ts.hbs with HTTP worker template
- [x] T078 [P] [US3] Create turbo/generators/templates/worker/src/scheduled.ts.hbs with scheduled worker template
- [x] T079 [P] [US3] Create turbo/generators/templates/worker/src/types.ts.hbs template
- [x] T080 [P] [US3] Create turbo/generators/templates/worker/test/index.test.ts.hbs template
- [x] T081 [P] [US3] Create turbo/generators/templates/worker/README.md.hbs template
- [x] T082 [P] [US3] Create turbo/generators/templates/worker/.env.example.hbs template
- [x] T083 [US3] Implement generator prompts in turbo/generators/config.ts (name, type, bindings)
- [x] T084 [US3] Implement generator actions in turbo/generators/config.ts (file generation logic)
- [x] T085 [US3] Implement generator validation in turbo/generators/config.ts (name uniqueness check)
- [x] T086 [US3] Implement conditional file generation based on worker type
- [x] T087 [US3] Implement conditional dependency injection based on bindings
- [x] T088 [US3] Add post-generation actions (type check, lint check)
- [x] T089 [US3] Create turbo/generators/README.md documenting generator usage

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently

---

## Phase 6: User Story 4 - Configure Project-Specific Database (Priority: P4)

**Goal**: Provide flexible database package supporting both PostgreSQL and Cloudflare D1

**Independent Test**: Configure database for worker app, define schema, run migrations, verify type-safe queries work

### Tests for User Story 4 (MANDATORY - Constitution Principle II) ⚠️

- [x] T090 [P] [US4] Create packages/db/test/schema.test.ts validating schema definitions
- [x] T091 [P] [US4] Create packages/db/test/client.test.ts validating client factory functions
- [ ] T092 [P] [US4] Create packages/db/test/migrations.test.ts validating migration generation
- [ ] T093 [P] [US4] Create tests/integration/database-integration.test.ts validating DB usage in workers

### Implementation for User Story 4

- [x] T094 [P] [US4] Create packages/db/package.json with Drizzle dependencies and scripts
- [x] T095 [P] [US4] Create packages/db/tsconfig.json extending tsconfig/base.json
- [x] T096 [P] [US4] Create packages/db/drizzle.config.postgres.ts with PostgreSQL configuration
- [x] T097 [P] [US4] Create packages/db/drizzle.config.d1.ts with D1 configuration
- [x] T098 [P] [US4] Create packages/db/src/schema/shared.ts with cross-database schemas
- [x] T099 [P] [US4] Create packages/db/src/schema/postgres.ts with PostgreSQL-specific schemas
- [x] T100 [P] [US4] Create packages/db/src/schema/sqlite.ts with D1/SQLite-specific schemas
- [x] T101 [P] [US4] Create packages/db/src/schema/index.ts exporting all schemas
- [x] T102 [P] [US4] Create packages/db/src/client/postgres.ts with PostgreSQL client setup
- [x] T103 [P] [US4] Create packages/db/src/client/d1.ts with D1 client factory
- [x] T104 [P] [US4] Create packages/db/src/client/index.ts exporting client factories
- [x] T105 [P] [US4] Create packages/db/src/index.ts as main package export
- [x] T106 [P] [US4] Create packages/db/vitest.config.ts for database tests
- [x] T107 [P] [US4] Create packages/db/README.md documenting database setup and usage
- [x] T108 [US4] Update apps/example-worker/package.json to include @repo/db dependency
- [x] T109 [US4] Update apps/example-worker/wrangler.toml with D1 binding configuration
- [x] T110 [US4] Create apps/example-worker/src/db/client.ts initializing database client
- [x] T111 [US4] Update apps/example-worker/src/routes/index.ts with database query examples
- [ ] T112 [US4] Create apps/example-worker/test/db.test.ts validating database operations
- [ ] T113 [US4] Update turbo/generators/templates/worker to include optional DB setup
- [ ] T114 [US4] Update turbo/generators/config.ts to add database prompt option

**Checkpoint**: All user stories should now be independently functional

---

## Phase 7: Optional - Nuxt.js Example Application

**Purpose**: Provide optional Nuxt.js example for web frontends

- [ ] T115 [P] Create apps/example-nuxt/package.json with Nuxt dependencies
- [ ] T116 [P] Create apps/example-nuxt/nuxt.config.ts with Cloudflare Pages preset
- [ ] T117 [P] Create apps/example-nuxt/tsconfig.json extending tsconfig/nuxt.json
- [ ] T118 [P] Create apps/example-nuxt/app.vue with example page
- [ ] T119 [P] Create apps/example-nuxt/pages/index.vue with homepage
- [ ] T120 [P] Create apps/example-nuxt/composables/useApi.ts demonstrating shared types
- [ ] T121 [P] Create apps/example-nuxt/vitest.config.ts for component tests
- [ ] T122 [P] Create apps/example-nuxt/test/pages/index.test.ts
- [ ] T123 [P] Create apps/example-nuxt/.env.example
- [ ] T124 [P] Create apps/example-nuxt/README.md

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final quality checks

- [x] T125 [P] Create .github/workflows/ci.yml with build, test, lint jobs
- [x] T126 [P] Create .github/workflows/pr.yml with changeset validation
- [x] T127 [P] Create .vscode/settings.json with recommended editor settings
- [x] T128 [P] Create .vscode/extensions.json recommending ESLint, Prettier, etc
- [x] T129 [P] Create CONTRIBUTING.md with contribution guidelines
- [x] T130 [P] Update root README.md with comprehensive usage documentation
- [x] T131 [P] Create docs/ARCHITECTURE.md explaining template structure
- [x] T132 [P] Create docs/GENERATOR.md documenting generator usage
- [ ] T133 [P] Create docs/DATABASE.md documenting database package
- [x] T134 [P] Create docs/DEPLOYMENT.md with deployment instructions
- [x] T135 Run full build pipeline validation across all packages
- [x] T136 Run linting validation across all packages
- [x] T137 Run type checking validation across all packages
- [x] T138 Run all test suites and verify 100% pass rate
- [x] T139 Validate generator produces working apps for all worker types

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4)
- **Optional Nuxt (Phase 7)**: Can proceed anytime after Foundational, independent of user stories
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Integrates with US1 but independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Uses US1 structure but independently testable
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - May integrate with US1-3 but independently testable

### Within Each User Story

- Tests (MANDATORY) MUST be written and FAIL before implementation
- Configuration packages before applications
- Package exports before package consumers
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- All package creation tasks within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together (MANDATORY per constitution):
Task: "Contract test for monorepo structure in tests/integration/monorepo-structure.test.ts"
Task: "Contract test for workspace config in tests/integration/workspace-config.test.ts"
Task: "Contract test for build pipeline in tests/integration/build-pipeline.test.ts"

# Launch all package creation tasks together:
Task: "Create packages/shared-types/package.json"
Task: "Create packages/shared-types/tsconfig.json"
Task: "Create packages/shared-types/src/index.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
   - Clone fresh copy of template
   - Run pnpm install
   - Run pnpm build
   - Run pnpm test
   - Run pnpm lint
   - Verify all pass within performance targets
5. Template is now usable as MVP!

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready (T001-T033)
2. Add User Story 1 → Test independently → MVP ready! (T034-T057)
3. Add User Story 2 → Test independently → Type sharing enabled (T058-T068)
4. Add User Story 3 → Test independently → Generator available (T069-T089)
5. Add User Story 4 → Test independently → Database support added (T090-T114)
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T033)
2. Once Foundational is done:
   - Developer A: User Story 1 (T034-T057)
   - Developer B: User Story 2 (T058-T068) - starts after US1 basics
   - Developer C: User Story 3 (T069-T089) - starts after US1 basics
   - Developer D: User Story 4 (T090-T114) - starts after US1 basics
3. Stories complete and integrate independently

---

## Task Count Summary

- **Phase 1 (Setup)**: 8 tasks
- **Phase 2 (Foundational)**: 25 tasks (T009-T033) - BLOCKING
- **Phase 3 (US1 - MVP)**: 24 tasks (T034-T057) - CRITICAL PATH
- **Phase 4 (US2)**: 11 tasks (T058-T068)
- **Phase 5 (US3)**: 21 tasks (T069-T089)
- **Phase 6 (US4)**: 25 tasks (T090-T114)
- **Phase 7 (Optional Nuxt)**: 10 tasks (T115-T124)
- **Phase 8 (Polish)**: 19 tasks (T125-T143)

**Total Tasks**: 143
**MVP Scope**: T001-T057 (57 tasks)
**Full Feature**: All 143 tasks

---

## Validation Checklist

### Format Validation ✅

- [x] All tasks follow `- [ ] [ID] [P?] [Story?] Description` format
- [x] All task IDs are sequential (T001-T143)
- [x] All parallelizable tasks marked with [P]
- [x] All user story tasks marked with [Story] label
- [x] All descriptions include file paths where applicable
- [x] No tasks missing required format components

### Organization Validation ✅

- [x] Tasks organized by user story
- [x] Each user story has independent test criteria
- [x] Foundational phase clearly marked as blocking
- [x] Dependencies section shows story completion order
- [x] Parallel opportunities identified and documented
- [x] MVP scope clearly defined (User Story 1)

### Constitution Compliance ✅

- [x] Test tasks included for all user stories (MANDATORY)
- [x] Test-first workflow enforced (tests before implementation)
- [x] 2-space indentation in all configuration files
- [x] Trailing commas enforced via Prettier config
- [x] Strict TypeScript configuration
- [x] Performance targets specified in validation tasks
- [x] All packages have test coverage

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Tests are MANDATORY per constitution and must be written FIRST
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Template can be released after US1 (MVP) or wait for full feature set
