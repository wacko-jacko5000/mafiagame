export interface JailStatus {
  playerId: string;
  active: boolean;
  until: Date | null;
  remainingSeconds: number;
}
