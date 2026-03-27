"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toDistrictResponseBody = toDistrictResponseBody;
exports.toDistrictPayoutClaimResponseBody = toDistrictPayoutClaimResponseBody;
exports.toDistrictWarResponseBody = toDistrictWarResponseBody;
exports.toResolveDistrictWarResponseBody = toResolveDistrictWarResponseBody;
function toDistrictResponseBody(district) {
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
function toDistrictPayoutClaimResponseBody(result) {
    return {
        district: toDistrictResponseBody(result.district),
        payoutAmount: result.payoutAmount,
        claimedAt: result.claimedAt.toISOString(),
        paidToPlayerId: result.paidToPlayerId,
        playerCashAfterClaim: result.playerCashAfterClaim
    };
}
function toDistrictWarResponseBody(war) {
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
function toResolveDistrictWarResponseBody(result) {
    return {
        war: toDistrictWarResponseBody(result.war),
        district: toDistrictResponseBody(result.district)
    };
}
