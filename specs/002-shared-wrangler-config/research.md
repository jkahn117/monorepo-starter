# Research: Shared Wrangler Configuration

**Feature**: 002-shared-wrangler-config  
**Date**: 2025-12-19  
**Status**: Complete

## Overview

This document consolidates research findings for implementing a shared Cloudflare Workers configuration system in a PNPM/Turborepo monorepo. The research focuses on five key decision areas identified in the implementation plan.

---

## Decision 1: Configuration Format Strategy

### Research Question
How should we support both wrangler.toml and wrangler.jsonc while maintaining a single source of truth?

### Options Evaluated

#### Option A: Generate files at build time (RECOMMENDED)
**Approach**: Use TypeScript configuration files (`wrangler.config.ts`) that are compiled to wrangler.toml/jsonc during build.

**Pros**:
- Single source of truth in TypeScript
- Type safety and IDE autocomplete
- Build-time validation catches errors early
- No runtime overhead
- Clean separation of configuration logic from output format

**Cons**:
- Requires build step before `wrangler dev`
- Developers must understand the generation process

**Precedent**: Similar to how `tsconfig.json` and Vite config work

#### Option B: Runtime resolution
**Approach**: Parse wrangler.toml/jsonc at runtime and merge with shared configuration.

**Pros**:
- No build step needed
- Simpler for developers to understand

**Cons**:
- Runtime overhead on every wrangler command
- Complex merge logic in production
- Harder to validate configuration
- Can't leverage TypeScript's type system

#### Option C: Template-based generation
**Approach**: Use Handlebars/mustache templates with variable substitution.

**Pros**:
- Familiar pattern for many developers
- Simple variable replacement

**Cons**:
- No type safety
- Limited composition capabilities
- Complex conditionals are difficult
- No validation until wrangler runs

### Decision

**CHOSEN: Option A - Build-time generation with TypeScript**

**Rationale**:
1. **Type Safety**: Leverages TypeScript's type system for configuration validation
2. **Developer Experience**: IDE autocomplete and inline documentation
3. **Early Error Detection**: Validation happens at build time, not deployment time
4. **Composability**: TypeScript functions enable powerful configuration composition
5. **Performance**: Zero runtime overhead; configuration is pre-computed
6. **Existing Patterns**: Aligns with how tsconfig.json and other build tools work in the ecosystem

**Implementation Approach**:
- Create `wrangler.config.ts` files in each worker directory
- Add a `config:generate` script that runs before `build` and `dev` tasks
- Use Turborepo task dependencies to ensure config generation runs first
- Cache generation results in Turborepo for performance

---

## Decision 2: Configuration Inheritance Patterns

### Research Question
What's the best way to implement configuration inheritance and overriding in TypeScript?

### Options Evaluated

#### Option A: Function composition with spreads (RECOMMENDED)
**Approach**: Use TypeScript functions that return config objects, composed with object spreads.

```typescript
const base = defineConfig({ /* base config */ });
const worker = defineConfig({
  ...base,
  name: 'my-worker',
  bindings: [...base.bindings, d1Binding('DB', 'my-db')],
});
```

**Pros**:
- Native TypeScript, no dependencies
- Clear and explicit
- Type-safe
- Easy to debug

**Cons**:
- Manual array spreading for bindings
- Shallow merge by default

#### Option B: Deep merge with lodash
**Approach**: Use lodash.merge for deep object merging.

```typescript
import merge from 'lodash.merge';
const worker = merge({}, base, { name: 'my-worker' });
```

**Pros**:
- Deep merge out of the box
- Handles complex nested structures

**Cons**:
- External dependency (lodash)
- Merge behavior can be surprising
- Harder to type correctly
- Performance overhead

#### Option C: Builder pattern with method chaining
**Approach**: Use a builder class with chainable methods.

```typescript
const worker = new ConfigBuilder()
  .extend(baseConfig)
  .setName('my-worker')
  .addBinding(d1Binding('DB', 'my-db'))
  .build();
```

**Pros**:
- Fluent API
- Clear mutation points
- Easy to add validation at each step

**Cons**:
- More complex implementation
- Mutable state during building
- Verbose for simple configurations

### Decision

**CHOSEN: Option A - Function composition with spreads, enhanced with helper functions**

**Rationale**:
1. **Simplicity**: Native TypeScript with no dependencies
2. **Type Safety**: Full TypeScript inference works correctly
3. **Transparency**: Developers see exactly what's being merged
4. **Performance**: No runtime overhead
5. **Debugging**: Easy to inspect intermediate values

