# Changelog

All notable changes to the `@repo/shared-types` package will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Database types in `database.ts` for database configuration and operations
- Worker types in `worker.ts` for Cloudflare Workers environment bindings
- Event types in `events.ts` for event-driven architectures
- Comprehensive test suite for type imports and inference
- Integration tests for cross-package type sharing
- Complete README documentation

### Changed
- Expanded `index.ts` to export all new type modules

## [1.0.0] - 2025-12-18

### Added
- Initial release with API types (`api.ts`)
- Common utility types (`common.ts`)
- Core type exports through `index.ts`
- Basic test coverage
- Package configuration with TypeScript and Vitest

### Types Included
- `ApiResponse<T>`: Generic API response wrapper
- `ErrorResponse`: Standard error format
- `HealthCheckResponse`: Health check endpoint response
- `PaginatedResponse<T>`: Paginated list responses
- `Nullable<T>`: Nullable type utility
- `WithId<T>`: Add ID field utility
- `WithTimestamps<T>`: Add timestamp fields utility
- `DeepPartial<T>`: Deep partial utility
- `DeepReadonly<T>`: Deep readonly utility

## Guidelines for Updates

When adding or modifying types:

1. **Breaking Changes**: Bump major version
   - Removing exported types
   - Changing existing type signatures incompatibly
   - Renaming exported types

2. **New Features**: Bump minor version
   - Adding new type exports
   - Adding optional properties to existing types
   - New utility type helpers

3. **Bug Fixes**: Bump patch version
   - Fixing type inference issues
   - Documentation corrections
   - Internal refactoring without API changes

4. **Documentation**: Always update
   - Add JSDoc comments for new types
   - Update README.md with usage examples
   - Document breaking changes clearly
