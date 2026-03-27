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
exports.PrismaSeasonsRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../platform/database/prisma.service");
function toSeasonSnapshot(record) {
    return {
        id: record.id,
        name: record.name,
        status: record.status,
        startsAt: record.startsAt,
        endsAt: record.endsAt,
        activatedAt: record.activatedAt,
        deactivatedAt: record.deactivatedAt,
        createdAt: record.createdAt
    };
}
let PrismaSeasonsRepository = class PrismaSeasonsRepository {
    prismaService;
    constructor(prismaService) {
        this.prismaService = prismaService;
    }
    async listSeasons() {
        const prismaClient = this.prismaService;
        const seasons = await prismaClient.season.findMany({
            orderBy: {
                createdAt: "desc"
            }
        });
        return seasons.map(toSeasonSnapshot);
    }
    async findSeasonById(seasonId) {
        const prismaClient = this.prismaService;
        const season = await prismaClient.season.findUnique({
            where: {
                id: seasonId
            }
        });
        return season ? toSeasonSnapshot(season) : null;
    }
    async findCurrentSeason() {
        const prismaClient = this.prismaService;
        const season = await prismaClient.season.findFirst({
            where: {
                status: "active"
            },
            orderBy: {
                createdAt: "desc"
            }
        });
        return season ? toSeasonSnapshot(season) : null;
    }
    async createSeason(input) {
        const prismaClient = this.prismaService;
        const season = await prismaClient.season.create({
            data: {
                name: input.name,
                status: "draft",
                startsAt: input.startsAt,
                endsAt: input.endsAt
            }
        });
        return toSeasonSnapshot(season);
    }
    async activateSeason(seasonId, activatedAt) {
        const prismaClient = this.prismaService;
        return prismaClient.$transaction(async (tx) => {
            const season = await tx.season.findUnique({
                where: {
                    id: seasonId
                }
            });
            if (!season) {
                return null;
            }
            if (season.status === "active") {
                return toSeasonSnapshot(season);
            }
            await tx.season.updateMany({
                where: {
                    status: "active"
                },
                data: {
                    status: "inactive",
                    deactivatedAt: activatedAt
                }
            });
            const activatedSeason = await tx.season.update({
                where: {
                    id: seasonId
                },
                data: {
                    status: "active",
                    activatedAt,
                    deactivatedAt: null
                }
            });
            return toSeasonSnapshot(activatedSeason);
        });
    }
    async deactivateSeason(seasonId, deactivatedAt) {
        const prismaClient = this.prismaService;
        return prismaClient.$transaction(async (tx) => {
            const season = await tx.season.findUnique({
                where: {
                    id: seasonId
                }
            });
            if (!season) {
                return null;
            }
            const deactivatedSeason = await tx.season.update({
                where: {
                    id: seasonId
                },
                data: {
                    status: "inactive",
                    deactivatedAt
                }
            });
            return toSeasonSnapshot(deactivatedSeason);
        });
    }
};
exports.PrismaSeasonsRepository = PrismaSeasonsRepository;
exports.PrismaSeasonsRepository = PrismaSeasonsRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_service_1.PrismaService)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaSeasonsRepository);
