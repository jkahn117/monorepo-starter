import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("Turborepo Build Pipeline", () => {
  const root = join(process.cwd());

  it("should have valid turbo.json configuration", () => {
    const content = readFileSync(join(root, "turbo.json"), "utf-8");
    const config = JSON.parse(content);

    expect(config).toHaveProperty("tasks");
    expect(config.tasks).toHaveProperty("build");
    expect(config.tasks).toHaveProperty("test");
    expect(config.tasks).toHaveProperty("lint");
    expect(config.tasks).toHaveProperty("dev");
  });

  it("should have correct task dependencies", () => {
    const content = readFileSync(join(root, "turbo.json"), "utf-8");
    const config = JSON.parse(content);

    // Build should depend on ^build (upstream builds)
    expect(config.tasks.build.dependsOn).toContain("^build");

    // Deploy should depend on build, test, lint
    expect(config.tasks.deploy.dependsOn).toContain("build");
    expect(config.tasks.deploy.dependsOn).toContain("test");
    expect(config.tasks.deploy.dependsOn).toContain("lint");
  });

  it("should have dev task marked as persistent", () => {
    const content = readFileSync(join(root, "turbo.json"), "utf-8");
    const config = JSON.parse(content);

    expect(config.tasks.dev.persistent).toBe(true);
    expect(config.tasks.dev.cache).toBe(false);
  });
});
