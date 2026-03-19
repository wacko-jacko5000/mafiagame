export interface JailStatusResponseBody {
  playerId: string;
  active: boolean;
  until: string | null;
  remainingSeconds: number;
}
