import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

describe("Generator Compilation Tests", () => {
  const testWorkerName = "test-generated-worker";
  const testWorkerPath = path.join(process.cwd(), "apps", testWorkerName);

  // Skip these tests in CI or if generator isn't available
  const shouldRun = process.env.TEST_GENERATOR !== "false";

  beforeAll(() => {
    if (!shouldRun) return;

    // Clean up test worker if it exists
    if (fs.existsSync(testWorkerPath)) {
      fs.rmSync(testWorkerPath, { recursive: true, force: true });
    }
  });

  afterAll(() => {
    if (!shouldRun) return;

    // Clean up test worker after tests
    if (fs.existsSync(testWorkerPath)) {
      fs.rmSync(testWorkerPath, { recursive: true, force: true });
    }
  });

  it.skip("should generate worker that compiles without errors", () => {
    if (!shouldRun) return;

    // Note: This test is skipped by default because it requires interactive input
    // To enable, set TEST_GENERATOR=true and provide manual input or use mock responses

    // Generate a test worker (would require mocking user input)
    // execSync("pnpm gen cloudflare-worker", { cwd: process.cwd() });

    // Verify files were created
    expect(fs.existsSync(testWorkerPath)).toBe(true);
    expect(
      fs.existsSync(path.join(testWorkerPath, "package.json")),
    ).toBe(true);

    // Run type check
    try {
      execSync(`pnpm --filter @repo/${testWorkerName} type-check`, {
        cwd: process.cwd(),
        stdio: "pipe",
      });
      expect(true).toBe(true); // Type check passed
    } catch (error) {
      throw new Error("Type check failed for generated worker");
    }
  });

  it("should validate generator config exports default function", async () => {
    const configPath = path.join(
      process.cwd(),
      "turbo",
      "generators",
      "config.ts",
    );

    const content = fs.readFileSync(configPath, "utf-8");

    // Check for required exports
    expect(content).toContain("export default function generator");
    expect(content).toContain("PlopTypes.NodePlopAPI");
    expect(content).toContain('setGenerator("cloudflare-worker"');
  });

  it("should validate templates can be read without errors", () => {
    const templatesPath = path.join(
      process.cwd(),
      "turbo",
      "generators",
      "templates",
      "worker",
    );

    const walk = (dir: string): string[] => {
      let files: string[] = [];
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        if (fs.statSync(fullPath).isDirectory()) {
          files = files.concat(walk(fullPath));
        } else if (item.endsWith(".hbs")) {
          files.push(fullPath);
        }
      }

      return files;
    };

    const templateFiles = walk(templatesPath);
    expect(templateFiles.length).toBeGreaterThan(0);

    // Verify all templates can be read
    for (const file of templateFiles) {
      const content = fs.readFileSync(file, "utf-8");
      expect(content.length).toBeGreaterThan(0);
    }
  });
});