**Enhancement**: Provide helper functions for common merge patterns:

```typescript
// Helper for binding arrays
export function mergeBindings(...bindingSets: Binding[][]): Binding[] {
  return bindingSets.flat();
}

// Helper for environment overrides
export function applyEnvironment(base: Config, env: Partial<Config>): Config {
  return { ...base, ...env };
}
```

**Implementation Notes**:
- Document spreading patterns in README
- Provide examples for common inheritance scenarios
- Add utility functions for complex merges (binding arrays, environment profiles)
- Use TypeScript's `Partial<T>` for override types

---

## Decision 3: Environment Management Approach

### Research Question
How should environment-specific configuration be managed and applied?

### Options Evaluated

#### Option A: Profile-based with environment variable fallback (RECOMMENDED)
**Approach**: Define named environment profiles in config, with env var overrides.

```typescript
export default defineConfig({
  // Base config
  environments: {
    development: { accountId: 'dev-account' },
    production: { accountId: process.env.PROD_ACCOUNT_ID },
  },
});
```

**Pros**:
- Clear, declarative environments
- Can commit safe defaults
- Environment variables for secrets
- Easy to test (mock env vars)

**Cons**:
- Need to manage both profiles and env vars

#### Option B: Pure environment variables
**Approach**: All environment-specific values come from env vars.

```typescript
export default defineConfig({
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
  bindings: [d1Binding('DB', process.env.DB_ID)],
});
```

**Pros**:
- Follows 12-factor app principles
- Secrets never in code
- Simple mental model

**Cons**:
- Requires many environment variables
- No defaults; harder to test
- Must set env vars for every environment

#### Option C: Separate config files per environment
**Approach**: `wrangler.config.dev.ts`, `wrangler.config.prod.ts`, etc.

**Pros**:
- Complete isolation between environments
- No conditional logic

**Cons**:
- Configuration duplication
- Hard to share common settings
- More files to maintain

### Decision

**CHOSEN: Option A - Profile-based with environment variable fallback**

**Rationale**:
1. **Flexibility**: Supports both committed defaults and secret env vars
2. **Testability**: Can test with mock profiles without environment variables
3. **DX**: Developers can see available environments in code
4. **Safety**: Secrets go in env vars, safe defaults in profiles
5. **Documentation**: Environment profiles serve as documentation

**Implementation Approach**:

```typescript
// Profile definition
export const environments = {
  development: defineEnvironment('development', {
    accountId: 'dev-account-123',
    bindings: [
      d1Binding('DB', 'my-db-dev', 'dev-db-id'),
    ],
  }),
  staging: defineEnvironment('staging', {
    accountId: process.env.STAGING_ACCOUNT_ID || 'staging-account-123',
    bindings: [
      d1Binding('DB', 'my-db-staging', process.env.STAGING_DB_ID),
    ],
  }),
  production: defineEnvironment('production', {
    accountId: process.env.PROD_ACCOUNT_ID, // Must be set
    bindings: [
      d1Binding('DB', 'my-db-prod', process.env.PROD_DB_ID),
    ],
  }),
};

// Usage
export default defineConfig({
  name: 'my-worker',
  ...baseConfig,
  environments: Object.values(environments),
});
```

**Environment Variable Convention**:
- Prefix with `CF_` or `CLOUDFLARE_` for clarity
- Use `_DEV`, `_STAGING`, `_PROD` suffixes for environment-specific values
- Require production secrets to be set (fail build if missing)

---

## Decision 4: Validation Strategy

### Research Question
What's the best approach for validating configuration before deployment?

### Options Evaluated

#### Option A: Zod schemas (RECOMMENDED)
**Approach**: Use Zod for TypeScript-first schema validation.

```typescript
import { z } from 'zod';

const ConfigSchema = z.object({
  name: z.string().min(1),
  accountId: z.string().uuid(),
  bindings: z.array(BindingSchema),
});
```

**Pros**:
- TypeScript-first design
- Excellent error messages
- Type inference from schema
- Composable schemas
- Active development, good docs

**Cons**:
- Additional dependency (~100KB)
- Learning curve for complex schemas

#### Option B: JSON Schema with AJV
**Approach**: Define JSON Schema, validate with AJV.

**Pros**:
- Standard format
- Fast validation
- Good ecosystem

**Cons**:
- No TypeScript integration
- Separate type definitions
- More verbose schemas

