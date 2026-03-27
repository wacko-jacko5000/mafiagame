import type { HospitalStatus } from "./hospital.types";
export declare function buildHospitalReleaseTime(now: Date, durationSeconds: number): Date;
export declare function getHospitalStatus(playerId: string, hospitalizedUntil: Date | null, now: Date): HospitalStatus;
