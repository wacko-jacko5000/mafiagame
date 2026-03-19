export interface DistrictControllerResponseBody {
  gangId: string;
  gangName: string;
  capturedAt: string;
}

export interface DistrictPayoutResponseBody {
  amount: number;
  cooldownMinutes: number;
  lastClaimedAt: string | null;
  nextClaimAvailableAt: string | null;
}

export interface DistrictWarResponseBody {
  id: string;
  districtId: string;
  attackerGangId: string;
  attackerGangName: string;
  defenderGangId: string;
  defenderGangName: string;
  startedByPlayerId: string;
  status: "pending" | "resolved";
  createdAt: string;
  resolvedAt: string | null;
  winningGangId: string | null;
  winningGangName: string | null;
}

export interface DistrictResponseBody {
  id: string;
  name: string;
  payout: DistrictPayoutResponseBody;
  createdAt: string;
  controller: DistrictControllerResponseBody | null;
  activeWar: DistrictWarResponseBody | null;
}

export interface ClaimDistrictRequestBody {
  playerId: string;
  gangId: string;
}

export interface StartDistrictWarRequestBody {
  playerId: string;
  attackerGangId: string;
}

export interface ClaimDistrictPayoutRequestBody {
  playerId: string;
  gangId: string;
}

export interface ResolveDistrictWarRequestBody {
  winningGangId: string;
}

export interface ResolveDistrictWarResponseBody {
  war: DistrictWarResponseBody;
  district: DistrictResponseBody;
}

export interface DistrictPayoutClaimResponseBody {
  district: DistrictResponseBody;
  payoutAmount: number;
  claimedAt: string;
  paidToPlayerId: string;
  playerCashAfterClaim: number;
}
