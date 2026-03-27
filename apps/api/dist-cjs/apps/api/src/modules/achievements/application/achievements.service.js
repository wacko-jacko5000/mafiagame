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
exports.AchievementsService = void 0;
const common_1 = require("@nestjs/common");
const domain_events_service_1 = require("../../../platform/domain-events/domain-events.service");
const player_service_1 = require("../../player/application/player.service");
const achievements_catalog_1 = require("../domain/achievements.catalog");
const achievements_repository_1 = require("./achievements.repository");
let AchievementsService = class AchievementsService {
    playerService;
    domainEventsService;
    achievementsRepository;
    constructor(playerService, domainEventsService, achievementsRepository) {
        this.playerService = playerService;
        this.domainEventsService = domainEventsService;
        this.achievementsRepository = achievementsRepository;
    }
    listAchievements() {
        return achievements_catalog_1.starterAchievementCatalog;
    }
    async listPlayerAchievements(playerId) {
        await this.playerService.getPlayerById(playerId);
        const existingAchievements = await this.achievementsRepository.listByPlayerId(playerId);
        const achievementMap = new Map(existingAchievements.map((achievement) => [achievement.achievementId, achievement]));
        return achievements_catalog_1.starterAchievementCatalog.map((definition) => this.toAchievementView(playerId, achievementMap.get(definition.id) ?? null, definition));
    }
    async recordProgress(playerId, triggerType, amount = 1) {
        if (amount <= 0) {
            return;
        }
        const definitions = (0, achievements_catalog_1.getAchievementsByTriggerType)(triggerType);
        if (definitions.length === 0) {
            return;
        }
        const existingAchievements = await this.achievementsRepository.listByPlayerId(playerId);
        const achievementMap = new Map(existingAchievements.map((achievement) => [achievement.achievementId, achievement]));
        const unlockedAt = new Date();
        await Promise.all(definitions.map(async (definition) => {
            const existingAchievement = achievementMap.get(definition.id);
            const nextProgress = Math.min((existingAchievement?.progress ?? 0) + amount, definition.targetCount);
            const unlockedAtForRecord = existingAchievement?.unlockedAt ??
                (nextProgress >= definition.targetCount ? unlockedAt : null);
            const didUnlock = !existingAchievement?.unlockedAt &&
                unlockedAtForRecord !== null &&
                nextProgress >= definition.targetCount;
            if (existingAchievement) {
                if (existingAchievement.progress >= existingAchievement.targetProgress &&
                    existingAchievement.unlockedAt) {
                    return;
                }
                await this.achievementsRepository.updateProgress({
                    playerAchievementId: existingAchievement.id,
                    progress: nextProgress,
                    targetProgress: definition.targetCount,
                    unlockedAt: unlockedAtForRecord
                });
                if (didUnlock) {
                    await this.publishUnlockedEvent(playerId, definition, unlockedAtForRecord);
                }
                return;
            }
            await this.achievementsRepository.createAchievement({
                playerId,
                achievementId: definition.id,
                progress: nextProgress,
                targetProgress: definition.targetCount,
                unlockedAt: unlockedAtForRecord
            });
            if (didUnlock) {
                await this.publishUnlockedEvent(playerId, definition, unlockedAtForRecord);
            }
        }));
    }
    async publishUnlockedEvent(playerId, definition, unlockedAt) {
        await this.domainEventsService.publish({
            type: "achievements.unlocked",
            occurredAt: unlockedAt,
            playerId,
            achievementId: definition.id,
            achievementName: definition.name,
            achievementDescription: definition.description
        });
    }
    toAchievementView(playerId, achievement, definition) {
        return {
            playerId,
            achievementId: definition.id,
            progress: achievement?.progress ?? 0,
            targetProgress: achievement?.targetProgress ?? definition.targetCount,
            unlockedAt: achievement?.unlockedAt ?? null,
            definition
        };
    }
};
exports.AchievementsService = AchievementsService;
exports.AchievementsService = AchievementsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(player_service_1.PlayerService)),
    __param(1, (0, common_1.Inject)(domain_events_service_1.DomainEventsService)),
    __param(2, (0, common_1.Inject)(achievements_repository_1.ACHIEVEMENTS_REPOSITORY)),
    __metadata("design:paramtypes", [player_service_1.PlayerService,
        domain_events_service_1.DomainEventsService, Object])
], AchievementsService);
