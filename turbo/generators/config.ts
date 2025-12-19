import type { PlopTypes } from "@turbo/gen";
import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  // Custom helper for converting names to kebab-case
  plop.setHelper("kebabCase", (text: string) => {
    return text
      .replace(/([a-z])([A-Z])/g, "$1-$2")
      .replace(/[\s_]+/g, "-")
      .toLowerCase();
  });

  // Custom helper for converting names to PascalCase
  plop.setHelper("pascalCase", (text: string) => {
    return text
      .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ""))
      .replace(/^(.)/, (c) => c.toUpperCase());
  });

  // Custom helper to check if array includes value
  plop.setHelper("includes", (array: string[], value: string) => {
    return Array.isArray(array) && array.includes(value);
  });

  // Custom helper for equality check
  plop.setHelper("eq", (a: string, b: string) => {
    return a === b;
  });

  // Custom helper for OR logic
  plop.setHelper("or", (...args: any[]) => {
    // Last argument is the options object, so exclude it
    return args.slice(0, -1).some(Boolean);
  });

  plop.setGenerator("cloudflare-worker", {
    description: "Generate a new Cloudflare Worker application",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "What is the name of your worker? (e.g., my-api-worker)",
        validate: (input: string) => {
          if (!input) {
            return "Worker name is required";
          }

          // Check if name is valid (lowercase, alphanumeric, hyphens)
          if (!/^[a-z0-9-]+$/.test(input)) {
            return "Worker name must be lowercase, alphanumeric with hyphens only";
          }

          // Check if worker already exists
          const workerPath = path.join(process.cwd(), "apps", input);
          if (fs.existsSync(workerPath)) {
            return `Worker "${input}" already exists in apps/ directory`;
          }

          return true;
        },
      },
      {
        type: "list",
        name: "workerType",
        message: "What type of worker do you want to create?",
        choices: [
          {
            name: "HTTP Worker (handles HTTP requests)",
            value: "http",
          },
          {
            name: "Scheduled Worker (runs on a schedule)",
            value: "scheduled",
          },
          {
            name: "Both HTTP and Scheduled",
            value: "both",
          },
        ],
        default: "http",
      },
      {
        type: "checkbox",
        name: "bindings",
        message: "Which Cloudflare bindings do you need?",
        choices: [
          {
            name: "D1 Database (SQL database)",
            value: "d1",
          },
          {
            name: "KV (Key-Value storage)",
            value: "kv",
          },
          {
            name: "R2 (Object storage)",
            value: "r2",
          },
          {
            name: "Durable Objects",
            value: "do",
          },
        ],
      },
      {
        type: "confirm",
        name: "includeDatabase",
        message: "Do you want to include the @repo/db package?",
        default: true,
        when: (answers) => answers.bindings.includes("d1"),
      },
    ],
    actions: (answers) => {
      const actions: PlopTypes.ActionType[] = [];

      if (!answers) return actions;

      const { name, workerType, bindings, includeDatabase } = answers;
      const basePath = `apps/${name}`;

      // Add base files (always created)
      actions.push(
        {
          type: "add",
          path: `${basePath}/package.json`,
          templateFile: "templates/worker/package.json.hbs",
        },
        {
          type: "add",
          path: `${basePath}/tsconfig.json`,
          templateFile: "templates/worker/tsconfig.json.hbs",
        },
        {
          type: "add",
          path: `${basePath}/wrangler.toml`,
          templateFile: "templates/worker/wrangler.toml.hbs",
        },
        {
          type: "add",
          path: `${basePath}/vitest.config.ts`,
          templateFile: "templates/worker/vitest.config.ts.hbs",
        },
        {
          type: "add",
          path: `${basePath}/src/types.ts`,
          templateFile: "templates/worker/src/types.ts.hbs",
        },
        {
          type: "add",
          path: `${basePath}/README.md`,
          templateFile: "templates/worker/README.md.hbs",
        },
        {
          type: "add",
          path: `${basePath}/.env.example`,
          templateFile: "templates/worker/.env.example.hbs",
        }
      );

      // Add HTTP worker files
      if (workerType === "http" || workerType === "both") {
        actions.push(
          {
            type: "add",
            path: `${basePath}/src/index.ts`,
            templateFile: "templates/worker/src/index.ts.hbs",
          },
          {
            type: "add",
            path: `${basePath}/test/index.test.ts`,
            templateFile: "templates/worker/test/index.test.ts.hbs",
          }
        );
      }

      // Add scheduled worker files
      if (workerType === "scheduled" || workerType === "both") {
        actions.push({
          type: "add",
          path: `${basePath}/src/scheduled.ts`,
          templateFile: "templates/worker/src/scheduled.ts.hbs",
        });
      }

      // Post-generation actions
      actions.push(
        {
          type: "custom",
          name: "Install dependencies",
          action: () => {
            try {
              console.log("\n📦 Installing dependencies...");
              execSync("pnpm install", {
                cwd: process.cwd(),
                stdio: "inherit",
              });
              return "✅ Dependencies installed successfully";
            } catch (error) {
              return `⚠️  Failed to install dependencies: ${error}`;
            }
          },
        },
        {
          type: "custom",
          name: "Type check",
          action: () => {
            try {
              console.log("\n🔍 Running type check...");
              execSync(`pnpm --filter @repo/${name} type-check`, {
                cwd: process.cwd(),
                stdio: "inherit",
              });
              return "✅ Type check passed";
            } catch (error) {
              return "⚠️  Type check failed - please review the generated code";
            }
          },
        },
        {
          type: "custom",
          name: "Lint check",
          action: () => {
            try {
              console.log("\n✨ Running lint check...");
              execSync(`pnpm --filter @repo/${name} lint`, {
                cwd: process.cwd(),
                stdio: "inherit",
              });
              return "✅ Lint check passed";
            } catch (error) {
              return "⚠️  Lint check failed - please review the generated code";
            }
          },
        }
      );

      // Success message
      actions.push({
        type: "custom",
        name: "Success message",
        action: () => {
          console.log("\n🎉 Worker created successfully!");
          console.log(`\n📁 Location: apps/${name}`);
          console.log("\n🚀 Next steps:");
          console.log(`  1. cd apps/${name}`);
          console.log("  2. Review and update .env.example");
          console.log("  3. Configure wrangler.toml with your account ID");

          if (bindings.includes("d1")) {
            console.log("  4. Create D1 database: npx wrangler d1 create <db-name>");
            console.log("  5. Update wrangler.toml with database ID");
          }

          if (bindings.includes("kv")) {
            console.log("  4. Create KV namespace: npx wrangler kv:namespace create <namespace>");
            console.log("  5. Update wrangler.toml with KV namespace ID");
          }

          if (bindings.includes("r2")) {
            console.log("  4. Create R2 bucket: npx wrangler r2 bucket create <bucket-name>");
            console.log("  5. Update wrangler.toml with bucket name");
          }

          console.log(`\n💻 Development:`);
          console.log(`  pnpm --filter @repo/${name} dev`);
          console.log(`\n🧪 Testing:`);
          console.log(`  pnpm --filter @repo/${name} test`);
          console.log(`\n🚢 Deployment:`);
          console.log(`  pnpm --filter @repo/${name} deploy`);

          return "";
        },
      });

      return actions;
    },
  });
}
