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
exports.PlayerActivityService = void 0;
const common_1 = require("@nestjs/common");
const player_service_1 = require("../../player/application/player.service");
const player_activity_repository_1 = require("./player-activity.repository");
const DEFAULT_ACTIVITY_LIMIT = 20;
const MAX_ACTIVITY_LIMIT = 100;
let PlayerActivityService = class PlayerActivityService {
    playerService;
    playerActivityRepository;
    constructor(playerService, playerActivityRepository) {
        this.playerService = playerService;
        this.playerActivityRepository = playerActivityRepository;
    }
    async listPlayerActivity(playerId, limit = DEFAULT_ACTIVITY_LIMIT) {
        await this.playerService.getPlayerById(playerId);
        return this.playerActivityRepository.listByPlayerId(playerId, Math.min(Math.max(limit, 1), MAX_ACTIVITY_LIMIT));
    }
    async createActivity(activity) {
        return this.playerActivityRepository.createActivity(activity);
    }
    async markActivityRead(playerId, activityId) {
        await this.playerService.getPlayerById(playerId);
        const activity = await this.playerActivityRepository.markAsRead(playerId, activityId, new Date());
        if (!activity) {
            throw new common_1.NotFoundException(`Activity item "${activityId}" was not found for player "${playerId}".`);
        }
        return activity;
    }
};
exports.PlayerActivityService = PlayerActivityService;
exports.PlayerActivityService = PlayerActivityService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(player_service_1.PlayerService)),
    __param(1, (0, common_1.Inject)(player_activity_repository_1.PLAYER_ACTIVITY_REPOSITORY)),
    __metadata("design:paramtypes", [player_service_1.PlayerService, Object])
], PlayerActivityService);
