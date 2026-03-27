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
exports.PrismaPlayerActivityRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../platform/database/prisma.service");
function toSnapshot(activity) {
    return {
        id: activity.id,
        playerId: activity.playerId,
        type: activity.type,
        title: activity.title,
        body: activity.body,
        createdAt: activity.createdAt,
        readAt: activity.readAt
    };
}
let PrismaPlayerActivityRepository = class PrismaPlayerActivityRepository {
    prismaService;
    constructor(prismaService) {
        this.prismaService = prismaService;
    }
    async createActivity(activity) {
        const prismaClient = this.prismaService;
        const created = await prismaClient.playerActivity.create({
            data: {
                playerId: activity.playerId,
                type: activity.type,
                title: activity.title,
                body: activity.body,
                createdAt: activity.createdAt
            }
        });
        return toSnapshot(created);
    }
    async listByPlayerId(playerId, limit) {
        const prismaClient = this.prismaService;
        const activities = await prismaClient.playerActivity.findMany({
            where: {
                playerId
            },
            orderBy: [
                {
                    createdAt: "desc"
                },
                {
                    id: "desc"
                }
            ],
            take: limit
        });
        return activities.map(toSnapshot);
    }
    async markAsRead(playerId, activityId, readAt) {
        const prismaClient = this.prismaService;
        const existing = await prismaClient.playerActivity.findFirst({
            where: {
                id: activityId,
                playerId
            }
        });
        if (!existing) {
            return null;
        }
        if (existing.readAt) {
            return toSnapshot(existing);
        }
        const updated = await prismaClient.playerActivity.update({
            where: {
                id: activityId
            },
            data: {
                readAt
            }
        });
        return toSnapshot(updated);
    }
};
exports.PrismaPlayerActivityRepository = PrismaPlayerActivityRepository;
exports.PrismaPlayerActivityRepository = PrismaPlayerActivityRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_service_1.PrismaService)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaPlayerActivityRepository);
