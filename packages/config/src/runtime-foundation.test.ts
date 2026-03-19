import { describe, expect, it } from "vitest";

import { getRuntimeFoundationConfig } from "./runtime-foundation";

describe("getRuntimeFoundationConfig", () => {
  it("exposes stable default ports for web and api runtimes", () => {
    const runtimeConfig = getRuntimeFoundationConfig();

    expect(runtimeConfig.web.defaultPort).toBe(3000);
    expect(runtimeConfig.api.defaultPort).toBe(3001);
    expect(runtimeConfig.api.globalPrefix).toBe("api");
    expect(runtimeConfig.api.healthPath).toBe("/health");
  });
});
