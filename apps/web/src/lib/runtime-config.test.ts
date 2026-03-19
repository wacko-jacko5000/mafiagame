import { afterEach, describe, expect, it, vi } from "vitest";

import { getApiBaseUrl, getApiHealthUrl, getApiUrl } from "./runtime-config";

describe("getApiBaseUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("uses the public API base URL when present", () => {
    vi.stubEnv("NEXT_PUBLIC_API_ORIGIN", "http://example.test:9999");

    expect(getApiBaseUrl()).toBe("http://example.test:9999");
  });

  it("falls back to the shared runtime default during server execution", () => {
    vi.stubEnv("NEXT_PUBLIC_API_ORIGIN", "");

    expect(getApiBaseUrl()).toBe("http://localhost:3001");
  });

  it("uses the current browser host when no public API origin is configured", () => {
    vi.stubEnv("NEXT_PUBLIC_API_ORIGIN", "");
    vi.stubGlobal("window", {
      location: {
        protocol: "http:",
        hostname: "192.168.1.10"
      }
    });

    expect(getApiBaseUrl()).toBe("http://192.168.1.10:3001");
  });

  it("builds the health URL from shared runtime config", () => {
    vi.stubEnv("NEXT_PUBLIC_API_ORIGIN", "http://example.test:9999");

    expect(getApiHealthUrl()).toBe("http://example.test:9999/api/health");
  });

  it("builds arbitrary API URLs from the configured origin", () => {
    vi.stubEnv("NEXT_PUBLIC_API_ORIGIN", "http://example.test:9999");

    expect(getApiUrl("/api/auth/me")).toBe("http://example.test:9999/api/auth/me");
  });
});
