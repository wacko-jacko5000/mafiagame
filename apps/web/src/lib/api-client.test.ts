import { afterEach, describe, expect, it, vi } from "vitest";

import { ApiError, apiRequest } from "./api-client";

describe("apiRequest", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("adds bearer auth and JSON body when provided", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_ORIGIN", "http://example.test:3001");
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      })
    );

    await apiRequest<{ ok: boolean }>("/api/test", {
      method: "POST",
      accessToken: "token-123",
      body: { ping: "pong" }
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      "http://example.test:3001/api/test",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ ping: "pong" }),
        cache: "no-store"
      })
    );

    const requestHeaders = new Headers(
      (fetchSpy.mock.calls[0]?.[1] as RequestInit | undefined)?.headers
    );

    expect(requestHeaders.get("Authorization")).toBe("Bearer token-123");
    expect(requestHeaders.get("Content-Type")).toBe("application/json");
  });

  it("throws an ApiError with the backend message on failure", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_ORIGIN", "http://example.test:3001");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ message: "Authentication is required." }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      })
    );

    await expect(apiRequest("/api/auth/me")).rejects.toEqual(
      new ApiError("Authentication is required.", 401, {
        message: "Authentication is required."
      })
    );
  });
});
