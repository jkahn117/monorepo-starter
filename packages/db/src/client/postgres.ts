// PostgreSQL client factory using @vercel/postgres
import { drizzle } from "drizzle-orm/vercel-postgres";
import { sql as vercelSql } from "@vercel/postgres";
import * as schema from "../schema/postgres.js";

export type PostgresClient = ReturnType<typeof createPostgresClient>;

/**
 * Creates a Drizzle client for PostgreSQL using @vercel/postgres
 * @param connectionString - PostgreSQL connection string (optional, defaults to POSTGRES_URL env var)
 * @returns Drizzle PostgreSQL client
 */
export function createPostgresClient(connectionString?: string) {
  if (connectionString) {
    // When connection string is provided, use it
    // Note: @vercel/postgres uses the POSTGRES_URL env var by default
    process.env["POSTGRES_URL"] = connectionString;
  }

  return drizzle(vercelSql, { schema });
}
