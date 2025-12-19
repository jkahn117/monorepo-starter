# Feature Specification: Shared Wrangler Configuration

**Feature Branch**: `002-shared-wrangler-config`  
**Created**: 2025-12-19  
**Status**: Draft  
**Input**: User description: "Cloudflare configuration (wrangler.jsonc or wrangler.toml) need to be included wherever Cloudflare bindings will be used (e.g., multiple workers, frontend apps, db package). We need an approach to easily keep that configuration up-to-date and consistent across these spaces"

## Clarifications

### Session 2025-12-19

- Q: How should the shared configuration system handle Wrangler's `typegen` for inter-worker RPC type safety? → A: Shared configuration includes `typegen` settings and automatically generates type definitions for service bindings, stored in shared types location
- Q: How should the configuration system discover which workers expose RPC interfaces to generate types for? → A: Workers explicitly declare in their config which RPC interfaces they expose, build system generates types automatically
- Q: When should RPC type generation occur in the build pipeline? → A: Types generate before worker builds in dedicated Turborepo task with dependency ordering
- Q: How should the system handle breaking changes in RPC interface types between workers? → A: Validation warnings when types change, build failures only for type mismatches, with versioning guidance
- Q: Where should generated RPC worker types be stored? → A: Store in `packages/wrangler-config/generated-types/[worker-name]/` centralized location

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Centralized Configuration Source (Priority: P1)

As a developer, I need a single source of truth for Cloudflare configuration so that I don't have to manually sync settings across multiple workers and applications.

**Why this priority**: This is the foundation for all configuration management. Without a centralized source, developers must manually copy-paste configuration between projects, leading to inconsistencies and deployment errors.

**Independent Test**: Create a shared configuration package, reference it from two different workers, verify both workers have identical Cloudflare binding configurations without duplication.

**Acceptance Scenarios**:

1. **Given** a monorepo with multiple workers, **When** I define Cloudflare account settings in the shared configuration, **Then** all workers inherit those settings automatically
2. **Given** a new binding is added to shared configuration, **When** I reference it in a worker, **Then** the worker receives the binding configuration without manual copying
3. **Given** shared configuration is updated, **When** I rebuild affected workers, **Then** all workers reflect the updated configuration

---

### User Story 2 - Per-Application Configuration Overrides (Priority: P2)

As a developer, I need to override specific configuration values for individual workers while keeping shared defaults, so that each application can customize its Cloudflare settings without breaking from the standard configuration.

**Why this priority**: Different workers may need different account IDs, environment-specific bindings, or unique worker names while sharing common patterns. This prevents configuration rigidity while maintaining consistency.

**Independent Test**: Define a shared base configuration, create a worker that overrides the worker name and adds a custom binding, verify the worker uses both shared and custom settings correctly.

**Acceptance Scenarios**:

1. **Given** a shared configuration with default account settings, **When** a worker specifies its own account ID, **Then** the worker uses its custom account ID while inheriting other shared settings
2. **Given** shared configuration defines common bindings, **When** a worker adds application-specific bindings, **Then** the worker has access to both shared and custom bindings
3. **Given** shared configuration changes, **When** a worker has overridden values, **Then** only non-overridden values are updated

---

### User Story 3 - Environment-Specific Configuration (Priority: P3)

As a developer, I need to manage different Cloudflare configurations for development, staging, and production environments so that workers can be deployed to multiple environments with appropriate settings.

**Why this priority**: Production deployments require different account IDs, binding IDs, and security settings than development. This enables safe testing and progressive deployment.

**Independent Test**: Configure shared environment definitions (dev, staging, prod), deploy the same worker to two different environments, verify each deployment uses environment-appropriate configuration.

**Acceptance Scenarios**:

1. **Given** environment-specific configurations are defined, **When** I deploy a worker to development, **Then** it uses development account IDs and binding IDs
2. **Given** environment-specific configurations are defined, **When** I deploy the same worker to production, **Then** it uses production account IDs and binding IDs without code changes
3. **Given** a worker is deployed to multiple environments, **When** I update shared environment configuration, **Then** all environments receive the update on next deployment

---

### User Story 4 - Configuration Validation (Priority: P4)

As a developer, I need configuration validation that warns me when required Cloudflare settings are missing or invalid, so that I catch configuration errors before deployment.

**Why this priority**: Configuration errors often cause deployment failures or runtime errors. Early validation saves time and prevents production incidents.

**Independent Test**: Create a worker with missing required configuration, run validation, verify it reports specific missing values with helpful error messages.

**Acceptance Scenarios**:

1. **Given** a worker missing account ID, **When** I run configuration validation, **Then** I receive a clear error message identifying the missing account ID
2. **Given** a worker with invalid binding configuration, **When** I validate configuration, **Then** I receive an error describing what is invalid and how to fix it
3. **Given** a worker with complete valid configuration, **When** I run validation, **Then** validation passes with no errors

---

### User Story 5 - RPC Type Safety (Priority: P2)

As a developer, I need TypeScript type definitions automatically generated for workers that expose RPC interfaces, so that consuming workers have full type safety when calling remote procedures.

**Why this priority**: Inter-worker RPC calls without type safety lead to runtime errors that could be caught at compile time. Automatic type generation ensures type safety across worker boundaries without manual type maintenance.

**Independent Test**: Create Worker B that exposes an RPC interface, configure Worker A to call Worker B via service binding, verify Worker A has full TypeScript autocomplete and type checking for Worker B's methods.

**Acceptance Scenarios**:

