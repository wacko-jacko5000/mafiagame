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
exports.MissionsProgressEventsHandler = void 0;
const common_1 = require("@nestjs/common");
const domain_events_service_1 = require("../../../platform/domain-events/domain-events.service");
const missions_service_1 = require("./missions.service");
let MissionsProgressEventsHandler = class MissionsProgressEventsHandler {
    domainEventsService;
    missionsService;
    unsubscribers = [];
    constructor(domainEventsService, missionsService) {
        this.domainEventsService = domainEventsService;
        this.missionsService = missionsService;
    }
    onModuleInit() {
        this.unsubscribers.push(this.domainEventsService.subscribe("crime.completed", (event) => this.handleCrimeCompleted(event)), this.domainEventsService.subscribe("inventory.item_purchased", (event) => this.handleInventoryItemPurchased(event)), this.domainEventsService.subscribe("combat.won", (event) => this.handleCombatWon(event)), this.domainEventsService.subscribe("territory.district_claimed", (event) => this.handleTerritoryDistrictClaimed(event)));
    }
    onModuleDestroy() {
        for (const unsubscribe of this.unsubscribers.splice(0)) {
            unsubscribe();
        }
    }
    async handleCrimeCompleted(event) {
        if (!event.success) {
            return;
        }
        await this.missionsService.recordProgress(event.playerId, "crime_count");
    }
    async handleInventoryItemPurchased(event) {
        const itemType = event.itemId.includes("armor") ? "armor" : "weapon";
        await this.missionsService.recordProgress(event.playerId, "buy_items", 1, {
            itemType
        });
    }
    async handleCombatWon(event) {
        await this.missionsService.recordProgress(event.attackerPlayerId, "win_combat");
    }
    async handleTerritoryDistrictClaimed(event) {
        await this.missionsService.recordProgress(event.playerId, "control_districts");
    }
};
exports.MissionsProgressEventsHandler = MissionsProgressEventsHandler;
exports.MissionsProgressEventsHandler = MissionsProgressEventsHandler = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(domain_events_service_1.DomainEventsService)),
    __param(1, (0, common_1.Inject)(missions_service_1.MissionsService)),
    __metadata("design:paramtypes", [domain_events_service_1.DomainEventsService,
        missions_service_1.MissionsService])
], MissionsProgressEventsHandler);
