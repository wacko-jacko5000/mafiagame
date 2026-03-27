"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toMarketListingResponseBody = toMarketListingResponseBody;
exports.toMarketPurchaseResponseBody = toMarketPurchaseResponseBody;
function toMarketListingResponseBody(listing) {
    return {
        id: listing.id,
        inventoryItemId: listing.inventoryItemId,
        sellerPlayerId: listing.sellerPlayerId,
        buyerPlayerId: listing.buyerPlayerId,
        itemId: listing.itemId,
        itemName: listing.itemName,
        itemType: listing.itemType,
        price: listing.price,
        status: listing.status,
        createdAt: listing.createdAt.toISOString(),
        soldAt: listing.soldAt?.toISOString() ?? null
    };
}
function toMarketPurchaseResponseBody(result) {
    return {
        listing: toMarketListingResponseBody(result.listing),
        transferredInventoryItemId: result.transferredInventoryItemId,
        sellerPlayerId: result.sellerPlayerId,
        buyerPlayerId: result.buyerPlayerId,
        buyerCashAfterPurchase: result.buyerCashAfterPurchase,
        sellerCashAfterSale: result.sellerCashAfterSale
    };
}
