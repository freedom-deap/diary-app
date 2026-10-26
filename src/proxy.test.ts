import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { AUTH_COOKIE, createAuthToken } from "./lib/auth-token";
import { proxy } from "./proxy";

const loginPath = "/private-entry-1234567890";

afterEach(() => vi.unstubAllEnvs());

describe("public viewer and private editor routing", () => {
  it("allows public pages and photo reads without a session", async () => {
    vi.stubEnv("AUTH_LOGIN_PATH", loginPath);
    for (const path of ["/", "/spots/spot-id", "/api/photos/photo-id"]) {
      const response = await proxy(new NextRequest(`http://localhost:3000${path}`));
      expect(response.status).toBe(200);
    }
  });

  it("keeps the viewer available when the login URL is not configured", async () => {
    vi.stubEnv("AUTH_LOGIN_PATH", "");
    expect((await proxy(new NextRequest("http://localhost:3000/"))).status).toBe(200);
    expect((await proxy(new NextRequest("http://localhost:3000/manage"))).status).toBe(404);
  });

  it("hides the editor and the internal login route", async () => {
    vi.stubEnv("AUTH_LOGIN_PATH", loginPath);
    for (const path of ["/manage", "/manage/spots/spot-id", "/spots/new", "/spots/spot-id/edit", "/labels", "/login"]) {
      const response = await proxy(new NextRequest(`http://localhost:3000${path}`));
      expect(response.status).toBe(404);
      expect(response.headers.get("location")).toBeNull();
    }
  });

  it("rewrites only the configured login URL", async () => {
    vi.stubEnv("AUTH_LOGIN_PATH", loginPath);
    for (const method of ["GET", "POST"]) {
      const response = await proxy(new NextRequest(`http://localhost:3000${loginPath}`, { method }));
      expect(response.headers.get("x-middleware-rewrite")).toBe("http://localhost:3000/login");
    }
  });

  it("does not allow anonymous POST requests through public pages", async () => {
    vi.stubEnv("AUTH_LOGIN_PATH", loginPath);
    for (const path of ["/", "/spots/spot-id", "/api/photos/photo-id"]) {
      const response = await proxy(new NextRequest(`http://localhost:3000${path}`, { method: "POST" }));
      expect(response.status).toBe(404);
    }
  });

  it("allows the editor with a valid session", async () => {
    vi.stubEnv("AUTH_LOGIN_PATH", loginPath);
    vi.stubEnv("AUTH_SECRET", "test-secret");
    const token = await createAuthToken("editor", "test-secret");
    const request = new NextRequest("http://localhost:3000/manage", { headers: { cookie: `${AUTH_COOKIE}=${token}` } });
    expect((await proxy(request)).status).toBe(200);
  });
});
