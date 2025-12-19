// Shared schema definitions that work across both PostgreSQL and SQLite
// These use common column types and constraints supported by both databases

import { integer } from "drizzle-orm/sqlite-core";

// Example shared timestamp helpers
export const timestamps = {
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
};

// Common types for IDs
export type Id = string | number;

// Export shared utilities
export const createId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};
