import type {
  MarketListingSummary,
  MarketPurchaseResult
} from "../domain/market.types";
import type {
  MarketListingResponseBody,
  MarketPurchaseResponseBody
} from "./market.contracts";

export function toMarketListingResponseBody(
  listing: MarketListingSummary
): MarketListingResponseBody {
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

export function toMarketPurchaseResponseBody(
  result: MarketPurchaseResult
): MarketPurchaseResponseBody {
  return {
    listing: toMarketListingResponseBody(result.listing),
    transferredInventoryItemId: result.transferredInventoryItemId,
    sellerPlayerId: result.sellerPlayerId,
    buyerPlayerId: result.buyerPlayerId,
    buyerCashAfterPurchase: result.buyerCashAfterPurchase,
    sellerCashAfterSale: result.sellerCashAfterSale
  };
}
