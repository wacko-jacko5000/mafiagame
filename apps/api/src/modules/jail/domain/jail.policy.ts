import type { JailStatus } from "./jail.types";

export function buildJailReleaseTime(
  now: Date,
  durationSeconds: number
): Date {
  return new Date(now.getTime() + durationSeconds * 1000);
}

export function getJailStatus(
  playerId: string,
  jailedUntil: Date | null,
  now: Date
): JailStatus {
  if (!jailedUntil || jailedUntil.getTime() <= now.getTime()) {
    return {
      playerId,
      active: false,
      until: null,
      remainingSeconds: 0
    };
  }

  return {
    playerId,
    active: true,
    until: jailedUntil,
    remainingSeconds: Math.ceil((jailedUntil.getTime() - now.getTime()) / 1000)
  };
}
