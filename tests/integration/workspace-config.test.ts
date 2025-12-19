import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import yaml from "yaml";

describe("PNPM Workspace Configuration", () => {
  const root = join(process.cwd());

  it("should have valid pnpm-workspace.yaml", () => {
    const content = readFileSync(
      join(root, "pnpm-workspace.yaml"),
      "utf-8",
    );
    const config = yaml.parse(content);

    expect(config).toHaveProperty("packages");
    expect(config.packages).toContain("apps/*");
    expect(config.packages).toContain("packages/*");
  });

  it("should have workspace protocol in package dependencies", () => {
    const pkgPath = join(root, "apps/example-worker/package.json");
    const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));

    // Check for workspace protocol
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    const workspaceDeps = Object.values(deps).filter((v) =>
      String(v).startsWith("workspace:"),
    );

    expect(workspaceDeps.length).toBeGreaterThan(0);
  });
});
