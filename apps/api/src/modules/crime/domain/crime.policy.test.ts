import { describe, expect, it } from "vitest";

import { getCrimeById, starterCrimeCatalog } from "./crime.catalog";
import { resolveCrimeOutcome } from "./crime.policy";

describe("crime catalog", () => {
  it("contains the starter crimes", () => {
    expect(starterCrimeCatalog.map((crime) => crime.id)).toEqual([
      "pickpocket",
      "shoplift",
      "steal-bike"
    ]);
    expect(getCrimeById("shoplift")?.name).toBe("Shoplift");
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
    const crime = getCrimeById("steal-bike");

    expect(crime).toBeDefined();
    expect(resolveCrimeOutcome(crime!, 0.9)).toEqual({
      crimeId: "steal-bike",
      success: false,
      energySpent: 20,
      cashAwarded: 0,
      respectAwarded: 0,
      consequence: {
        type: "hospital",
        activeUntil: null
      }
    });
  });
});
