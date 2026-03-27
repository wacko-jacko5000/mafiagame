export interface HospitalStatusResponseBody {
  playerId: string;
  active: boolean;
  until: string | null;
  remainingSeconds: number;
}

export interface HospitalBuyoutStatusResponseBody {
  statusType: "hospital";
  active: boolean;
  until: string | null;
  remainingSeconds: number;
  reason: string | null;
  entryCountSinceLevelReset: number;
  repeatCountSinceLevelReset: number;
  basePricePerMinute: number | null;
  currentPricePerMinute: number | null;
  escalationEnabled: boolean;
  escalationPercentage: number;
  minimumPrice: number | null;
  roundingRule: "ceil";
  buyoutPrice: number | null;
}

export interface HospitalBuyoutResponseBody {
  buyoutPrice: number;
  player: import("../../player/api/player.contracts").PlayerResponseBody;
}
