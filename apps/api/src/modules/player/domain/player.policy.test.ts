import { describe, expect, it } from "vitest";

import {
  buildInitialPlayerValues,
  normalizeDisplayName,
  regeneratePlayerEnergy,
  validateDisplayName
} from "./player.policy";

describe("player policy", () => {
  it("normalizes and validates a display name", () => {
    expect(normalizeDisplayName("  Don   Luca ")).toBe("Don Luca");
    expect(validateDisplayName("Don Luca")).toBe("Don Luca");
  });

  it("provides explicit initial player values", () => {
    expect(buildInitialPlayerValues("Don Luca")).toMatchObject({
      displayName: "Don Luca",
      cash: 2500,
      respect: 0,
      energy: 100,
      health: 100
    });
  });

  it("rejects invalid display names", () => {
    expect(() => validateDisplayName("ab")).toThrowError(/at least/i);
    expect(() => validateDisplayName("bad*name")).toThrowError(/only contain/i);
  });

  it("regenerates energy by one point per elapsed minute", () => {
    expect(
      regeneratePlayerEnergy(
        {
          energy: 10,
          energyUpdatedAt: new Date("2026-03-19T19:00:00.000Z"),
          updatedAt: new Date("2026-03-19T19:00:00.000Z")
        },
        new Date("2026-03-19T19:05:30.000Z")
      )
    ).toEqual({
      energy: 15,
      energyUpdatedAt: new Date("2026-03-19T19:05:00.000Z")
    });
  });

  it("caps regenerated energy at the max and discards capped overflow time", () => {
    expect(
      regeneratePlayerEnergy(
        {
          energy: 98,
          energyUpdatedAt: new Date("2026-03-19T19:00:00.000Z"),
          updatedAt: new Date("2026-03-19T19:00:00.000Z")
        },
        new Date("2026-03-19T19:10:00.000Z")
      )
    ).toEqual({
      energy: 100,
      energyUpdatedAt: new Date("2026-03-19T19:10:00.000Z")
    });
  });
});
