/**
 * Example Worker Configuration
 *
 * This file demonstrates using the shared @repo/wrangler-config package
 * to manage Cloudflare Workers configuration in a type-safe way.
 */

import {
  defineConfig,
  defineEnvironment,
  d1Binding,
} from "@repo/wrangler-config";

export default defineConfig({
  name: "example-worker",
  main: "src/index.ts",
  compatibility_date: "2024-01-01",
  compatibility_flags: ["nodejs_compat"],

  // Base bindings (development)
  bindings: [d1Binding("DB", "example-db", "example-db-dev")],

  // Environment-specific configurations
  env: {
    development: defineEnvironment("development", {
      name: "example-worker-dev",
      bindings: [d1Binding("DB", "example-db-dev", "example-db-dev")],
    }),

    production: defineEnvironment("production", {
      name: "example-worker-prod",
      bindings: [d1Binding("DB", "example-db-prod", "example-db-prod")],
    }),
  },
});
