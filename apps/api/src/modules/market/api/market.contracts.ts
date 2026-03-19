export interface MarketListingResponseBody {
  id: string;
  inventoryItemId: string;
  sellerPlayerId: string;
  buyerPlayerId: string | null;
  itemId: string;
  itemName: string;
  itemType: string;
  price: number;
  status: "active" | "sold" | "cancelled";
  createdAt: string;
  soldAt: string | null;
}

export interface MarketPurchaseResponseBody {
  listing: MarketListingResponseBody;
  transferredInventoryItemId: string;
  sellerPlayerId: string;
  buyerPlayerId: string;
  buyerCashAfterPurchase: number;
  sellerCashAfterSale: number;
}
