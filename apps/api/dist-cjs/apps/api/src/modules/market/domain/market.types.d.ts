export type MarketListingStatus = "active" | "sold" | "cancelled";
export interface MarketListingSnapshot {
    id: string;
    inventoryItemId: string;
    sellerPlayerId: string;
    buyerPlayerId: string | null;
    itemId: string;
    price: number;
    status: MarketListingStatus;
    createdAt: Date;
    soldAt: Date | null;
}
export interface MarketListingSummary {
    id: string;
    inventoryItemId: string;
    sellerPlayerId: string;
    buyerPlayerId: string | null;
    itemId: string;
    itemName: string;
    itemType: string;
    price: number;
    status: MarketListingStatus;
    createdAt: Date;
    soldAt: Date | null;
}
export interface CreateMarketListingCommand {
    playerId: string;
    inventoryItemId: string;
    price: number;
}
export interface CancelMarketListingCommand {
    listingId: string;
    playerId: string;
}
export interface BuyMarketListingCommand {
    listingId: string;
    buyerPlayerId: string;
}
export interface MarketPurchaseResult {
    listing: MarketListingSummary;
    transferredInventoryItemId: string;
    sellerPlayerId: string;
    buyerPlayerId: string;
    buyerCashAfterPurchase: number;
    sellerCashAfterSale: number;
}
export type CreateMarketListingStatus = "created" | "inventory_item_not_found" | "not_owner" | "item_equipped" | "item_already_listed";
export type CancelMarketListingStatus = "cancelled" | "listing_not_found" | "not_seller" | "listing_not_active";
export type BuyMarketListingStatus = "purchased" | "listing_not_found" | "listing_not_active" | "seller_missing" | "buyer_missing" | "cannot_buy_own_listing" | "insufficient_cash" | "inventory_lock_missing";
export interface CreateMarketListingResult {
    status: CreateMarketListingStatus;
    listing: MarketListingSnapshot | null;
}
export interface CancelMarketListingResult {
    status: CancelMarketListingStatus;
    listing: MarketListingSnapshot | null;
}
export interface BuyMarketListingResult {
    status: BuyMarketListingStatus;
    listing: MarketListingSnapshot | null;
    buyerCashAfterPurchase: number | null;
    sellerCashAfterSale: number | null;
}
