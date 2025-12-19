import { describe, it, expect, expectTypeOf } from "vitest";
import type {
  ApiResponse,
  ErrorResponse,
  HealthCheckResponse,
  PaginatedResponse,
  Nullable,
  WithId,
  WithTimestamps,
  DeepPartial,
  DeepReadonly,
} from "../src/index.js";

describe("Type Inference", () => {
  describe("ApiResponse", () => {
    it("should infer generic data type", () => {
      const response: ApiResponse<{ name: string }> = {
        data: { name: "test" },
        message: "Success",
        timestamp: new Date().toISOString(),
      };

      expectTypeOf(response.data).toEqualTypeOf<{ name: string }>();
      expectTypeOf(response.message).toEqualTypeOf<string>();
      expectTypeOf(response.timestamp).toEqualTypeOf<string>();
    });

    it("should work without data when data is undefined", () => {
      const response: ApiResponse = {
        message: "Success",
        timestamp: new Date().toISOString(),
      };

      expectTypeOf(response.message).toEqualTypeOf<string>();
      expect(response.data).toBeUndefined();
    });
  });

  describe("ErrorResponse", () => {
    it("should infer error structure", () => {
      const error: ErrorResponse = {
        error: "Not Found",
        code: "404",
        details: {
          path: "/api/test",
        },
      };

      expectTypeOf(error.error).toEqualTypeOf<string>();
      expectTypeOf(error.code).toEqualTypeOf<string>();
      expectTypeOf(error.details).toEqualTypeOf<Record<string, unknown> | undefined>();
    });
  });

  describe("HealthCheckResponse", () => {
    it("should infer health check structure", () => {
      const health: HealthCheckResponse = {
        status: "ok",
        version: "1.0.0",
        uptime: 1000,
        timestamp: new Date().toISOString(),
      };

      expectTypeOf(health.status).toEqualTypeOf<"ok" | "degraded" | "error">();
      expectTypeOf(health.version).toEqualTypeOf<string>();
      expectTypeOf(health.uptime).toEqualTypeOf<number>();
    });
  });

  describe("PaginatedResponse", () => {
    it("should infer paginated structure with generic", () => {
      const paginated: PaginatedResponse<{ id: number; name: string }> = {
        data: [{ id: 1, name: "test" }],
        pagination: {
          page: 1,
          pageSize: 10,
          total: 100,
          totalPages: 10,
        },
        message: "Success",
        timestamp: new Date().toISOString(),
      };

      expectTypeOf(paginated.data).toEqualTypeOf<Array<{ id: number; name: string }>>();
      expectTypeOf(paginated.pagination.page).toEqualTypeOf<number>();
      expectTypeOf(paginated.pagination.total).toEqualTypeOf<number>();
    });
  });

  describe("Utility Types", () => {
    it("should infer Nullable correctly", () => {
      type TestType = Nullable<string>;
      const value1: TestType = "test";
      const value2: TestType = null;

      expectTypeOf(value1).toEqualTypeOf<string | null>();
      expectTypeOf(value2).toEqualTypeOf<string | null>();
      expect(value1).toBe("test");
      expect(value2).toBeNull();
    });

    it("should infer WithId correctly", () => {
      type User = { name: string; email: string };
      type UserWithId = WithId<User>;

      const user: UserWithId = {
        id: "123",
        name: "Test",
        email: "test@example.com",
      };

      expectTypeOf(user.id).toEqualTypeOf<string>();
      expectTypeOf(user.name).toEqualTypeOf<string>();
      expectTypeOf(user.email).toEqualTypeOf<string>();
    });

    it("should infer WithTimestamps correctly", () => {
      type Post = { title: string; content: string };
      type PostWithTimestamps = WithTimestamps<Post>;

      const post: PostWithTimestamps = {
        title: "Test",
        content: "Content",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expectTypeOf(post.createdAt).toEqualTypeOf<Date>();
      expectTypeOf(post.updatedAt).toEqualTypeOf<Date>();
      expectTypeOf(post.title).toEqualTypeOf<string>();
    });

    it("should infer DeepPartial correctly", () => {
      type Config = {
        server: {
          port: number;
          host: string;
          ssl: {
            enabled: boolean;
            cert: string;
          };
        };
      };

      type PartialConfig = DeepPartial<Config>;

      const config1: PartialConfig = {};
      const config2: PartialConfig = { server: { port: 3000 } };
      const config3: PartialConfig = { server: { ssl: { enabled: true } } };

      expectTypeOf(config1).toMatchTypeOf<PartialConfig>();
      expectTypeOf(config2).toMatchTypeOf<PartialConfig>();
      expectTypeOf(config3).toMatchTypeOf<PartialConfig>();
    });

    it("should infer DeepReadonly correctly", () => {
      type MutableConfig = {
        settings: {
          value: number;
        };
      };

      type ReadonlyConfig = DeepReadonly<MutableConfig>;

      const config: ReadonlyConfig = {
        settings: {
          value: 42,
        },
      };

      expectTypeOf(config).toEqualTypeOf<{
        readonly settings: {
          readonly value: number;
        };
      }>();
    });
  });
});
