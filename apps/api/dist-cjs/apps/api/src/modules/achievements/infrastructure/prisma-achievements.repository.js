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
exports.PrismaAchievementsRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../platform/database/prisma.service");
function toPlayerAchievementSnapshot(achievement) {
    return {
        id: achievement.id,
        playerId: achievement.playerId,
        achievementId: achievement.achievementId,
        progress: achievement.progress,
        targetProgress: achievement.targetProgress,
        unlockedAt: achievement.unlockedAt
    };
}
let PrismaAchievementsRepository = class PrismaAchievementsRepository {
    prismaService;
    constructor(prismaService) {
        this.prismaService = prismaService;
    }
    async listByPlayerId(playerId) {
        const prismaClient = this.prismaService;
        const achievements = await prismaClient.playerAchievement.findMany({
            where: {
                playerId
            },
            orderBy: [
                {
                    achievementId: "asc"
                }
            ]
        });
        return achievements.map(toPlayerAchievementSnapshot);
    }
    async createAchievement(record) {
        const prismaClient = this.prismaService;
        const achievement = await prismaClient.playerAchievement.create({
            data: {
                playerId: record.playerId,
                achievementId: record.achievementId,
                progress: record.progress,
                targetProgress: record.targetProgress,
                unlockedAt: record.unlockedAt
            }
        });
        return toPlayerAchievementSnapshot(achievement);
    }
    async updateProgress(record) {
        const prismaClient = this.prismaService;
        const achievement = await prismaClient.playerAchievement.update({
            where: {
                id: record.playerAchievementId
            },
            data: {
                progress: record.progress,
                targetProgress: record.targetProgress,
                unlockedAt: record.unlockedAt
            }
        });
        return toPlayerAchievementSnapshot(achievement);
    }
};
exports.PrismaAchievementsRepository = PrismaAchievementsRepository;
exports.PrismaAchievementsRepository = PrismaAchievementsRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_service_1.PrismaService)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaAchievementsRepository);
