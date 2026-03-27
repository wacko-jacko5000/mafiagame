import { describe, expect, it } from "vitest";

import {
  buildHospitalReleaseTime,
  getHospitalStatus
} from "./hospital.policy";

describe("hospital policy", () => {
  it("builds a hospital release time from the current time", () => {
    const now = new Date("2026-03-16T20:00:00.000Z");

    expect(buildHospitalReleaseTime(now, 480).toISOString()).toBe(
      "2026-03-16T20:08:00.000Z"
    );
  });

  it("treats expired hospital timestamps as inactive", () => {
    const now = new Date("2026-03-16T20:08:01.000Z");
    const hospitalizedUntil = new Date("2026-03-16T20:08:00.000Z");

    expect(getHospitalStatus("player-1", hospitalizedUntil, now)).toEqual({
      playerId: "player-1",
      active: false,
      until: null,
      remainingSeconds: 0,
      reason: null
    });
  });
});
