import { describe, expect, it } from "vitest";

import {
  buildStickyMenuUpdatePayload,
  createStickyMenuPlacementState,
  defaultStickyMenuConfig,
  isStickyMenuDestinationActive
} from "./sticky-menu";

describe("sticky-menu helpers", () => {
  it("builds ordered update payloads from placement state", () => {
    const placements = createStickyMenuPlacementState(defaultStickyMenuConfig).map((entry) =>
      entry.key === "inventory"
        ? { ...entry, placement: "primary" as const, order: 2 }
        : entry.key === "crimes"
          ? { ...entry, placement: "more" as const, order: 3 }
          : entry
    );

    const payload = buildStickyMenuUpdatePayload({
      headerEnabled: true,
      resourceKeys: ["cash", "respect", "energy"],
      placements
    });

    expect(payload.primaryItems).toContain("inventory");
    expect(payload.moreItems).toContain("crimes");
    expect(payload.moreItems).not.toContain("more");
  });

  it("matches active routes safely", () => {
    expect(isStickyMenuDestinationActive("home", "/")).toBe(true);
    expect(isStickyMenuDestinationActive("market", "/market")).toBe(true);
    expect(isStickyMenuDestinationActive("market", "/market/listings")).toBe(true);
    expect(isStickyMenuDestinationActive("more", "/market")).toBe(false);
  });
});
