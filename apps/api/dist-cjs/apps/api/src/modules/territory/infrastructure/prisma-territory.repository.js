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
exports.PrismaTerritoryRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../platform/database/prisma.service");
function toDistrictWithControlSnapshot(district) {
    return {
        id: district.id,
        name: district.name,
        payoutAmount: district.payoutAmount,
        payoutCooldownMinutes: district.payoutCooldownMinutes,
        createdAt: district.createdAt,
        control: district.control
            ? {
                id: district.control.id,
                districtId: district.control.districtId,
                gangId: district.control.gangId,
                capturedAt: district.control.capturedAt,
                lastPayoutClaimedAt: district.control.lastPayoutClaimedAt
            }
            : null,
        activeWar: district.wars?.[0] ? toDistrictWarSnapshot(district.wars[0]) : null
    };
}
function toDistrictControlSnapshot(control) {
    return {
        id: control.id,
        districtId: control.districtId,
        gangId: control.gangId,
        capturedAt: control.capturedAt,
        lastPayoutClaimedAt: control.lastPayoutClaimedAt
    };
}
function toDistrictWarSnapshot(war) {
    return {
        id: war.id,
        districtId: war.districtId,
        attackerGangId: war.attackerGangId,
        defenderGangId: war.defenderGangId,
        startedByPlayerId: war.startedByPlayerId,
        status: war.status,
        createdAt: war.createdAt,
        resolvedAt: war.resolvedAt,
        winningGangId: war.winningGangId
    };
}
let PrismaTerritoryRepository = class PrismaTerritoryRepository {
    prismaService;
    constructor(prismaService) {
        this.prismaService = prismaService;
    }
    async listDistricts() {
        const prismaClient = this.prismaService;
        const districts = await prismaClient.district.findMany({
            include: {
                control: true,
                wars: {
                    where: {
                        status: "pending"
                    },
                    orderBy: {
                        createdAt: "desc"
                    }
                }
            },
            orderBy: {
                createdAt: "asc"
            }
        });
        return districts.map(toDistrictWithControlSnapshot);
    }
    async findDistrictById(districtId) {
        const prismaClient = this.prismaService;
        const district = await prismaClient.district.findUnique({
            where: {
                id: districtId
            },
            include: {
                control: true,
                wars: {
                    where: {
                        status: "pending"
                    },
                    orderBy: {
                        createdAt: "desc"
                    }
                }
            }
        });
        return district ? toDistrictWithControlSnapshot(district) : null;
    }
    async updateDistrictBalance(command) {
        const prismaClient = this.prismaService;
        try {
            const district = await prismaClient.district.update({
                where: {
                    id: command.districtId
                },
                data: {
                    payoutAmount: command.payoutAmount,
                    payoutCooldownMinutes: command.payoutCooldownMinutes
                },
                include: {
                    control: true,
                    wars: {
                        where: {
                            status: "pending"
                        },
                        orderBy: {
                            createdAt: "desc"
                        }
                    }
                }
            });
            return toDistrictWithControlSnapshot(district);
        }
        catch {
            return null;
        }
    }
    async claimDistrict(command) {
        const prismaClient = this.prismaService;
        return prismaClient.$transaction(async (tx) => {
            const district = await tx.district.findUnique({
                where: {
                    id: command.districtId
                },
                include: {
                    control: true,
                    wars: {
                        where: {
                            status: "pending"
                        },
                        orderBy: {
                            createdAt: "desc"
                        }
                    }
                }
            });
            if (!district) {
                return null;
            }
            const control = await tx.districtControl.upsert({
                where: {
                    districtId: command.districtId
                },
                create: {
                    districtId: command.districtId,
                    gangId: command.gangId,
                    capturedAt: new Date(),
                    lastPayoutClaimedAt: null
                },
                update: {
                    gangId: command.gangId,
                    capturedAt: new Date(),
                    lastPayoutClaimedAt: null
                }
            });
            return toDistrictControlSnapshot(control);
        });
    }
    async claimDistrictPayout(command) {
        const prismaClient = this.prismaService;
        return prismaClient.$transaction(async (tx) => {
            const district = await tx.district.findUnique({
                where: {
                    id: command.districtId
                },
                include: {
                    control: true,
                    wars: {
                        where: {
                            status: "pending"
                        },
                        orderBy: {
                            createdAt: "desc"
                        }
                    }
                }
            });
            if (!district) {
                return "district_not_found";
            }
            if (!district.control) {
                return "district_uncontrolled";
            }
            if (district.control.gangId !== command.gangId) {
                return "gang_not_controller";
            }
            const result = await tx.districtControl.updateMany({
                where: {
                    districtId: command.districtId,
                    gangId: command.gangId,
                    OR: [
                        {
                            lastPayoutClaimedAt: null
                        },
                        {
                            lastPayoutClaimedAt: {
                                lte: command.latestEligibleClaimedAt
                            }
                        }
                    ]
                },
                data: {
                    lastPayoutClaimedAt: command.claimedAt
                }
            });
            return result.count === 1 ? "claimed" : "cooldown_not_elapsed";
        });
    }
    async findActiveWarByDistrictId(districtId) {
        const prismaClient = this.prismaService;
        const war = await prismaClient.districtWar.findFirst({
            where: {
                districtId,
                status: "pending"
            },
            orderBy: {
                createdAt: "desc"
            }
        });
        return war ? toDistrictWarSnapshot(war) : null;
    }
    async findWarById(warId) {
        const prismaClient = this.prismaService;
        const war = await prismaClient.districtWar.findUnique({
            where: {
                id: warId
            }
        });
        return war ? toDistrictWarSnapshot(war) : null;
    }
    async startWar(command) {
        const prismaClient = this.prismaService;
        return prismaClient.$transaction(async (tx) => {
            const district = await tx.district.findUnique({
                where: {
                    id: command.districtId
                },
                include: {
                    control: true,
                    wars: {
                        where: {
                            status: "pending"
                        },
                        orderBy: {
                            createdAt: "desc"
                        }
                    }
                }
            });
            if (!district) {
                return null;
            }
            const war = await tx.districtWar.create({
                data: {
                    districtId: command.districtId,
                    attackerGangId: command.attackerGangId,
                    defenderGangId: command.defenderGangId,
                    startedByPlayerId: command.startedByPlayerId,
                    status: "pending"
                }
            });
            return toDistrictWarSnapshot(war);
        });
    }
    async resolveWar(command) {
        const prismaClient = this.prismaService;
        return prismaClient.$transaction(async (tx) => {
            const war = await tx.districtWar.findUnique({
                where: {
                    id: command.warId
                }
            });
            if (!war) {
                return null;
            }
            await tx.districtControl.upsert({
                where: {
                    districtId: war.districtId
                },
                create: {
                    districtId: war.districtId,
                    gangId: command.winningGangId,
                    capturedAt: new Date(),
                    lastPayoutClaimedAt: null
                },
                update: {
                    gangId: command.winningGangId,
                    capturedAt: new Date(),
                    lastPayoutClaimedAt: null
                }
            });
            const resolvedWar = await tx.districtWar.update({
                where: {
                    id: command.warId
                },
                data: {
                    status: "resolved",
                    resolvedAt: new Date(),
                    winningGangId: command.winningGangId
                }
            });
            return toDistrictWarSnapshot(resolvedWar);
        });
    }
};
exports.PrismaTerritoryRepository = PrismaTerritoryRepository;
exports.PrismaTerritoryRepository = PrismaTerritoryRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_service_1.PrismaService)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaTerritoryRepository);
