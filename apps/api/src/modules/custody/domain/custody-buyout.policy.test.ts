import { describe, expect, it } from "vitest";

import {
  calculateCustodyBuyoutPrice,
  calculateCustodyPricePerMinute
} from "./custody-buyout.policy";

describe("custody buyout policy", () => {
  it("applies linear escalation on the base price", () => {
    expect(
      calculateCustodyPricePerMinute({
        basePricePerMinute: 100,
        entryCountSinceLevelReset: 1,
        escalationEnabled: true,
        escalationPercentage: 0.1
      })
    ).toBe(100);

    expect(
      calculateCustodyPricePerMinute({
        basePricePerMinute: 100,
        entryCountSinceLevelReset: 4,
        escalationEnabled: true,
        escalationPercentage: 0.1
      })
    ).toBe(130);
  });

  it("always rounds the final buyout price up", () => {
    expect(
      calculateCustodyBuyoutPrice({
        remainingSeconds: 95,
        currentPricePerMinute: 123,
        minimumPrice: null,
        roundingRule: "ceil"
      })
    ).toBe(195);
  });
});
