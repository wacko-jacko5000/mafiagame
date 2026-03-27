"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toJailStatusResponseBody = toJailStatusResponseBody;
exports.toJailBuyoutStatusResponseBody = toJailBuyoutStatusResponseBody;
exports.toJailBuyoutResponseBody = toJailBuyoutResponseBody;
const player_presenter_1 = require("../../player/api/player.presenter");
function toJailStatusResponseBody(status) {
    return {
        playerId: status.playerId,
        active: status.active,
        until: status.until?.toISOString() ?? null,
        remainingSeconds: status.remainingSeconds
    };
}
function toJailBuyoutStatusResponseBody(quote) {
    return {
        statusType: "jail",
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
function toJailBuyoutResponseBody(input) {
    return {
        buyoutPrice: input.buyoutPrice,
        player: (0, player_presenter_1.toPlayerResponseBody)(input.player)
    };
}
