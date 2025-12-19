import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

describe("Generator Configuration", () => {
  const generatorConfigPath = path.join(
    process.cwd(),
    "turbo",
    "generators",
    "config.ts",
  );

  it("should have generator config file", () => {
    expect(fs.existsSync(generatorConfigPath)).toBe(true);
  });

  it("should have generator templates directory", () => {
    const templatesPath = path.join(
      process.cwd(),
      "turbo",
      "generators",
      "templates",
      "worker",
    );
    expect(fs.existsSync(templatesPath)).toBe(true);
  });

  it("should have all required template files", () => {
    const basePath = path.join(
      process.cwd(),
      "turbo",
      "generators",
      "templates",
      "worker",
    );

    const requiredFiles = [
      "package.json.hbs",
      "tsconfig.json.hbs",
      "wrangler.toml.hbs",
      "vitest.config.ts.hbs",
      ".env.example.hbs",
      "README.md.hbs",
      "src/index.ts.hbs",
      "src/scheduled.ts.hbs",
      "src/types.ts.hbs",
      "test/index.test.ts.hbs",
    ];

    for (const file of requiredFiles) {
      const filePath = path.join(basePath, file);
      expect(fs.existsSync(filePath)).toBe(true);
    }
  });

  it("should have root package.json with gen script", () => {
    const packageJsonPath = path.join(process.cwd(), "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

    expect(packageJson.scripts).toHaveProperty("gen");
    expect(packageJson.scripts.gen).toBe("turbo gen");
  });

  it("should have @turbo/gen as dependency", () => {
    const packageJsonPath = path.join(process.cwd(), "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

    expect(packageJson.devDependencies).toHaveProperty("@turbo/gen");
  });
});
