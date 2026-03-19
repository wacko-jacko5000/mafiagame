import type {
  BuyMarketListingCommand,
  BuyMarketListingResult,
  CancelMarketListingCommand,
  CancelMarketListingResult,
  CreateMarketListingCommand,
  CreateMarketListingResult,
  MarketListingSnapshot
} from "../domain/market.types";

export const MARKET_REPOSITORY = Symbol("MARKET_REPOSITORY");

export interface MarketRepository {
  listListings(): Promise<MarketListingSnapshot[]>;
  findListingById(listingId: string): Promise<MarketListingSnapshot | null>;
  createListing(command: CreateMarketListingCommand): Promise<CreateMarketListingResult>;
  cancelListing(command: CancelMarketListingCommand): Promise<CancelMarketListingResult>;
  buyListing(command: BuyMarketListingCommand): Promise<BuyMarketListingResult>;
}
