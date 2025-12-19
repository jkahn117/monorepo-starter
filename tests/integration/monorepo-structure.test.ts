import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";

describe("Monorepo Structure", () => {
  const root = join(process.cwd());

  it("should have apps directory", () => {
    expect(existsSync(join(root, "apps"))).toBe(true);
  });

  it("should have packages directory", () => {
    expect(existsSync(join(root, "packages"))).toBe(true);
  });

  it("should have pnpm-workspace.yaml", () => {
    expect(existsSync(join(root, "pnpm-workspace.yaml"))).toBe(true);
  });

  it("should have turbo.json", () => {
    expect(existsSync(join(root, "turbo.json"))).toBe(true);
  });

  it("should have root package.json", () => {
    expect(existsSync(join(root, "package.json"))).toBe(true);
  });

  it("should have configuration packages", () => {
    expect(existsSync(join(root, "packages/prettier-config"))).toBe(true);
    expect(existsSync(join(root, "packages/eslint-config"))).toBe(true);
    expect(existsSync(join(root, "packages/tsconfig"))).toBe(true);
  });

  it("should have shared-types package", () => {
    expect(existsSync(join(root, "packages/shared-types"))).toBe(true);
  });

  it("should have example worker application", () => {
    expect(existsSync(join(root, "apps/example-worker"))).toBe(true);
  });
});
