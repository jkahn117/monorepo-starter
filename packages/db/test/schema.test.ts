import { describe, it, expect } from "vitest";
import * as schemas from "../src/schema/index.js";

describe("Database Schemas", () => {
  describe("PostgreSQL Schema", () => {
    it("should export users table", () => {
      expect(schemas.postgres.users).toBeDefined();
      expect(schemas.postgres.users).toHaveProperty("id");
      expect(schemas.postgres.users).toHaveProperty("email");
      expect(schemas.postgres.users).toHaveProperty("name");
    });

    it("should export posts table", () => {
      expect(schemas.postgres.posts).toBeDefined();
      expect(schemas.postgres.posts).toHaveProperty("id");
      expect(schemas.postgres.posts).toHaveProperty("userId");
      expect(schemas.postgres.posts).toHaveProperty("title");
      expect(schemas.postgres.posts).toHaveProperty("content");
    });

    it("should have correct types", () => {
      // Type inference test - will fail at compile time if types are wrong
      const user: schemas.postgres.User = {
        id: 1,
        email: "test@example.com",
        name: "Test User",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      expect(user).toBeDefined();

      const newUser: schemas.postgres.NewUser = {
        email: "new@example.com",
        name: "New User",
      };
      expect(newUser).toBeDefined();
    });
  });

  describe("SQLite/D1 Schema", () => {
    it("should export users table", () => {
      expect(schemas.sqlite.users).toBeDefined();
      expect(schemas.sqlite.users).toHaveProperty("id");
      expect(schemas.sqlite.users).toHaveProperty("email");
      expect(schemas.sqlite.users).toHaveProperty("name");
    });

    it("should export posts table", () => {
      expect(schemas.sqlite.posts).toBeDefined();
      expect(schemas.sqlite.posts).toHaveProperty("id");
      expect(schemas.sqlite.posts).toHaveProperty("userId");
      expect(schemas.sqlite.posts).toHaveProperty("title");
      expect(schemas.sqlite.posts).toHaveProperty("content");
    });

    it("should have correct types", () => {
      // Type inference test - will fail at compile time if types are wrong
      const user: schemas.sqlite.User = {
        id: 1,
        email: "test@example.com",
        name: "Test User",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      expect(user).toBeDefined();

      const newUser: schemas.sqlite.NewUser = {
        email: "new@example.com",
        name: "New User",
      };
      expect(newUser).toBeDefined();
    });
  });

  describe("Shared Schema Utilities", () => {
    it("should export timestamps helper", () => {
      expect(schemas.shared.timestamps).toBeDefined();
      expect(schemas.shared.timestamps).toHaveProperty("createdAt");
      expect(schemas.shared.timestamps).toHaveProperty("updatedAt");
    });

    it("should export createId utility", () => {
      expect(schemas.shared.createId).toBeDefined();
      const id1 = schemas.shared.createId();
      const id2 = schemas.shared.createId();
      expect(typeof id1).toBe("string");
      expect(typeof id2).toBe("string");
      expect(id1).not.toBe(id2);
    });
  });
});
