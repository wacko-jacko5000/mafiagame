"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildDefaultCustodyBuyoutConfig = buildDefaultCustodyBuyoutConfig;
const player_rank_catalog_1 = require("../../player/domain/player-rank.catalog");
const defaultBasePricePerMinuteByStatus = {
    jail: 100,
    hospital: 125
};
const defaultStatusLabels = {
    jail: "Jail",
    hospital: "Hospital"
};
function buildDefaultCustodyBuyoutConfig(statusType) {
    const baseRate = defaultBasePricePerMinuteByStatus[statusType];
    return {
        statusType,
        label: defaultStatusLabels[statusType],
        escalationEnabled: true,
        escalationPercentage: 0.1,
        minimumPrice: null,
        roundingRule: "ceil",
        levels: player_rank_catalog_1.playerRankCatalog.map((rank) => ({
            level: rank.level,
            rank: rank.rank,
            basePricePerMinute: rank.level * baseRate
        }))
    };
}
