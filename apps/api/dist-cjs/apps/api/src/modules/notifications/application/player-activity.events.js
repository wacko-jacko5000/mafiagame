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
exports.PlayerActivityEventsHandler = void 0;
const common_1 = require("@nestjs/common");
const domain_events_service_1 = require("../../../platform/domain-events/domain-events.service");
const gangs_service_1 = require("../../gangs/application/gangs.service");
const player_activity_service_1 = require("./player-activity.service");
let PlayerActivityEventsHandler = class PlayerActivityEventsHandler {
    domainEventsService;
    playerActivityService;
    gangsService;
    unsubscribers = [];
    constructor(domainEventsService, playerActivityService, gangsService) {
        this.domainEventsService = domainEventsService;
        this.playerActivityService = playerActivityService;
        this.gangsService = gangsService;
    }
    onModuleInit() {
        this.unsubscribers.push(this.domainEventsService.subscribe("market.item_sold", (event) => this.handleMarketItemSold(event)), this.domainEventsService.subscribe("territory.payout_claimed", (event) => this.handleTerritoryPayoutClaimed(event)), this.domainEventsService.subscribe("territory.war_won", (event) => this.handleTerritoryWarWon(event)), this.domainEventsService.subscribe("achievements.unlocked", (event) => this.handleAchievementUnlocked(event)), this.domainEventsService.subscribe("gangs.invite_received", (event) => this.handleGangInviteReceived(event)));
    }
    onModuleDestroy() {
        for (const unsubscribe of this.unsubscribers.splice(0)) {
            unsubscribe();
        }
    }
    async handleMarketItemSold(event) {
        await this.playerActivityService.createActivity({
            playerId: event.sellerPlayerId,
            type: "market_item_sold",
            title: "Item sold",
            body: `Your ${event.itemName} sold for ${formatCash(event.price)}.`,
            createdAt: event.occurredAt
        });
    }
    async handleTerritoryPayoutClaimed(event) {
        await this.playerActivityService.createActivity({
            playerId: event.playerId,
            type: "territory_payout_claimed",
            title: "Territory payout claimed",
            body: `You claimed ${formatCash(event.payoutAmount)} from ${event.districtName}.`,
            createdAt: event.occurredAt
        });
    }
    async handleTerritoryWarWon(event) {
        const members = await this.gangsService.listGangMembers(event.winningGangId);
        await Promise.all(members.map((member) => this.playerActivityService.createActivity({
            playerId: member.playerId,
            type: "territory_war_won",
            title: "Territory war won",
            body: `${event.winningGangName} won control of ${event.districtName}.`,
            createdAt: event.occurredAt
        })));
    }
    async handleAchievementUnlocked(event) {
        await this.playerActivityService.createActivity({
            playerId: event.playerId,
            type: "achievement_unlocked",
            title: "Achievement unlocked",
            body: `${event.achievementName}: ${event.achievementDescription}`,
            createdAt: event.occurredAt
        });
    }
    async handleGangInviteReceived(event) {
        await this.playerActivityService.createActivity({
            playerId: event.invitedPlayerId,
            type: "gang_invite_received",
            title: "Gang invite received",
            body: `${event.invitedByPlayerDisplayName} invited you to join ${event.gangName}.`,
            createdAt: event.occurredAt
        });
    }
};
exports.PlayerActivityEventsHandler = PlayerActivityEventsHandler;
exports.PlayerActivityEventsHandler = PlayerActivityEventsHandler = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(domain_events_service_1.DomainEventsService)),
    __param(1, (0, common_1.Inject)(player_activity_service_1.PlayerActivityService)),
    __param(2, (0, common_1.Inject)(gangs_service_1.GangsService)),
    __metadata("design:paramtypes", [domain_events_service_1.DomainEventsService,
        player_activity_service_1.PlayerActivityService,
        gangs_service_1.GangsService])
], PlayerActivityEventsHandler);
function formatCash(value) {
    return `$${value.toLocaleString("en-US")}`;
}
