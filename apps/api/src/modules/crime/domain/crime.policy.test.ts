import { describe, expect, it } from "vitest";

import { getCrimeById, starterCrimeCatalog } from "./crime.catalog";
import { resolveCrimeOutcome } from "./crime.policy";

describe("crime catalog", () => {
  it("contains the full level-gated crime catalog", () => {
    expect(starterCrimeCatalog).toHaveLength(84);
    expect(starterCrimeCatalog[0]).toMatchObject({
      id: "pickpocket",
      unlockLevel: 1
    });
    expect(starterCrimeCatalog.at(-1)).toMatchObject({
      id: "ultimate-power-play",
      unlockLevel: 21
    });
    expect(getCrimeById("shoplift-candy")?.name).toBe("Shoplift Candy");
  });
});

describe("resolveCrimeOutcome", () => {
  it("returns success rewards when the roll succeeds", () => {
    const crime = getCrimeById("pickpocket");

    expect(crime).toBeDefined();
    expect(resolveCrimeOutcome(crime!, 0.3)).toMatchObject({
      crimeId: "pickpocket",
      success: true,
      energySpent: 10,
      respectAwarded: 1,
      consequence: {
        type: "none",
        activeUntil: null
      }
    });
  });

  it("returns a failure result without rewards when the roll fails", () => {
    const crime = getCrimeById("mug-civilian");

    expect(crime).toBeDefined();
    expect(resolveCrimeOutcome(crime!, 0.9)).toEqual({
      crimeId: "mug-civilian",
      success: false,
      energySpent: 22,
      cashAwarded: 0,
      respectAwarded: 0,
      consequence: {
        type: "hospital",
        activeUntil: null
      }
    });
  });
});
