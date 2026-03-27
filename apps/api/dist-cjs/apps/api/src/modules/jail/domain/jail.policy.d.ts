import type { JailStatus } from "./jail.types";
export declare function buildJailReleaseTime(now: Date, durationSeconds: number): Date;
export declare function getJailStatus(playerId: string, jailedUntil: Date | null, now: Date): JailStatus;