#### Option C: Custom validation functions
**Approach**: Write validation functions with TypeScript types.

```typescript
function validateConfig(config: WranglerConfig): ValidationResult {
  const errors = [];
  if (!config.name) errors.push('name is required');
  return { valid: errors.length === 0, errors };
}
```

**Pros**:
- No dependencies
- Full control
- Simple for basic validation

**Cons**:
- Repetitive code
- No schema reuse
- Hard to maintain as complexity grows

### Decision

**CHOSEN: Option A - Zod schemas**

**Rationale**:
1. **TypeScript Integration**: Schemas can generate TypeScript types
2. **Error Messages**: Clear, actionable error messages out of the box
3. **Composition**: Easy to compose schemas for complex configurations
4. **Ecosystem**: Well-maintained, widely adopted in TypeScript projects
5. **Developer Experience**: Autocomplete and type checking from schemas

**Implementation Approach**:

```typescript
// Define schemas
const D1BindingSchema = z.object({
  type: z.literal('d1'),
  binding: z.string().min(1),
  database_name: z.string().min(1),
  database_id: z.string().min(1),
});

const WranglerConfigSchema = z.object({
  name: z.string().min(1).max(64),
  main: z.string().endsWith('.ts').or(z.string().endsWith('.js')),
  accountId: z.string().uuid().optional(),
  compatibility_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  bindings: z.array(z.union([
    D1BindingSchema,
    KVBindingSchema,
    R2BindingSchema,
    // ... other binding types
  ])),
});

// Infer types from schemas
export type WranglerConfig = z.infer<typeof WranglerConfigSchema>;

// Validation function
export function validateConfig(config: unknown): ValidationResult {
  const result = WranglerConfigSchema.safeParse(config);
  return {
    valid: result.success,
    errors: result.success ? [] : result.error.issues,
    warnings: checkWarnings(config), // Custom warnings
  };
}
```

**Validation Timing**:
- Run during config generation (build time)
- Run in pre-deploy hooks
- Run in CI/CD pipeline
- Optional: Run in IDE (via LSP extension)

---

## Decision 5: Build Integration

### Research Question
How should configuration generation integrate with the Turborepo build pipeline?

### Options Evaluated

#### Option A: Pre-build Turborepo task (RECOMMENDED)
**Approach**: Define `config:generate` task that runs before `build` and `dev`.

```json
// turbo.json
{
  "tasks": {
    "config:generate": {
      "outputs": ["wrangler.toml", "wrangler.jsonc"],
      "cache": true
    },
    "build": {
      "dependsOn": ["config:generate"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "dependsOn": ["config:generate"],
      "cache": false,
      "persistent": true
    }
  }
}
```

**Pros**:
- Explicit in task graph
- Turborepo caching benefits
- Clear dependency order
- Parallel execution when possible

**Cons**:
- Requires understanding Turborepo tasks

#### Option B: Pre-script hooks
**Approach**: Use npm `predev` and `prebuild` scripts.

```json
// package.json
{
  "scripts": {
    "predev": "node generate-config.js",
    "dev": "wrangler dev"
  }
}
```

**Pros**:
- Standard npm pattern
- No Turborepo-specific knowledge needed

**Cons**:
- No caching
- Sequential execution
- Hidden dependencies

#### Option C: Watch mode generation
**Approach**: Run config generation in watch mode during development.

**Pros**:
- Immediate feedback on config changes

**Cons**:
- Complex setup
- Resource overhead
- May not work well with wrangler dev

### Decision

**CHOSEN: Option A - Pre-build Turborepo task**

**Rationale**:
1. **Caching**: Turborepo can cache config generation results
2. **Explicit**: Dependency graph is visible and documented
3. **Parallel**: Config generation can run in parallel for multiple workers
4. **Consistent**: Aligns with monorepo build patterns
5. **Performance**: Cache hits avoid redundant generation

**Implementation**:

1. Add task to turbo.json:
```json
{
  "tasks": {
    "config:generate": {
      "cache": true,
      "outputs": ["wrangler.toml"],
      "inputs": ["wrangler.config.ts", "../../packages/wrangler-config/**"]
    }
  }
}
```

2. Add script to worker package.json:
```json
{
  "scripts": {
    "config:generate": "tsx wrangler.config.ts"
  }
}
```

3. Update build and dev tasks:
```json
{
  "build": {
    "dependsOn": ["^build", "config:generate"],
    "outputs": ["dist/**"]
  },
  "dev": {
    "dependsOn": ["config:generate"],
    "cache": false,
    "persistent": true
  }
}
```

