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
exports.PrismaMissionsRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../platform/database/prisma.service");
function toPlayerMissionSnapshot(mission) {
    return {
        id: mission.id,
        playerId: mission.playerId,
        missionId: mission.missionId,
        status: mission.status,
        progress: mission.progress,
        targetProgress: mission.targetProgress,
        acceptedAt: mission.acceptedAt,
        completedAt: mission.completedAt
    };
}
let PrismaMissionsRepository = class PrismaMissionsRepository {
    prismaService;
    constructor(prismaService) {
        this.prismaService = prismaService;
    }
    async findByPlayerAndMissionId(playerId, missionId) {
        const prismaClient = this.prismaService;
        const mission = await prismaClient.playerMission.findUnique({
            where: {
                playerId_missionId: {
                    playerId,
                    missionId
                }
            }
        });
        return mission ? toPlayerMissionSnapshot(mission) : null;
    }
    async listByPlayerId(playerId) {
        const prismaClient = this.prismaService;
        const missions = await prismaClient.playerMission.findMany({
            where: {
                playerId
            },
            orderBy: [
                {
                    acceptedAt: "desc"
                }
            ]
        });
        return missions.map(toPlayerMissionSnapshot);
    }
    async listActiveByPlayerId(playerId) {
        const prismaClient = this.prismaService;
        const missions = await prismaClient.playerMission.findMany({
            where: {
                playerId,
                status: "active"
            }
        });
        return missions.map(toPlayerMissionSnapshot);
    }
    async createMission(record) {
        const prismaClient = this.prismaService;
        const mission = await prismaClient.playerMission.create({
            data: {
                playerId: record.playerId,
                missionId: record.missionId,
                status: "active",
                progress: 0,
                targetProgress: record.targetProgress,
                acceptedAt: record.acceptedAt,
                completedAt: null
            }
        });
        return toPlayerMissionSnapshot(mission);
    }
    async resetMission(record) {
        const prismaClient = this.prismaService;
        const mission = await prismaClient.playerMission.update({
            where: {
                playerId_missionId: {
                    playerId: record.playerId,
                    missionId: record.missionId
                }
            },
            data: {
                status: "active",
                progress: 0,
                targetProgress: record.targetProgress,
                acceptedAt: record.acceptedAt,
                completedAt: null
            }
        });
        return toPlayerMissionSnapshot(mission);
    }
    async updateProgress(playerMissionId, progress) {
        const prismaClient = this.prismaService;
        const mission = await prismaClient.playerMission.update({
            where: {
                id: playerMissionId
            },
            data: {
                progress
            }
        });
        return toPlayerMissionSnapshot(mission);
    }
    async markCompleted(playerMissionId, completedAt) {
        const prismaClient = this.prismaService;
        const mission = await prismaClient.playerMission.update({
            where: {
                id: playerMissionId
            },
            data: {
                status: "completed",
                completedAt
            }
        });
        return toPlayerMissionSnapshot(mission);
    }
};
exports.PrismaMissionsRepository = PrismaMissionsRepository;
exports.PrismaMissionsRepository = PrismaMissionsRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_service_1.PrismaService)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaMissionsRepository);
