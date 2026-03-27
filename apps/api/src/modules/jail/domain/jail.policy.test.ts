import { describe, expect, it } from "vitest";

import { buildJailReleaseTime, getJailStatus } from "./jail.policy";

describe("jail policy", () => {
  it("builds a jail release time from the current time", () => {
    const now = new Date("2026-03-16T20:00:00.000Z");

    expect(buildJailReleaseTime(now, 300).toISOString()).toBe(
      "2026-03-16T20:05:00.000Z"
    );
  });

  it("treats expired jail timestamps as inactive", () => {
    const now = new Date("2026-03-16T20:05:01.000Z");
    const jailedUntil = new Date("2026-03-16T20:05:00.000Z");

    expect(getJailStatus("player-1", jailedUntil, now)).toEqual({
      playerId: "player-1",
      active: false,
      until: null,
      remainingSeconds: 0,
      reason: null
    });
  });
});
