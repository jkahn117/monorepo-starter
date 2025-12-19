import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

describe("Generator Output Validation", () => {
  it("should validate template structure matches example-worker", () => {
    const templateBasePath = path.join(
      process.cwd(),
      "turbo",
      "generators",
      "templates",
      "worker",
    );
    const exampleWorkerPath = path.join(process.cwd(), "apps", "example-worker");

    // Check that templates exist for key files from example-worker
    const keyFiles = [
      { template: "package.json.hbs", example: "package.json" },
      { template: "tsconfig.json.hbs", example: "tsconfig.json" },
      { template: "wrangler.toml.hbs", example: "wrangler.toml" },
      { template: "vitest.config.ts.hbs", example: "vitest.config.ts" },
      { template: ".env.example.hbs", example: ".env.example" },
      { template: "README.md.hbs", example: "README.md" },
      { template: "src/index.ts.hbs", example: "src/index.ts" },
      { template: "src/types.ts.hbs", example: "src/types.ts" },
      { template: "test/index.test.ts.hbs", example: "test/index.test.ts" },
    ];

    for (const { template, example } of keyFiles) {
      const templatePath = path.join(templateBasePath, template);
      const examplePath = path.join(exampleWorkerPath, example);

      expect(
        fs.existsSync(templatePath),
        `Template file ${template} should exist`,
      ).toBe(true);
      expect(
        fs.existsSync(examplePath),
        `Example file ${example} should exist`,
      ).toBe(true);
    }
  });

  it("should validate handlebars syntax in templates", () => {
    const templateBasePath = path.join(
      process.cwd(),
      "turbo",
      "generators",
      "templates",
      "worker",
    );

    const templateFiles = [
      "package.json.hbs",
      "tsconfig.json.hbs",
      "wrangler.toml.hbs",
      "src/index.ts.hbs",
      "src/scheduled.ts.hbs",
      "src/types.ts.hbs",
      "test/index.test.ts.hbs",
      "README.md.hbs",
    ];

    for (const file of templateFiles) {
      const filePath = path.join(templateBasePath, file);
      const content = fs.readFileSync(filePath, "utf-8");

      // Check for balanced Handlebars braces
      const openBraces = (content.match(/\{\{/g) || []).length;
      const closeBraces = (content.match(/\}\}/g) || []).length;
      expect(
        openBraces,
        `${file} should have balanced Handlebars braces`,
      ).toBe(closeBraces);

      // Check for common Handlebars helpers used
      if (content.includes("{{")) {
        expect(content).toMatch(/\{\{[\s\S]*?\}\}/); // Has at least one complete Handlebars expression
      }
    }
  });

  it("should validate package.json template has required fields", () => {
    const templatePath = path.join(
      process.cwd(),
      "turbo",
      "generators",
      "templates",
      "worker",
      "package.json.hbs",
    );
    const content = fs.readFileSync(templatePath, "utf-8");

    // Check for required package.json structure
    expect(content).toContain('"name"');
    expect(content).toContain('"version"');
    expect(content).toContain('"scripts"');
    expect(content).toContain('"dependencies"');
    expect(content).toContain('"devDependencies"');
    expect(content).toContain("@repo/shared-types");
    expect(content).toContain("workspace:*");
  });

  it("should validate tsconfig.json template extends base config", () => {
    const templatePath = path.join(
      process.cwd(),
      "turbo",
      "generators",
      "templates",
      "worker",
      "tsconfig.json.hbs",
    );
    const content = fs.readFileSync(templatePath, "utf-8");

    expect(content).toContain('"extends"');
    expect(content).toContain("@repo/tsconfig/worker.json");
  });

  it("should validate wrangler.toml template has required fields", () => {
    const templatePath = path.join(
      process.cwd(),
      "turbo",
      "generators",
      "templates",
      "worker",
      "wrangler.toml.hbs",
    );
    const content = fs.readFileSync(templatePath, "utf-8");

    expect(content).toContain("name =");
    expect(content).toContain("main =");
    expect(content).toContain("compatibility_date =");
    expect(content).toContain("[env.development]");
    expect(content).toContain("[env.production]");
  });
});
