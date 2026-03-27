import { PrismaService } from "../../../platform/database/prisma.service";
import type { MarketRepository } from "../application/market.repository";
import type { BuyMarketListingCommand, BuyMarketListingResult, CancelMarketListingCommand, CancelMarketListingResult, CreateMarketListingCommand, CreateMarketListingResult, MarketListingSnapshot } from "../domain/market.types";
export declare class PrismaMarketRepository implements MarketRepository {
    private readonly prismaService;
    constructor(prismaService: PrismaService);
    listListings(): Promise<MarketListingSnapshot[]>;
    findListingById(listingId: string): Promise<MarketListingSnapshot | null>;
    createListing(command: CreateMarketListingCommand): Promise<CreateMarketListingResult>;
    cancelListing(command: CancelMarketListingCommand): Promise<CancelMarketListingResult>;
    buyListing(command: BuyMarketListingCommand): Promise<BuyMarketListingResult>;
}
