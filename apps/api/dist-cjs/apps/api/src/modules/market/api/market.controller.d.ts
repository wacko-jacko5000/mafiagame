import { MarketService } from "../application/market.service";
import type { MarketListingResponseBody, MarketPurchaseResponseBody } from "./market.contracts";
export declare class MarketController {
    private readonly marketService;
    constructor(marketService: MarketService);
    listListings(): Promise<MarketListingResponseBody[]>;
    getListingById(listingId: string): Promise<MarketListingResponseBody>;
    createListing(playerId: string, inventoryItemId: string, price: number): Promise<MarketListingResponseBody>;
    buyListing(listingId: string, buyerPlayerId: string): Promise<MarketPurchaseResponseBody>;
    cancelListing(listingId: string, playerId: string): Promise<MarketListingResponseBody>;
}
