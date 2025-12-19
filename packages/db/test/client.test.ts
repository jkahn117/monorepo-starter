import { describe, it, expect } from "vitest";
import { createPostgresClient, createD1Client } from "../src/client/index.js";

describe("Database Clients", () => {
  describe("PostgreSQL Client", () => {
    it("should export createPostgresClient function", () => {
      expect(createPostgresClient).toBeDefined();
      expect(typeof createPostgresClient).toBe("function");
    });

    it("should create a client instance", () => {
      // Note: This will use env var or fail gracefully
      // In a real test, you'd mock the connection or use a test database
      const client = createPostgresClient("postgresql://test:test@localhost:5432/test");
      expect(client).toBeDefined();
      expect(client.query).toBeDefined();
    });
  });

  describe("D1 Client", () => {
    it("should export createD1Client function", () => {
      expect(createD1Client).toBeDefined();
      expect(typeof createD1Client).toBe("function");
    });

    it("should create a client instance with mock D1Database", () => {
      // Mock D1Database for testing
      const mockD1: D1Database = {
        prepare: () => ({
          bind: () => ({
            all: async () => ({ results: [], success: true, meta: {} }),
            run: async () => ({ results: [], success: true, meta: {} }),
            first: async () => null,
            raw: async () => [],
          }),
          all: async () => ({ results: [], success: true, meta: {} }),
          run: async () => ({ results: [], success: true, meta: {} }),
          first: async () => null,
          raw: async () => [],
        }),
        dump: async () => new ArrayBuffer(0),
        batch: async () => [],
        exec: async () => ({ count: 0, duration: 0 }),
      };

      const client = createD1Client(mockD1);
      expect(client).toBeDefined();
      expect(client.query).toBeDefined();
    });
  });
});
