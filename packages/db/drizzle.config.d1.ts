import type { Config } from "drizzle-kit";

export default {
  schema: "./src/schema/sqlite.ts",
  out: "./drizzle/d1",
  driver: "d1",
} satisfies Config;