1. **Given** Worker B declares it exposes an RPC interface in its configuration, **When** the build runs, **Then** TypeScript type definitions are automatically generated and stored in the centralized types location
2. **Given** Worker A has a service binding to Worker B, **When** Worker A imports Worker B's types, **Then** Worker A gets full type safety and IDE autocomplete for Worker B's RPC methods
3. **Given** Worker B's RPC interface changes, **When** Worker A rebuilds, **Then** Worker A receives validation warnings about type changes and build errors only if actual type mismatches exist

---

### Edge Cases

- What happens when a worker overrides a shared configuration value that later gets removed from the shared configuration?
- How does the system handle configuration conflicts when multiple shared configuration sources are referenced?
- What happens when environment-specific configuration is missing for a particular environment?
- How are circular dependencies in configuration inheritance detected and prevented?
- What happens when a worker references a binding defined in shared configuration but doesn't include it in its own configuration?
- How does the system handle version mismatches between shared configuration format and worker configuration format?
- What happens when Worker A has a service binding to Worker B, but Worker B hasn't declared it exposes RPC types?
- How does the system handle stale generated types when a worker is deleted or renamed?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a centralized location for defining shared Cloudflare configuration values
- **FR-002**: System MUST allow workers to reference shared configuration without duplicating values
- **FR-003**: System MUST support configuration inheritance where workers can override specific shared values
- **FR-004**: System MUST support environment-specific configuration (development, staging, production)
- **FR-005**: System MUST merge shared configuration with worker-specific configuration at build time
- **FR-006**: System MUST validate configuration completeness before deployment
- **FR-007**: System MUST report clear error messages when required configuration values are missing
- **FR-008**: System MUST prevent circular dependencies in configuration references
- **FR-009**: System MUST support all Cloudflare binding types (D1, KV, R2, Durable Objects, Service Bindings)
- **FR-010**: System MUST preserve comments and formatting preferences in worker-specific configuration files
- **FR-011**: System MUST work with both wrangler.toml and wrangler.jsonc formats
- **FR-012**: System MUST allow selective inheritance where workers can opt-in to specific shared configurations
- **FR-013**: System MUST track which workers depend on which shared configuration values for impact analysis
- **FR-014**: System MUST support conditional configuration based on environment variables
- **FR-015**: System MUST provide clear documentation of available shared configuration values and usage patterns
- **FR-016**: System MUST integrate Wrangler's `typegen` command to generate TypeScript types for workers that expose RPC interfaces
- **FR-017**: System MUST allow workers to declare in their configuration whether they expose RPC interfaces for type generation
- **FR-018**: System MUST generate RPC types before worker builds in a dedicated Turborepo task with proper dependency ordering
- **FR-019**: System MUST store generated RPC types in `packages/wrangler-config/generated-types/[worker-name]/` for centralized access
- **FR-020**: System MUST emit validation warnings when RPC interface types change between workers
- **FR-021**: System MUST fail builds only when actual type mismatches exist in service binding calls, not for compatible changes
- **FR-022**: System MUST provide documentation and guidance on versioning RPC interfaces to avoid breaking changes

### Key Entities

- **Shared Configuration Package**: Centralized package containing reusable Cloudflare configuration values (account IDs, common bindings, environment defaults)
- **Worker Configuration**: Individual worker's wrangler.toml or wrangler.jsonc file that references and extends shared configuration
- **Environment Profile**: Set of environment-specific configuration values (development, staging, production) that override defaults
- **Configuration Override**: Specific values defined in worker configuration that take precedence over shared values
- **Binding Definition**: Cloudflare resource binding (D1, KV, R2, etc.) that can be defined in shared configuration and referenced by workers
- **RPC Type Definition**: Auto-generated TypeScript type definitions for workers that expose RPC interfaces, stored centrally and consumed by calling workers
- **Service Binding Declaration**: Configuration metadata indicating a worker exposes RPC methods and should have types generated

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Developers can add a new worker that inherits shared Cloudflare configuration in under 5 minutes without manually copying configuration values
- **SC-002**: Configuration updates to shared values automatically propagate to all dependent workers on next build
- **SC-003**: Configuration validation catches 100% of missing required values before deployment attempts
- **SC-004**: Workers with overridden configuration values can be deployed without affecting other workers using shared defaults
- **SC-005**: Configuration errors are detected within 30 seconds of build initiation with specific error messages
- **SC-006**: Developers can deploy the same worker to 3 different environments using a single command without modifying configuration files
- **SC-007**: Configuration changes that affect multiple workers are identified with a list of impacted applications
- **SC-008**: Zero deployment failures due to configuration inconsistencies between workers after shared configuration is adopted
- **SC-009**: Workers with service bindings get full TypeScript type safety for RPC calls without manual type definitions
- **SC-010**: RPC type generation completes within 10 seconds per worker and is cached by Turborepo for unchanged workers

## Assumptions

1. **Configuration Management Tool**: Assumes use of a configuration management approach compatible with PNPM workspace and Turborepo (may use package references, custom scripts, or configuration inheritance)
2. **Build-Time Resolution**: Assumes configuration is resolved at build time rather than runtime, allowing early validation
3. **File Format Compatibility**: Assumes both wrangler.toml and wrangler.jsonc are supported equally
4. **No Breaking Changes**: Assumes existing workers can gradually adopt shared configuration without requiring immediate migration
5. **Environment Naming**: Assumes standard environment names (development, staging, production) with flexibility for custom environments
6. **Monorepo Context**: Assumes this feature is designed for monorepo workflows with multiple workers and applications
7. **Cloudflare Account Access**: Assumes developers have access to Cloudflare dashboard for creating bindings and obtaining IDs
8. **Version Control**: Assumes configuration files are version controlled and changes are tracked through Git
9. **Wrangler Version**: Assumes Wrangler CLI 3.22.0+ which includes `wrangler types` command for type generation
10. **TypeScript Project**: Assumes all workers using RPC type safety are TypeScript-based projects
