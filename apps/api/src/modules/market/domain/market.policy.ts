import { MarketListingPriceInvalidError } from "./market.errors";

export function validateMarketListingPrice(price: number): number {
  if (!Number.isInteger(price) || price <= 0) {
    throw new MarketListingPriceInvalidError(price);
  }

  return price;
}
