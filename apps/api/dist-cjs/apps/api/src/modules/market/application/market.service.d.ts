import { PlayerService } from "../../player/application/player.service";
import { DomainEventsService } from "../../../platform/domain-events/domain-events.service";
import type { BuyMarketListingCommand, CancelMarketListingCommand, CreateMarketListingCommand, MarketListingSummary, MarketPurchaseResult } from "../domain/market.types";
import { type MarketRepository } from "./market.repository";
export declare class MarketService {
    private readonly playerService;
    private readonly domainEventsService;
    private readonly marketRepository;
    constructor(playerService: PlayerService, domainEventsService: DomainEventsService, marketRepository: MarketRepository);
    listListings(): Promise<MarketListingSummary[]>;
    getListingById(listingId: string): Promise<MarketListingSummary>;
    createListing(command: CreateMarketListingCommand): Promise<MarketListingSummary>;
    cancelListing(command: CancelMarketListingCommand): Promise<MarketListingSummary>;
    buyListing(command: BuyMarketListingCommand): Promise<MarketPurchaseResult>;
    private toMarketListingSummary;
}
