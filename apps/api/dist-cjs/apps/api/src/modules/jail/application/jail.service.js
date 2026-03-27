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
exports.JailService = void 0;
const common_1 = require("@nestjs/common");
const custody_balance_service_1 = require("../../custody/application/custody-balance.service");
const player_activity_service_1 = require("../../notifications/application/player-activity.service");
const player_service_1 = require("../../player/application/player.service");
const player_policy_1 = require("../../player/domain/player.policy");
const jail_errors_1 = require("../domain/jail.errors");
const jail_policy_1 = require("../domain/jail.policy");
let JailService = class JailService {
    custodyBalanceService;
    playerActivityService;
    playerService;
    constructor(custodyBalanceService, playerActivityService, playerService) {
        this.custodyBalanceService = custodyBalanceService;
        this.playerActivityService = playerActivityService;
        this.playerService = playerService;
    }
    async getStatus(playerId, now = new Date()) {
        const player = await this.playerService.getPlayerByIdAt(playerId, now);
        const status = (0, jail_policy_1.getJailStatus)(playerId, player.jailedUntil, now);
        return {
            ...status,
            reason: player.jailReason ?? null
        };
    }
    async jailPlayer(playerId, durationSeconds, reason = null, now = new Date()) {
        const until = (0, jail_policy_1.buildJailReleaseTime)(now, durationSeconds);
        await this.playerService.applyCustodyEntry(playerId, {
            statusType: "jail",
            until,
            reason
        });
        await this.playerActivityService.createActivity({
            playerId,
            type: "jail.entered",
            title: "You are in jail",
            createdAt: now,
            body: reason
                ? `${reason} You are jailed until ${until.toISOString()}.`
                : `You are jailed until ${until.toISOString()}.`
        });
        return {
            playerId,
            active: true,
            until,
            remainingSeconds: durationSeconds,
            reason
        };
    }
    async getBuyoutQuote(playerId, now = new Date()) {
        const player = await this.playerService.getPlayerByIdAt(playerId, now);
        const status = (0, jail_policy_1.getJailStatus)(playerId, player.jailedUntil, now);
        const progression = (0, player_policy_1.derivePlayerProgression)(player.respect);
        return this.custodyBalanceService.buildQuote({
            statusType: "jail",
            active: status.active,
            until: status.until,
            reason: player.jailReason ?? null,
            remainingSeconds: status.remainingSeconds,
            playerLevel: progression.level,
            entryCountSinceLevelReset: player.jailEntryCount ?? 0
        });
    }
    async buyOut(playerId, now = new Date()) {
        const player = await this.playerService.getPlayerByIdAt(playerId, now);
        const status = (0, jail_policy_1.getJailStatus)(playerId, player.jailedUntil, now);
        const progression = (0, player_policy_1.derivePlayerProgression)(player.respect);
        const quote = this.custodyBalanceService.buildQuote({
            statusType: "jail",
            active: status.active,
            until: status.until,
            reason: player.jailReason ?? null,
            remainingSeconds: status.remainingSeconds,
            playerLevel: progression.level,
            entryCountSinceLevelReset: player.jailEntryCount ?? 0
        });
        if (!quote.active || !quote.buyoutPrice) {
            throw new common_1.ConflictException("Player is not currently jailed.");
        }
        if (player.cash < quote.buyoutPrice) {
            throw new common_1.ConflictException("Player does not have enough cash to buy out of jail.");
        }
        const updatedPlayer = await this.playerService.buyOutCustodyStatus(playerId, {
            statusType: "jail",
            buyoutPrice: quote.buyoutPrice,
            now
        });
        if (!updatedPlayer) {
            throw new common_1.ConflictException("Jail buyout could not be completed.");
        }
        await this.playerActivityService.createActivity({
            playerId,
            type: "jail.buyout",
            title: "Bought your freedom",
            createdAt: now,
            body: `You paid ${quote.buyoutPrice} cash to leave jail immediately.`
        });
        return {
            player: updatedPlayer,
            buyoutPrice: quote.buyoutPrice
        };
    }
    async assertCrimeExecutionAllowed(playerId, now = new Date()) {
        const status = await this.getStatus(playerId, now);
        if (status.active && status.until) {
            throw new common_1.ConflictException(new jail_errors_1.PlayerJailedError(status.until).message);
        }
    }
};
exports.JailService = JailService;
exports.JailService = JailService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(custody_balance_service_1.CustodyBalanceService)),
    __param(1, (0, common_1.Inject)(player_activity_service_1.PlayerActivityService)),
    __param(2, (0, common_1.Inject)(player_service_1.PlayerService)),
    __metadata("design:paramtypes", [custody_balance_service_1.CustodyBalanceService,
        player_activity_service_1.PlayerActivityService,
        player_service_1.PlayerService])
], JailService);
