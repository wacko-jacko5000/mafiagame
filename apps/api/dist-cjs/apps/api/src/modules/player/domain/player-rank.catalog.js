"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.playerRankCatalog = void 0;
exports.getPlayerRankByLevel = getPlayerRankByLevel;
exports.playerRankCatalog = [
    { level: 1, rank: "Scum", minRespect: 0 },
    { level: 2, rank: "Empty Suit", minRespect: 100 },
    { level: 3, rank: "Delivery Boy", minRespect: 250 },
    { level: 4, rank: "Outsider", minRespect: 500 },
    { level: 5, rank: "Picciotto", minRespect: 900 },
    { level: 6, rank: "Shoplifter", minRespect: 1500 },
    { level: 7, rank: "Pickpocket", minRespect: 2400 },
    { level: 8, rank: "Thief", minRespect: 3700 },
    { level: 9, rank: "Associate", minRespect: 5500 },
    { level: 10, rank: "Mobster", minRespect: 8000 },
    { level: 11, rank: "Soldier", minRespect: 11500 },
    { level: 12, rank: "Swindler", minRespect: 16500 },
    { level: 13, rank: "Assassin", minRespect: 23500 },
    { level: 14, rank: "Local Chief", minRespect: 33500 },
    { level: 15, rank: "Chief", minRespect: 47500 },
    { level: 16, rank: "Caporegime", minRespect: 67500 },
    { level: 17, rank: "Underboss", minRespect: 95500 },
    { level: 18, rank: "Consigliere", minRespect: 135500 },
    { level: 19, rank: "Godfather", minRespect: 190500 },
    { level: 20, rank: "Don", minRespect: 265500 },
    { level: 21, rank: "Legendary Don", minRespect: 365500 }
];
function getPlayerRankByLevel(level) {
    return exports.playerRankCatalog.find((rank) => rank.level === level);
}
