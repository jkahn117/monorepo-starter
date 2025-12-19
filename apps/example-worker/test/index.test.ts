import { describe, it, expect } from "vitest";
import app from "../src/index.js";

describe("Example Worker", () => {
  it("should return health check", async () => {
    const res = await app.request("/health");
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data).toHaveProperty("status", "ok");
    expect(data).toHaveProperty("version");
    expect(data).toHaveProperty("timestamp");
  });

  it("should return root message", async () => {
    const res = await app.request("/");
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data).toHaveProperty("message");
    expect(data.message).toContain("Cloudflare Monorepo Template");
  });

  it("should return users list", async () => {
    const res = await app.request("/api/users");
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data).toHaveProperty("data");
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.data.length).toBeGreaterThan(0);
  });

  it("should return 404 for unknown routes", async () => {
    const res = await app.request("/unknown");
    expect(res.status).toBe(404);

    const data = await res.json();
    expect(data).toHaveProperty("error", "Not Found");
    expect(data).toHaveProperty("code", "404");
  });
});
