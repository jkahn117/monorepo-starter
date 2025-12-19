import { describe, it, expect } from "vitest";

describe("Type Imports", () => {
  describe("API Types", () => {
    it("should be able to import api module", async () => {
      const api = await import("../src/api.js");
      expect(api).toBeDefined();
      // Types are compile-time only, not runtime values
      expect(typeof api).toBe("object");
    });
  });

  describe("Common Types", () => {
    it("should be able to import common module", async () => {
      const common = await import("../src/common.js");
      expect(common).toBeDefined();
      // Types are compile-time only, not runtime values
      expect(typeof common).toBe("object");
    });
  });

  describe("Database Types", () => {
    it("should be able to import database module", async () => {
      const database = await import("../src/database.js");
      expect(database).toBeDefined();
      // Types are compile-time only, not runtime values
      expect(typeof database).toBe("object");
    });
  });

  describe("Worker Types", () => {
    it("should be able to import worker module", async () => {
      const worker = await import("../src/worker.js");
      expect(worker).toBeDefined();
      // Types are compile-time only, not runtime values
      expect(typeof worker).toBe("object");
    });
  });

  describe("Event Types", () => {
    it("should be able to import events module", async () => {
      const events = await import("../src/events.js");
      expect(events).toBeDefined();
      // Event factories should exist as runtime functions
      expect(events.createBaseEvent).toBeDefined();
      expect(events.createDomainEvent).toBeDefined();
      expect(typeof events.createBaseEvent).toBe("function");
      expect(typeof events.createDomainEvent).toBe("function");
    });
  });

  describe("Index Exports", () => {
    it("should re-export event factory functions from index", async () => {
      const index = await import("../src/index.js");
      expect(index).toBeDefined();
      
      // Event factories (actual runtime functions)
      expect(index.createBaseEvent).toBeDefined();
      expect(index.createDomainEvent).toBeDefined();
      expect(typeof index.createBaseEvent).toBe("function");
      expect(typeof index.createDomainEvent).toBe("function");
    });
  });
});
