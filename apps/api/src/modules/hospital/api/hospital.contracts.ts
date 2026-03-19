export interface HospitalStatusResponseBody {
  playerId: string;
  active: boolean;
  until: string | null;
  remainingSeconds: number;
}
