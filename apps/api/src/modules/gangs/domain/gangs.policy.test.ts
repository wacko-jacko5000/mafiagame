import { describe, expect, it } from "vitest";

import { InvalidGangNameError } from "./gangs.errors";
import { buildCreateGangValues, normalizeGangName, validateGangName } from "./gangs.policy";

describe("gangs.policy", () => {
  it("normalizes gang names before persistence", () => {
    expect(normalizeGangName("  Night   Owls  ")).toBe("Night Owls");
    expect(
      buildCreateGangValues(crypto.randomUUID(), "  Night   Owls  ").name
    ).toBe("Night Owls");
  });

  it("rejects invalid gang names", () => {
    expect(() => validateGangName("x")).toThrow(InvalidGangNameError);
    expect(() => validateGangName("Bad*Name")).toThrow(InvalidGangNameError);
  });
});
