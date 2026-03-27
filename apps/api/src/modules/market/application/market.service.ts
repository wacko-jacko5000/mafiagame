import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException
} from "@nestjs/common";

import { getEquipmentItemById } from "../../inventory/domain/inventory.catalog";
import { PlayerService } from "../../player/application/player.service";
import { DomainEventsService } from "../../../platform/domain-events/domain-events.service";
import {
  MarketListingAlreadyActiveForItemError,
  MarketListingCancellationPermissionError,
  MarketListingEquippedItemError,
  MarketListingInsufficientCashError,
  MarketListingInventoryItemNotFoundError,
  MarketListingNotActiveError,
  MarketListingNotFoundError,
  MarketListingOwnershipRequiredError,
  MarketListingSelfPurchaseError,
  MarketListingSettlementLockError
} from "../domain/market.errors";
import { validateMarketListingPrice } from "../domain/market.policy";
import type {
  BuyMarketListingCommand,
  CancelMarketListingCommand,
  CreateMarketListingCommand,
  MarketListingSummary,
  MarketPurchaseResult
} from "../domain/market.types";
import {
  MARKET_REPOSITORY,
  type MarketRepository
} from "./market.repository";

@Injectable()
export class MarketService {
  constructor(
    @Inject(PlayerService)
    private readonly playerService: PlayerService,
    @Inject(DomainEventsService)
    private readonly domainEventsService: DomainEventsService,
    @Inject(MARKET_REPOSITORY)
    private readonly marketRepository: MarketRepository
  ) {}

  async listListings(): Promise<MarketListingSummary[]> {
    const listings = await this.marketRepository.listListings();
    return listings.map((listing) => this.toMarketListingSummary(listing));
  }

  async getListingById(listingId: string): Promise<MarketListingSummary> {
    const listing = await this.marketRepository.findListingById(listingId);

    if (!listing) {
      throw new NotFoundException(new MarketListingNotFoundError(listingId).message);
    }

    return this.toMarketListingSummary(listing);
  }

  async createListing(command: CreateMarketListingCommand): Promise<MarketListingSummary> {
    await this.playerService.getPlayerById(command.playerId);

    try {
      validateMarketListingPrice(command.price);
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }

    const result = await this.marketRepository.createListing(command);

    if (result.status === "inventory_item_not_found") {
      throw new NotFoundException(
        new MarketListingInventoryItemNotFoundError(command.inventoryItemId).message
      );
    }

    if (result.status === "not_owner") {
      throw new ConflictException(
        new MarketListingOwnershipRequiredError(command.inventoryItemId, command.playerId).message
      );
    }

    if (result.status === "item_equipped") {
      throw new ConflictException(
        new MarketListingEquippedItemError(command.inventoryItemId).message
      );
    }

    if (result.status === "item_already_listed") {
      throw new ConflictException(
        new MarketListingAlreadyActiveForItemError(command.inventoryItemId).message
      );
    }

    return this.toMarketListingSummary(result.listing!);
  }

  async cancelListing(command: CancelMarketListingCommand): Promise<MarketListingSummary> {
    await this.playerService.getPlayerById(command.playerId);

    const result = await this.marketRepository.cancelListing(command);

    if (result.status === "listing_not_found") {
      throw new NotFoundException(new MarketListingNotFoundError(command.listingId).message);
    }

    if (result.status === "not_seller") {
      throw new ConflictException(
        new MarketListingCancellationPermissionError(command.listingId, command.playerId).message
      );
    }

    if (result.status === "listing_not_active") {
      throw new ConflictException(new MarketListingNotActiveError(command.listingId).message);
    }

    return this.toMarketListingSummary(result.listing!);
  }

  async buyListing(command: BuyMarketListingCommand): Promise<MarketPurchaseResult> {
    await this.playerService.getPlayerById(command.buyerPlayerId);

    const result = await this.marketRepository.buyListing(command);

    if (result.status === "listing_not_found") {
      throw new NotFoundException(new MarketListingNotFoundError(command.listingId).message);
    }

    if (result.status === "listing_not_active") {
      throw new ConflictException(new MarketListingNotActiveError(command.listingId).message);
    }

    if (result.status === "seller_missing" || result.status === "buyer_missing") {
      throw new NotFoundException(new MarketListingNotFoundError(command.listingId).message);
    }

    if (result.status === "cannot_buy_own_listing") {
      throw new ConflictException(
        new MarketListingSelfPurchaseError(command.listingId, command.buyerPlayerId).message
      );
    }

    if (result.status === "insufficient_cash") {
      throw new BadRequestException(
        new MarketListingInsufficientCashError(command.listingId, command.buyerPlayerId).message
      );
    }

    if (result.status === "inventory_lock_missing") {
      throw new ConflictException(
        new MarketListingSettlementLockError(command.listingId).message
      );
    }

    const purchaseResult = {
      listing: this.toMarketListingSummary(result.listing!),
      transferredInventoryItemId: result.listing!.inventoryItemId,
      sellerPlayerId: result.listing!.sellerPlayerId,
      buyerPlayerId: result.listing!.buyerPlayerId!,
      buyerCashAfterPurchase: result.buyerCashAfterPurchase!,
      sellerCashAfterSale: result.sellerCashAfterSale!
    };

    await this.domainEventsService.publish({
      type: "market.item_sold",
      occurredAt: result.listing!.soldAt ?? new Date(),
      listingId: result.listing!.id,
      inventoryItemId: result.listing!.inventoryItemId,
      itemId: result.listing!.itemId,
      itemName: purchaseResult.listing.itemName,
      sellerPlayerId: result.listing!.sellerPlayerId,
      buyerPlayerId: result.listing!.buyerPlayerId!,
      price: result.listing!.price
    });

    return purchaseResult;
  }

  private toMarketListingSummary(listing: {
    id: string;
    inventoryItemId: string;
    sellerPlayerId: string;
    buyerPlayerId: string | null;
    itemId: string;
    price: number;
    status: "active" | "sold" | "cancelled";
    createdAt: Date;
    soldAt: Date | null;
  }): MarketListingSummary {
    const item = getEquipmentItemById(listing.itemId);

    if (!item) {
      throw new NotFoundException(`Market item definition "${listing.itemId}" was not found.`);
    }

    return {
      id: listing.id,
      inventoryItemId: listing.inventoryItemId,
      sellerPlayerId: listing.sellerPlayerId,
      buyerPlayerId: listing.buyerPlayerId,
      itemId: listing.itemId,
      itemName: item.name,
      itemType: item.type,
      price: listing.price,
      status: listing.status,
      createdAt: listing.createdAt,
      soldAt: listing.soldAt
    };
  }
}
