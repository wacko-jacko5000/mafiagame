"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketService = void 0;
const common_1 = require("@nestjs/common");
const inventory_catalog_1 = require("../../inventory/domain/inventory.catalog");
const player_service_1 = require("../../player/application/player.service");
const domain_events_service_1 = require("../../../platform/domain-events/domain-events.service");
const market_errors_1 = require("../domain/market.errors");
const market_policy_1 = require("../domain/market.policy");
const market_repository_1 = require("./market.repository");
let MarketService = class MarketService {
    playerService;
    domainEventsService;
    marketRepository;
    constructor(playerService, domainEventsService, marketRepository) {
        this.playerService = playerService;
        this.domainEventsService = domainEventsService;
        this.marketRepository = marketRepository;
    }
    async listListings() {
        const listings = await this.marketRepository.listListings();
        return listings.map((listing) => this.toMarketListingSummary(listing));
    }
    async getListingById(listingId) {
        const listing = await this.marketRepository.findListingById(listingId);
        if (!listing) {
            throw new common_1.NotFoundException(new market_errors_1.MarketListingNotFoundError(listingId).message);
        }
        return this.toMarketListingSummary(listing);
    }
    async createListing(command) {
        await this.playerService.getPlayerById(command.playerId);
        try {
            (0, market_policy_1.validateMarketListingPrice)(command.price);
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
        const result = await this.marketRepository.createListing(command);
        if (result.status === "inventory_item_not_found") {
            throw new common_1.NotFoundException(new market_errors_1.MarketListingInventoryItemNotFoundError(command.inventoryItemId).message);
        }
        if (result.status === "not_owner") {
            throw new common_1.ConflictException(new market_errors_1.MarketListingOwnershipRequiredError(command.inventoryItemId, command.playerId).message);
        }
        if (result.status === "item_equipped") {
            throw new common_1.ConflictException(new market_errors_1.MarketListingEquippedItemError(command.inventoryItemId).message);
        }
        if (result.status === "item_already_listed") {
            throw new common_1.ConflictException(new market_errors_1.MarketListingAlreadyActiveForItemError(command.inventoryItemId).message);
        }
        return this.toMarketListingSummary(result.listing);
    }
    async cancelListing(command) {
        await this.playerService.getPlayerById(command.playerId);
        const result = await this.marketRepository.cancelListing(command);
        if (result.status === "listing_not_found") {
            throw new common_1.NotFoundException(new market_errors_1.MarketListingNotFoundError(command.listingId).message);
        }
        if (result.status === "not_seller") {
            throw new common_1.ConflictException(new market_errors_1.MarketListingCancellationPermissionError(command.listingId, command.playerId).message);
        }
        if (result.status === "listing_not_active") {
            throw new common_1.ConflictException(new market_errors_1.MarketListingNotActiveError(command.listingId).message);
        }
        return this.toMarketListingSummary(result.listing);
    }
    async buyListing(command) {
        await this.playerService.getPlayerById(command.buyerPlayerId);
        const result = await this.marketRepository.buyListing(command);
        if (result.status === "listing_not_found") {
            throw new common_1.NotFoundException(new market_errors_1.MarketListingNotFoundError(command.listingId).message);
        }
        if (result.status === "listing_not_active") {
            throw new common_1.ConflictException(new market_errors_1.MarketListingNotActiveError(command.listingId).message);
        }
        if (result.status === "seller_missing" || result.status === "buyer_missing") {
            throw new common_1.NotFoundException(new market_errors_1.MarketListingNotFoundError(command.listingId).message);
        }
        if (result.status === "cannot_buy_own_listing") {
            throw new common_1.ConflictException(new market_errors_1.MarketListingSelfPurchaseError(command.listingId, command.buyerPlayerId).message);
        }
        if (result.status === "insufficient_cash") {
            throw new common_1.BadRequestException(new market_errors_1.MarketListingInsufficientCashError(command.listingId, command.buyerPlayerId).message);
        }
        if (result.status === "inventory_lock_missing") {
            throw new common_1.ConflictException(new market_errors_1.MarketListingSettlementLockError(command.listingId).message);
        }
        const purchaseResult = {
            listing: this.toMarketListingSummary(result.listing),
            transferredInventoryItemId: result.listing.inventoryItemId,
            sellerPlayerId: result.listing.sellerPlayerId,
            buyerPlayerId: result.listing.buyerPlayerId,
            buyerCashAfterPurchase: result.buyerCashAfterPurchase,
            sellerCashAfterSale: result.sellerCashAfterSale
        };
        await this.domainEventsService.publish({
            type: "market.item_sold",
            occurredAt: result.listing.soldAt ?? new Date(),
            listingId: result.listing.id,
            inventoryItemId: result.listing.inventoryItemId,
            itemId: result.listing.itemId,
            itemName: purchaseResult.listing.itemName,
            sellerPlayerId: result.listing.sellerPlayerId,
            buyerPlayerId: result.listing.buyerPlayerId,
            price: result.listing.price
        });
        return purchaseResult;
    }
    toMarketListingSummary(listing) {
        const item = (0, inventory_catalog_1.getEquipmentItemById)(listing.itemId);
        if (!item) {
            throw new common_1.NotFoundException(`Market item definition "${listing.itemId}" was not found.`);
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
};
exports.MarketService = MarketService;
exports.MarketService = MarketService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(player_service_1.PlayerService)),
    __param(1, (0, common_1.Inject)(domain_events_service_1.DomainEventsService)),
    __param(2, (0, common_1.Inject)(market_repository_1.MARKET_REPOSITORY)),
    __metadata("design:paramtypes", [player_service_1.PlayerService,
        domain_events_service_1.DomainEventsService, Object])
], MarketService);
