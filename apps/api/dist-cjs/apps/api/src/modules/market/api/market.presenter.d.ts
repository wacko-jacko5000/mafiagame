import type { MarketListingSummary, MarketPurchaseResult } from "../domain/market.types";
import type { MarketListingResponseBody, MarketPurchaseResponseBody } from "./market.contracts";
export declare function toMarketListingResponseBody(listing: MarketListingSummary): MarketListingResponseBody;
export declare function toMarketPurchaseResponseBody(result: MarketPurchaseResult): MarketPurchaseResponseBody;
