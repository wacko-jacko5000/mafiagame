import type { HospitalStatus } from "./hospital.types";

export function buildHospitalReleaseTime(
  now: Date,
  durationSeconds: number
): Date {
  return new Date(now.getTime() + durationSeconds * 1000);
}

export function getHospitalStatus(
  playerId: string,
  hospitalizedUntil: Date | null,
  now: Date
): HospitalStatus {
  if (!hospitalizedUntil || hospitalizedUntil.getTime() <= now.getTime()) {
    return {
      playerId,
      active: false,
      until: null,
      remainingSeconds: 0,
      reason: null
    };
  }

  return {
    playerId,
    active: true,
    until: hospitalizedUntil,
    remainingSeconds: Math.ceil(
      (hospitalizedUntil.getTime() - now.getTime()) / 1000
    ),
    reason: null
  };
}
