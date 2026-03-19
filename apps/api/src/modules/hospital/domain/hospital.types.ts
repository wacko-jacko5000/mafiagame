export interface HospitalStatus {
  playerId: string;
  active: boolean;
  until: Date | null;
  remainingSeconds: number;
}
