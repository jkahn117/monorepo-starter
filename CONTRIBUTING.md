# Contributing to Cloudflare Monorepo Template

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to this template.

## Code of Conduct

Be respectful, constructive, and professional in all interactions. We're all here to build great software together.

## Getting Started

### Prerequisites

- **Node.js**: 20+ LTS
- **pnpm**: 8.14+ (`npm install -g pnpm`)
- **Git**: Latest stable version

### Initial Setup

```bash
# Clone the repository
git clone <your-fork-url>
cd cloudflare-monorepo-template

# Install dependencies
pnpm install

# Run tests to verify setup
pnpm test

# Run linting
pnpm lint
```

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### Branch Naming Convention

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions or modifications
- `chore/` - Maintenance tasks

### 2. Make Your Changes

- Write clean, readable code
- Follow the existing code style (enforced by ESLint and Prettier)
- Add tests for new functionality
- Update documentation as needed

### 3. Test Your Changes

```bash
# Run all tests
pnpm test

# Run tests for a specific package
pnpm --filter @repo/shared-types test

# Run linting
pnpm lint

# Run type checking
pnpm typecheck

# Run build
pnpm build
```

### 4. Commit Your Changes

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat: add new worker template"
git commit -m "fix: resolve type inference issue"
git commit -m "docs: update database setup guide"
```

**Commit Message Format:**

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Test additions or modifications
- `build`: Build system changes
- `ci`: CI/CD changes
- `chore`: Maintenance tasks

**Example:**

```
feat(shared-types): add worker environment types

Add comprehensive TypeScript types for Cloudflare Workers
environment bindings including KV, R2, and D1.

Closes #123
```

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a pull request on GitHub.

## Code Standards

### TypeScript

- Use **strict mode** (no implicit any)
- Prefer `interface` over `type` for object shapes
- Export types explicitly
- Add JSDoc comments for public APIs
- Use 2-space indentation (enforced by Prettier)
- Use trailing commas (enforced by Prettier)

### File Organization

```
apps/
  example-worker/
    src/
      index.ts          # Main entry point
      types.ts          # Local types
      handlers/         # Route handlers
    test/               # Tests
    package.json
    wrangler.toml

packages/
  shared-types/
    src/
      index.ts          # Main exports
      api.ts            # API types
      *.ts              # Other type modules
    test/               # Tests
    package.json
```

### Testing

- Write tests for all new features
- Aim for high test coverage
- Use Vitest for unit and integration tests
- Place tests in `test/` directory
- Name test files `*.test.ts`

```typescript
import { describe, it, expect } from "vitest";

describe("Feature Name", () => {
  it("should do something", () => {
    expect(true).toBe(true);
  });
});
```

### Documentation

- Update README.md for significant changes
- Add JSDoc comments for public APIs
- Include usage examples
- Document breaking changes
- Update CHANGELOG.md

## Pull Request Process

### Before Submitting

- [ ] Tests pass locally (`pnpm test`)
- [ ] Linting passes (`pnpm lint`)
- [ ] Type checking passes (`pnpm typecheck`)
- [ ] Build succeeds (`pnpm build`)
- [ ] Documentation is updated
- [ ] Commit messages follow conventions

### PR Title Format

Follow conventional commits format:

```
feat: add worker environment types
fix: resolve database connection issue
docs: update deployment guide
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How has this been tested?

## Checklist
- [ ] Code follows project style
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

### Review Process

1. Automated checks must pass (CI/CD)
2. At least one approval required
3. No unresolved conversations
4. Branch must be up to date with main

## Project Structure

### Packages

- **`@repo/shared-types`**: Shared TypeScript types
- **`@repo/db`**: Database package with Drizzle ORM
- **`@repo/eslint-config`**: Shared ESLint configuration
- **`@repo/prettier-config`**: Shared Prettier configuration
- **`@repo/tsconfig`**: Shared TypeScript configuration

### Apps

- **`example-worker`**: Example Cloudflare Worker application

## Common Tasks

### Adding a New Package

```bash
# Create package directory
mkdir -p packages/your-package

# Create package.json
cd packages/your-package
pnpm init

# Update workspace
cd ../..
pnpm install
```

### Adding a New Worker App

```bash
# Create app directory
mkdir -p apps/your-worker

# Copy from example-worker as template
cp -r apps/example-worker/* apps/your-worker/

# Update package.json name
# Update wrangler.toml configuration
```

### Running a Specific Package

```bash
# Run tests for one package
pnpm --filter @repo/shared-types test

# Run dev for one app
pnpm --filter @repo/example-worker dev

# Build one package
pnpm --filter @repo/db build
```

## Debugging

### Common Issues

**Problem**: Tests failing locally
```bash
# Clear caches and reinstall
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

**Problem**: Type errors
```bash
# Rebuild packages
pnpm build

# Check TypeScript version
pnpm list typescript
```

**Problem**: Linting errors
```bash
# Auto-fix linting issues
pnpm lint --fix
```

## Getting Help

- Check [documentation](./docs/)
- Search [existing issues](../../issues)
- Ask in [discussions](../../discussions)
- Join our community chat (if available)

## Release Process

(For maintainers)

1. Update version numbers
2. Update CHANGELOG.md
3. Create release commit
4. Tag release
5. Push to GitHub
6. CI/CD handles publishing

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

Feel free to open an issue or discussion if you have questions about contributing!
