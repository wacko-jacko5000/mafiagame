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
exports.PrismaLeaderboardRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../platform/database/prisma.service");
const leaderboard_policy_1 = require("../domain/leaderboard.policy");
let PrismaLeaderboardRepository = class PrismaLeaderboardRepository {
    prismaService;
    constructor(prismaService) {
        this.prismaService = prismaService;
    }
    async listLeaderboardRecords(leaderboardId, limit) {
        switch (leaderboardId) {
            case "richest_players":
                return this.listRichestPlayers(limit);
            case "most_respected_players":
                return this.listMostRespectedPlayers(limit);
            case "most_achievements_unlocked":
                return this.listPlayersByAchievementCount(limit);
        }
    }
    async listRichestPlayers(limit) {
        const prismaClient = this.prismaService;
        const players = (await prismaClient.player.findMany({
            select: {
                id: true,
                displayName: true,
                cash: true,
                createdAt: true
            },
            orderBy: [
                {
                    cash: "desc"
                },
                {
                    createdAt: "asc"
                },
                {
                    id: "asc"
                }
            ],
            take: limit
        }));
        return players.map((player) => ({
            playerId: player.id,
            displayName: player.displayName,
            createdAt: player.createdAt,
            metricValue: player.cash ?? 0
        }));
    }
    async listMostRespectedPlayers(limit) {
        const prismaClient = this.prismaService;
        const players = (await prismaClient.player.findMany({
            select: {
                id: true,
                displayName: true,
                respect: true,
                createdAt: true
            },
            orderBy: [
                {
                    respect: "desc"
                },
                {
                    createdAt: "asc"
                },
                {
                    id: "asc"
                }
            ],
            take: limit
        }));
        return players.map((player) => ({
            playerId: player.id,
            displayName: player.displayName,
            createdAt: player.createdAt,
            metricValue: player.respect ?? 0
        }));
    }
    async listPlayersByAchievementCount(limit) {
        const prismaClient = this.prismaService;
        const players = (await prismaClient.player.findMany({
            select: {
                id: true,
                displayName: true,
                createdAt: true,
                achievements: {
                    where: {
                        unlockedAt: {
                            not: null
                        }
                    },
                    select: {
                        id: true
                    }
                }
            }
        }));
        return players
            .map((player) => ({
            playerId: player.id,
            displayName: player.displayName,
            createdAt: player.createdAt,
            metricValue: player.achievements.length
        }))
            .sort(leaderboard_policy_1.compareLeaderboardMetricRecords)
            .slice(0, limit);
    }
};
exports.PrismaLeaderboardRepository = PrismaLeaderboardRepository;
exports.PrismaLeaderboardRepository = PrismaLeaderboardRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_service_1.PrismaService)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaLeaderboardRepository);
