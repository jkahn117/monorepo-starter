import type { Config } from "drizzle-kit";

export default {
  schema: "./src/schema/postgres.ts",
  out: "./drizzle/postgres",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.POSTGRES_URL || "",
  },
} satisfies Config;
