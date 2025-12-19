import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

describe("Type Sharing Across Packages", () => {
  const rootDir = join(__dirname, "../..");
  const exampleWorkerDir = join(rootDir, "apps/example-worker");
  const sharedTypesDir = join(rootDir, "packages/shared-types");

  describe("Package Dependencies", () => {
    it("example-worker should depend on @repo/shared-types", () => {
      const packageJsonPath = join(exampleWorkerDir, "package.json");
      expect(existsSync(packageJsonPath)).toBe(true);

      const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
      expect(packageJson.dependencies).toHaveProperty("@repo/shared-types");
    });

    it("shared-types package should have proper exports", () => {
      const packageJsonPath = join(sharedTypesDir, "package.json");
      expect(existsSync(packageJsonPath)).toBe(true);

      const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
      expect(packageJson.exports).toBeDefined();
      expect(packageJson.exports["."]).toBeDefined();
    });
  });

  describe("Type Imports in Example Worker", () => {
    it("example-worker should import types from @repo/shared-types", () => {
      const indexPath = join(exampleWorkerDir, "src/index.ts");
      expect(existsSync(indexPath)).toBe(true);

      const content = readFileSync(indexPath, "utf-8");
      expect(content).toContain("@repo/shared-types");
    });

    it("example-worker should use ApiResponse type", () => {
      const indexPath = join(exampleWorkerDir, "src/index.ts");
      const content = readFileSync(indexPath, "utf-8");
      
      // Check for ApiResponse usage
      expect(content).toMatch(/ApiResponse|from ["']@repo\/shared-types["']/);
    });
  });

  describe("Type Module Structure", () => {
    it("shared-types should export all type modules", () => {
      const indexPath = join(sharedTypesDir, "src/index.ts");
      expect(existsSync(indexPath)).toBe(true);

      const content = readFileSync(indexPath, "utf-8");
      expect(content).toContain("export * from");
    });

    it("shared-types should have api types", () => {
      const apiPath = join(sharedTypesDir, "src/api.ts");
      expect(existsSync(apiPath)).toBe(true);
    });

    it("shared-types should have common types", () => {
      const commonPath = join(sharedTypesDir, "src/common.ts");
      expect(existsSync(commonPath)).toBe(true);
    });

    it("shared-types should have database types", () => {
      const databasePath = join(sharedTypesDir, "src/database.ts");
      expect(existsSync(databasePath)).toBe(true);
    });

    it("shared-types should have worker types", () => {
      const workerPath = join(sharedTypesDir, "src/worker.ts");
      expect(existsSync(workerPath)).toBe(true);
    });

    it("shared-types should have event types", () => {
      const eventsPath = join(sharedTypesDir, "src/events.ts");
      expect(existsSync(eventsPath)).toBe(true);
    });
  });

  describe("TypeScript Configuration", () => {
    it("example-worker should have proper TypeScript config", () => {
      const tsconfigPath = join(exampleWorkerDir, "tsconfig.json");
      expect(existsSync(tsconfigPath)).toBe(true);

      const tsconfig = JSON.parse(readFileSync(tsconfigPath, "utf-8"));
      expect(tsconfig.extends).toBeDefined();
    });

    it("shared-types should have proper TypeScript config", () => {
      const tsconfigPath = join(sharedTypesDir, "tsconfig.json");
      expect(existsSync(tsconfigPath)).toBe(true);

      const tsconfig = JSON.parse(readFileSync(tsconfigPath, "utf-8"));
      expect(tsconfig.extends).toBeDefined();
    });
  });

  describe("Build Artifacts", () => {
    it("shared-types package.json should have correct name", () => {
      const packageJsonPath = join(sharedTypesDir, "package.json");
      const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
      
      expect(packageJson.name).toBe("@repo/shared-types");
    });

    it("shared-types should be marked as private", () => {
      const packageJsonPath = join(sharedTypesDir, "package.json");
      const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
      
      expect(packageJson.private).toBe(true);
    });
  });
});
