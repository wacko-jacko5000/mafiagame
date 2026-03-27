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
exports.AchievementsProgressEventsHandler = void 0;
const common_1 = require("@nestjs/common");
const domain_events_service_1 = require("../../../platform/domain-events/domain-events.service");
const achievements_service_1 = require("./achievements.service");
let AchievementsProgressEventsHandler = class AchievementsProgressEventsHandler {
    domainEventsService;
    achievementsService;
    unsubscribers = [];
    constructor(domainEventsService, achievementsService) {
        this.domainEventsService = domainEventsService;
        this.achievementsService = achievementsService;
    }
    onModuleInit() {
        this.unsubscribers.push(this.domainEventsService.subscribe("crime.completed", (event) => this.handleCrimeCompleted(event)), this.domainEventsService.subscribe("inventory.item_purchased", (event) => this.handleInventoryItemPurchased(event)), this.domainEventsService.subscribe("combat.won", (event) => this.handleCombatWon(event)), this.domainEventsService.subscribe("territory.district_claimed", (event) => this.handleTerritoryDistrictClaimed(event)), this.domainEventsService.subscribe("market.item_sold", (event) => this.handleMarketItemSold(event)));
    }
    onModuleDestroy() {
        for (const unsubscribe of this.unsubscribers.splice(0)) {
            unsubscribe();
        }
    }
    async handleCrimeCompleted(event) {
        await this.achievementsService.recordProgress(event.playerId, "crime_completed_count");
    }
    async handleInventoryItemPurchased(event) {
        await this.achievementsService.recordProgress(event.playerId, "inventory_item_purchased_count");
    }
    async handleCombatWon(event) {
        await this.achievementsService.recordProgress(event.attackerPlayerId, "combat_won_count");
    }
    async handleTerritoryDistrictClaimed(event) {
        await this.achievementsService.recordProgress(event.playerId, "territory_district_claimed_count");
    }
    async handleMarketItemSold(event) {
        await this.achievementsService.recordProgress(event.sellerPlayerId, "market_item_sold_count");
    }
};
exports.AchievementsProgressEventsHandler = AchievementsProgressEventsHandler;
exports.AchievementsProgressEventsHandler = AchievementsProgressEventsHandler = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(domain_events_service_1.DomainEventsService)),
    __param(1, (0, common_1.Inject)(achievements_service_1.AchievementsService)),
    __metadata("design:paramtypes", [domain_events_service_1.DomainEventsService,
        achievements_service_1.AchievementsService])
], AchievementsProgressEventsHandler);
