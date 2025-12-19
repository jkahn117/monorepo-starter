import { describe, it, expect } from "vitest";
import type { ApiResponse, ErrorResponse, HealthCheckResponse } from "../src/api.js";
import type { Nullable, WithId, WithTimestamps } from "../src/common.js";

describe("Shared Types", () => {
  describe("API Types", () => {
    it("should correctly type ApiResponse", () => {
      const response: ApiResponse<{ name: string }> = {
        data: { name: "test" },
        message: "Success",
        timestamp: new Date().toISOString(),
      };

      expect(response.data?.name).toBe("test");
      expect(response.message).toBe("Success");
    });

    it("should correctly type ErrorResponse", () => {
      const error: ErrorResponse = {
        error: "Not Found",
        code: "404",
      };

      expect(error.error).toBe("Not Found");
      expect(error.code).toBe("404");
    });

    it("should correctly type HealthCheckResponse", () => {
      const health: HealthCheckResponse = {
        status: "ok",
        version: "1.0.0",
        uptime: 3600,
        timestamp: new Date().toISOString(),
      };

      expect(health.status).toBe("ok");
    });
  });

  describe("Common Types", () => {
    it("should correctly type Nullable", () => {
      const value: Nullable<string> = null;
      expect(value).toBeNull();

      const value2: Nullable<string> = "test";
      expect(value2).toBe("test");
    });

    it("should correctly type WithId", () => {
      interface User {
        name: string;
      }

      const user: WithId<User> = {
        id: "123",
        name: "John",
      };

      expect(user.id).toBe("123");
      expect(user.name).toBe("John");
    });

    it("should correctly type WithTimestamps", () => {
      interface Post {
        title: string;
      }

      const post: WithTimestamps<Post> = {
        title: "Hello",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      };

      expect(post.createdAt).toBeDefined();
      expect(post.updatedAt).toBeDefined();
    });
  });
});
