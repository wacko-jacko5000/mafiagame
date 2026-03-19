import { describe, expect, it } from "vitest";

import { moduleCatalog } from "./game-modules";

describe("moduleCatalog", () => {
  it("contains unique module keys", () => {
    const keys = moduleCatalog.map((module) => module.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("declares a purpose and at least one interface touchpoint for every module", () => {
    for (const module of moduleCatalog) {
      expect(module.purpose.length).toBeGreaterThan(10);
      expect(module.emits.length + module.consumes.length).toBeGreaterThan(0);
    }
  });
});
