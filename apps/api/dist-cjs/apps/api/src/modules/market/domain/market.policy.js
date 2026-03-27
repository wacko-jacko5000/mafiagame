"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateMarketListingPrice = validateMarketListingPrice;
const market_errors_1 = require("./market.errors");
function validateMarketListingPrice(price) {
    if (!Number.isInteger(price) || price <= 0) {
        throw new market_errors_1.MarketListingPriceInvalidError(price);
    }
    return price;
}
