// D1 client factory for Cloudflare Workers
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../schema/sqlite.js";

export type D1Client = ReturnType<typeof createD1Client>;

/**
 * Creates a Drizzle client for Cloudflare D1
 * @param d1Database - D1Database instance from Cloudflare Workers environment
 * @returns Drizzle D1 client
 */
export function createD1Client(d1Database: D1Database) {
  return drizzle(d1Database, { schema });
}
