import { describe, expect, it } from "vitest";

import type { ApiHealthResponse } from "./runtime-contracts";

describe("ApiHealthResponse", () => {
  it("captures the backend runtime status contract", () => {
    const response: ApiHealthResponse = {
      service: "api",
      status: "ok",
      timestamp: new Date().toISOString(),
      database: {
        status: "up"
      }
    };

    expect(response.database.status).toBe("up");
  });
});
