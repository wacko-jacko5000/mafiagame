import { describe, expect, it, vi } from "vitest";

import { PrismaService } from "./prisma.service";

describe("PrismaService.checkConnection", () => {
  it("returns true when the probe query returns 1", async () => {
    const service = {
      $queryRaw: vi.fn().mockResolvedValue([{ result: 1 }])
    } as unknown as PrismaService;

    const connected = await PrismaService.prototype.checkConnection.call(service);

    expect(connected).toBe(true);
  });
});