---

## Alternatives Considered

### Alternative: CLI Tool Approach
Create a CLI tool (`wrangler-config`) that manages configuration.

**Rejected because**:
- Adds another tool to learn
- Separates configuration from worker code
- Harder to integrate with build pipeline
- Less flexibility than programmatic API

### Alternative: Wrangler Plugin System
Wait for Wrangler to add official plugin support for configuration.

**Rejected because**:
- Wrangler plugin API is not stable/released
- Need solution now
- May not provide needed level of control
- Unknown timeline for official support

### Alternative: Monorepo-wide Configuration File
Single configuration file for all workers.

**Rejected because**:
- Doesn't allow per-worker customization
- Makes incremental adoption impossible
- Tight coupling between workers
- Harder to test individual workers

---

## Dependencies Justification

### @ltd/j-toml (Required)
- **Purpose**: Parse and serialize TOML format
- **Size**: ~50KB
- **Alternatives**: toml (older), @iarna/toml (unmaintained)
- **Justification**: Most actively maintained TOML library, best TypeScript support

### jsonc-parser (Required)
- **Purpose**: Parse and serialize JSONC (JSON with comments)
- **Size**: ~20KB
- **Alternatives**: json5 (different format), comment-json (less maintained)
- **Justification**: Official VS Code JSONC parser, handles comments correctly

### zod (Required)
- **Purpose**: Schema validation with TypeScript integration
- **Size**: ~100KB
- **Alternatives**: yup, joi, AJV + typebox
- **Justification**: Best TypeScript integration, excellent DX, widely adopted

### tsx (Dev only)
- **Purpose**: Execute TypeScript config files
- **Size**: N/A (dev dependency)
- **Justification**: Simplest way to run wrangler.config.ts files

---

## Performance Considerations

### Benchmarks (Expected)

| Operation | Target | Measured |
|-----------|--------|----------|
| Config validation | <100ms | TBD |
| TOML generation | <50ms | TBD |
| Full config generation | <500ms | TBD |
| Turborepo cache hit | <10ms | TBD |

### Optimization Strategies

1. **Lazy Loading**: Only load validation schemas when needed
2. **Caching**: Use Turborepo caching for generated files
3. **Parallel Generation**: Generate configs for multiple workers in parallel
4. **Schema Compilation**: Pre-compile Zod schemas
5. **Minimal Dependencies**: Keep runtime dependencies minimal

---

## Migration Strategy

### Phase 1: Create Package (Week 1)
- Build @repo/wrangler-config package
- Add tests and documentation
- Publish to monorepo

### Phase 2: Migrate Example Worker (Week 2)
- Add wrangler.config.ts to example-worker
- Generate wrangler.toml at build time
- Verify deployment works

### Phase 3: Update Generator (Week 2)
- Update turbo generator templates
- New workers use shared config by default

### Phase 4: Documentation & Training (Week 3)
- Write migration guide
- Update monorepo documentation
- Team training session

### Phase 5: Gradual Migration (Ongoing)
- Workers migrate as they're updated
- No forced migration
- Old and new patterns coexist

---

## Risks & Mitigations

### Risk: Wrangler Format Changes
**Likelihood**: Medium  
**Impact**: High  
**Mitigation**: 
- Maintain contract tests against wrangler
- Version lock wrangler CLI in package.json
- Monitor Cloudflare Workers changelog
- Keep compatibility matrix updated

### Risk: Performance Overhead
**Likelihood**: Low  
**Impact**: Medium  
**Mitigation**:
- Benchmark all operations
- Use Turborepo caching aggressively
- Profile and optimize hot paths
- Consider lazy loading for validation

### Risk: Complex Merge Bugs
**Likelihood**: Medium  
**Impact**: High  
**Mitigation**:
- Comprehensive test coverage (>90%)
- Visual diff testing for generated configs
- Strict TypeScript types prevent many bugs
- Clear documentation on merge behavior

---

## Conclusion

The research supports building a TypeScript-based configuration package that generates wrangler.toml/jsonc files at build time. This approach provides:

- **Type Safety**: Full TypeScript support
- **Reusability**: Shared configuration across workers
- **Repeatability**: Consistent pattern for all workers
- **Validation**: Early error detection with Zod
- **Performance**: Build-time generation with caching

All decisions have been made with justification, and the approach is ready for implementation.

**Status**: ✅ Ready for Phase 1 (Design Artifacts)
