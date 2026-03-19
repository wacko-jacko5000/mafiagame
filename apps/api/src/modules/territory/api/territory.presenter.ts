import type {
  DistrictPayoutClaimResult,
  DistrictSummary,
  DistrictWarSummary,
  ResolveDistrictWarResult
} from "../domain/territory.types";
import type {
  DistrictResponseBody,
  DistrictPayoutClaimResponseBody,
  DistrictWarResponseBody,
  ResolveDistrictWarResponseBody
} from "./territory.contracts";

export function toDistrictResponseBody(
  district: DistrictSummary
): DistrictResponseBody {
  return {
    id: district.id,
    name: district.name,
    payout: {
      amount: district.payout.amount,
      cooldownMinutes: district.payout.cooldownMinutes,
      lastClaimedAt: district.payout.lastClaimedAt?.toISOString() ?? null,
      nextClaimAvailableAt: district.payout.nextClaimAvailableAt?.toISOString() ?? null
    },
    createdAt: district.createdAt.toISOString(),
    controller: district.controller
      ? {
          gangId: district.controller.gangId,
          gangName: district.controller.gangName,
          capturedAt: district.controller.capturedAt.toISOString()
        }
      : null,
    activeWar: district.activeWar ? toDistrictWarResponseBody(district.activeWar) : null
  };
}

export function toDistrictPayoutClaimResponseBody(
  result: DistrictPayoutClaimResult
): DistrictPayoutClaimResponseBody {
  return {
    district: toDistrictResponseBody(result.district),
    payoutAmount: result.payoutAmount,
    claimedAt: result.claimedAt.toISOString(),
    paidToPlayerId: result.paidToPlayerId,
    playerCashAfterClaim: result.playerCashAfterClaim
  };
}

export function toDistrictWarResponseBody(
  war: DistrictWarSummary
): DistrictWarResponseBody {
  return {
    id: war.id,
    districtId: war.districtId,
    attackerGangId: war.attackerGangId,
    attackerGangName: war.attackerGangName,
    defenderGangId: war.defenderGangId,
    defenderGangName: war.defenderGangName,
    startedByPlayerId: war.startedByPlayerId,
    status: war.status,
    createdAt: war.createdAt.toISOString(),
    resolvedAt: war.resolvedAt?.toISOString() ?? null,
    winningGangId: war.winningGangId,
    winningGangName: war.winningGangName
  };
}

export function toResolveDistrictWarResponseBody(
  result: ResolveDistrictWarResult
): ResolveDistrictWarResponseBody {
  return {
    war: toDistrictWarResponseBody(result.war),
    district: toDistrictResponseBody(result.district)
  };
}
