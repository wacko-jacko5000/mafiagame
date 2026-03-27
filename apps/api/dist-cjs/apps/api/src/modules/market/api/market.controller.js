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
exports.MarketController = void 0;
const common_1 = require("@nestjs/common");
const market_service_1 = require("../application/market.service");
const market_presenter_1 = require("./market.presenter");
let MarketController = class MarketController {
    marketService;
    constructor(marketService) {
        this.marketService = marketService;
    }
    async listListings() {
        const listings = await this.marketService.listListings();
        return listings.map(market_presenter_1.toMarketListingResponseBody);
    }
    async getListingById(listingId) {
        const listing = await this.marketService.getListingById(listingId);
        return (0, market_presenter_1.toMarketListingResponseBody)(listing);
    }
    async createListing(playerId, inventoryItemId, price) {
        const listing = await this.marketService.createListing({
            playerId,
            inventoryItemId,
            price
        });
        return (0, market_presenter_1.toMarketListingResponseBody)(listing);
    }
    async buyListing(listingId, buyerPlayerId) {
        const result = await this.marketService.buyListing({
            listingId,
            buyerPlayerId
        });
        return (0, market_presenter_1.toMarketPurchaseResponseBody)(result);
    }
    async cancelListing(listingId, playerId) {
        const listing = await this.marketService.cancelListing({
            listingId,
            playerId
        });
        return (0, market_presenter_1.toMarketListingResponseBody)(listing);
    }
};
exports.MarketController = MarketController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MarketController.prototype, "listListings", null);
__decorate([
    (0, common_1.Get)(":listingId"),
    __param(0, (0, common_1.Param)("listingId", common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MarketController.prototype, "getListingById", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)("playerId", common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)("inventoryItemId", common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)("price", common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", Promise)
], MarketController.prototype, "createListing", null);
__decorate([
    (0, common_1.Post)(":listingId/buy"),
    __param(0, (0, common_1.Param)("listingId", common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)("buyerPlayerId", common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MarketController.prototype, "buyListing", null);
__decorate([
    (0, common_1.Post)(":listingId/cancel"),
    __param(0, (0, common_1.Param)("listingId", common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)("playerId", common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MarketController.prototype, "cancelListing", null);
exports.MarketController = MarketController = __decorate([
    (0, common_1.Controller)("market/listings"),
    __param(0, (0, common_1.Inject)(market_service_1.MarketService)),
    __metadata("design:paramtypes", [market_service_1.MarketService])
], MarketController);
