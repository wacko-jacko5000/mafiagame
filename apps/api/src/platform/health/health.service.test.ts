import { describe, expect, it, vi } from "vitest";

import { HealthService } from "./health.service";

describe("HealthService", () => {
  it("reports api and database status", async () => {
    const service = new HealthService({
      checkConnection: vi.fn().mockResolvedValue(true)
    } as never);

    const result = await service.getHealth();

    expect(result.service).toBe("api");
    expect(result.status).toBe("ok");
    expect(result.database.status).toBe("up");
    expect(result.timestamp).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/
    );
  });

  it("degrades when the database probe fails", async () => {
    const service = new HealthService({
      checkConnection: vi.fn().mockRejectedValue(new Error("db down"))
    } as never);

    const result = await service.getHealth();

    expect(result.status).toBe("degraded");
    expect(result.database.status).toBe("down");
  });
});
