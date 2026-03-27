"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultBasePricePerMinute = getDefaultBasePricePerMinute;
exports.getRepeatCountSinceLevelReset = getRepeatCountSinceLevelReset;
exports.calculateCustodyPricePerMinute = calculateCustodyPricePerMinute;
exports.calculateCustodyBuyoutPrice = calculateCustodyBuyoutPrice;
exports.buildInactiveCustodyBuyoutQuote = buildInactiveCustodyBuyoutQuote;
const custody_buyout_catalog_1 = require("./custody-buyout.catalog");
function getDefaultBasePricePerMinute(statusType, level) {
    const config = (0, custody_buyout_catalog_1.buildDefaultCustodyBuyoutConfig)(statusType);
    const levelConfig = config.levels.find((entry) => entry.level === level) ??
        config.levels[config.levels.length - 1];
    return levelConfig.basePricePerMinute;
}
function getRepeatCountSinceLevelReset(entryCountSinceLevelReset) {
    return Math.max(0, entryCountSinceLevelReset - 1);
}
function calculateCustodyPricePerMinute(input) {
    const repeatCountSinceLevelReset = getRepeatCountSinceLevelReset(input.entryCountSinceLevelReset);
    const multiplier = input.escalationEnabled
        ? 1 + repeatCountSinceLevelReset * input.escalationPercentage
        : 1;
    return input.basePricePerMinute * multiplier;
}
function calculateCustodyBuyoutPrice(input) {
    const rawTotalPrice = (input.currentPricePerMinute * input.remainingSeconds) / 60;
    const boundedPrice = Math.max(rawTotalPrice, input.minimumPrice ?? 0);
    if (input.roundingRule === "ceil") {
        return Math.ceil(boundedPrice);
    }
    return Math.ceil(boundedPrice);
}
function buildInactiveCustodyBuyoutQuote(statusType, config) {
    return {
        statusType,
        active: false,
        until: null,
        remainingSeconds: 0,
        reason: null,
        entryCountSinceLevelReset: 0,
        repeatCountSinceLevelReset: 0,
        basePricePerMinute: null,
        currentPricePerMinute: null,
        escalationEnabled: config.escalationEnabled,
        escalationPercentage: config.escalationPercentage,
        minimumPrice: config.minimumPrice,
        roundingRule: config.roundingRule,
        buyoutPrice: null
    };
}
