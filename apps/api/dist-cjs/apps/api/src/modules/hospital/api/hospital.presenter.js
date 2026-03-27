"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toHospitalStatusResponseBody = toHospitalStatusResponseBody;
exports.toHospitalBuyoutStatusResponseBody = toHospitalBuyoutStatusResponseBody;
exports.toHospitalBuyoutResponseBody = toHospitalBuyoutResponseBody;
const player_presenter_1 = require("../../player/api/player.presenter");
function toHospitalStatusResponseBody(status) {
    return {
        playerId: status.playerId,
        active: status.active,
        until: status.until?.toISOString() ?? null,
        remainingSeconds: status.remainingSeconds
    };
}
function toHospitalBuyoutStatusResponseBody(quote) {
    return {
        statusType: "hospital",
        active: quote.active,
        until: quote.until?.toISOString() ?? null,
        remainingSeconds: quote.remainingSeconds,
        reason: quote.reason,
        entryCountSinceLevelReset: quote.entryCountSinceLevelReset,
        repeatCountSinceLevelReset: quote.repeatCountSinceLevelReset,
        basePricePerMinute: quote.basePricePerMinute,
        currentPricePerMinute: quote.currentPricePerMinute,
        escalationEnabled: quote.escalationEnabled,
        escalationPercentage: quote.escalationPercentage,
        minimumPrice: quote.minimumPrice,
        roundingRule: quote.roundingRule,
        buyoutPrice: quote.buyoutPrice
    };
}
function toHospitalBuyoutResponseBody(input) {
    return {
        buyoutPrice: input.buyoutPrice,
        player: (0, player_presenter_1.toPlayerResponseBody)(input.player)
    };
}
