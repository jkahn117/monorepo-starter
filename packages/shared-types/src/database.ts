/**
 * Database-related types for Cloudflare monorepo
 */

/**
 * Database configuration interface
 */
export interface DatabaseConfig {
  /**
   * Database type
   */
  type: "postgres" | "d1" | "sqlite";

  /**
   * Connection string or database name
   */
  connection: string;

  /**
   * Pool configuration for PostgreSQL
   */
  pool?: {
    min?: number;
    max?: number;
    idleTimeoutMillis?: number;
  };

  /**
   * Enable query logging
   */
  logging?: boolean;

  /**
   * Database schema name (PostgreSQL)
   */
  schema?: string;
}

/**
 * Database connection status
 */
export interface DatabaseStatus {
  connected: boolean;
  type: DatabaseConfig["type"];
  latency?: number;
  error?: string;
}

/**
 * Query result metadata
 */
export interface QueryMetadata {
  rowCount: number;
  duration: number;
  query: string;
}

/**
 * Transaction options
 */
export interface TransactionOptions {
  isolationLevel?: "read uncommitted" | "read committed" | "repeatable read" | "serializable";
  timeout?: number;
  readOnly?: boolean;
}

/**
 * Database migration info
 */
export interface MigrationInfo {
  id: string;
  name: string;
  appliedAt: Date;
  hash: string;
}

/**
 * Database client interface
 */
export interface DatabaseClient {
  query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]>;
  execute(sql: string, params?: unknown[]): Promise<QueryMetadata>;
  transaction<T>(fn: (tx: DatabaseClient) => Promise<T>, options?: TransactionOptions): Promise<T>;
  close(): Promise<void>;
}

/**
 * Database error types
 */
export type DatabaseError =
  | { type: "connection"; message: string; code?: string }
  | { type: "query"; message: string; query: string; code?: string }
  | { type: "transaction"; message: string; code?: string }
  | { type: "migration"; message: string; migration: string };

/**
 * Database query builder result
 */
export interface QueryBuilderResult<T> {
  data: T[];
  metadata: QueryMetadata;
}
