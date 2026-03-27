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
exports.PrismaPlayerRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../platform/database/prisma.service");
const player_errors_1 = require("../domain/player.errors");
const player_constants_1 = require("../domain/player.constants");
const player_policy_1 = require("../domain/player.policy");
function toPlayerSnapshot(player) {
    return {
        id: player.id,
        accountId: player.accountId,
        displayName: player.displayName,
        cash: player.cash,
        respect: player.respect,
        energy: player.energy,
        energyUpdatedAt: player.energyUpdatedAt,
        health: player.health,
        jailedUntil: player.jailedUntil,
        hospitalizedUntil: player.hospitalizedUntil,
        jailEntryCount: player.jailEntryCount ?? 0,
        hospitalEntryCount: player.hospitalEntryCount ?? 0,
        jailReason: player.jailReason ?? null,
        hospitalReason: player.hospitalReason ?? null,
        createdAt: player.createdAt,
        updatedAt: player.updatedAt
    };
}
let PrismaPlayerRepository = class PrismaPlayerRepository {
    prismaService;
    constructor(prismaService) {
        this.prismaService = prismaService;
    }
    async create(values) {
        const player = await this.prismaService.player.create({
            data: values
        });
        return toPlayerSnapshot(player);
    }
    async findById(playerId, now = new Date()) {
        return this.prismaService.$transaction(async (tx) => {
            const player = await tx.player.findUnique({
                where: {
                    id: playerId
                }
            });
            if (!player) {
                return null;
            }
            const syncedPlayer = await this.synchronizeCustody(tx, await this.synchronizeEnergy(tx, player, now), now);
            return toPlayerSnapshot(syncedPlayer);
        });
    }
    async findByAccountId(accountId) {
        const player = await this.prismaService.player.findUnique({
            where: {
                accountId
            }
        });
        return player ? toPlayerSnapshot(player) : null;
    }
    async findByDisplayName(displayName) {
        const player = await this.prismaService.player.findUnique({
            where: {
                displayName
            }
        });
        return player ? toPlayerSnapshot(player) : null;
    }
    async applyResourceDelta(playerId, delta, now = new Date()) {
        return this.prismaService.$transaction(async (tx) => {
            const player = await tx.player.findUnique({
                where: {
                    id: playerId
                }
            });
            if (!player) {
                return null;
            }
            const syncedPlayer = await this.synchronizeCustody(tx, await this.synchronizeEnergy(tx, player, now), now);
            const previousLevel = (0, player_policy_1.derivePlayerProgression)(syncedPlayer.respect).level;
            const nextState = {
                cash: syncedPlayer.cash + (delta.cash ?? 0),
                respect: syncedPlayer.respect + (delta.respect ?? 0),
                energy: Math.min(player_constants_1.playerEnergyRecoveryRules.maxEnergy, syncedPlayer.energy + (delta.energy ?? 0)),
                health: syncedPlayer.health + (delta.health ?? 0)
            };
            const nextLevel = (0, player_policy_1.derivePlayerProgression)(nextState.respect).level;
            const resetCustodyEscalation = nextLevel > previousLevel;
            if (nextState.cash < 0 ||
                nextState.respect < 0 ||
                nextState.energy < 0 ||
                nextState.health < 0) {
                throw new player_errors_1.InvalidPlayerResourceDeltaError("Player resource changes cannot make cash, respect, energy, or health negative.");
            }
            const updatedPlayer = await tx.player.update({
                where: {
                    id: playerId
                },
                data: {
                    ...nextState,
                    ...(resetCustodyEscalation
                        ? {
                            jailEntryCount: 0,
                            hospitalEntryCount: 0
                        }
                        : {}),
                    energyUpdatedAt: delta.energy === undefined ? syncedPlayer.energyUpdatedAt : now
                }
            });
            return toPlayerSnapshot(updatedPlayer);
        });
    }
    async updateCustodyStatus(playerId, status) {
        try {
            const updatedPlayer = await this.prismaService.player.update({
                where: {
                    id: playerId
                },
                data: status
            });
            return toPlayerSnapshot(updatedPlayer);
        }
        catch {
            return null;
        }
    }
    async applyCustodyEntry(playerId, input) {
        try {
            const updatedPlayer = await this.prismaService.player.update({
                where: {
                    id: playerId
                },
                data: input.statusType === "jail"
                    ? {
                        jailedUntil: input.until,
                        jailReason: input.reason,
                        jailEntryCount: {
                            increment: 1
                        }
                    }
                    : {
                        hospitalizedUntil: input.until,
                        hospitalReason: input.reason,
                        hospitalEntryCount: {
                            increment: 1
                        }
                    }
            });
            return toPlayerSnapshot(updatedPlayer);
        }
        catch {
            return null;
        }
    }
    async buyOutCustodyStatus(playerId, input) {
        return this.prismaService.$transaction(async (tx) => {
            const updateResult = await tx.player.updateMany({
                where: input.statusType === "jail"
                    ? {
                        id: playerId,
                        cash: {
                            gte: input.buyoutPrice
                        },
                        jailedUntil: {
                            gt: input.now
                        }
                    }
                    : {
                        id: playerId,
                        cash: {
                            gte: input.buyoutPrice
                        },
                        hospitalizedUntil: {
                            gt: input.now
                        }
                    },
                data: input.statusType === "jail"
                    ? {
                        cash: {
                            decrement: input.buyoutPrice
                        },
                        jailedUntil: null,
                        jailReason: null
                    }
                    : {
                        cash: {
                            decrement: input.buyoutPrice
                        },
                        hospitalizedUntil: null,
                        hospitalReason: null
                    }
            });
            if (updateResult.count === 0) {
                return null;
            }
            const updatedPlayer = await tx.player.findUnique({
                where: {
                    id: playerId
                }
            });
            return updatedPlayer ? toPlayerSnapshot(updatedPlayer) : null;
        });
    }
    async synchronizeEnergy(tx, player, now) {
        const regeneratedEnergy = (0, player_policy_1.regeneratePlayerEnergy)(player, now);
        const needsEnergySync = regeneratedEnergy.energy !== player.energy ||
            regeneratedEnergy.energyUpdatedAt.getTime() !== player.energyUpdatedAt.getTime();
        if (!needsEnergySync) {
            return player;
        }
        return tx.player.update({
            where: {
                id: player.id
            },
            data: {
                energy: regeneratedEnergy.energy,
                energyUpdatedAt: regeneratedEnergy.energyUpdatedAt
            }
        });
    }
    async synchronizeCustody(tx, player, now) {
        const jailExpired = player.jailedUntil !== null && player.jailedUntil.getTime() <= now.getTime();
        const hospitalExpired = player.hospitalizedUntil !== null &&
            player.hospitalizedUntil.getTime() <= now.getTime();
        if (!jailExpired && !hospitalExpired) {
            return player;
        }
        return tx.player.update({
            where: {
                id: player.id
            },
            data: {
                ...(jailExpired
                    ? {
                        jailedUntil: null,
                        jailReason: null
                    }
                    : {}),
                ...(hospitalExpired
                    ? {
                        hospitalizedUntil: null,
                        hospitalReason: null
                    }
                    : {})
            }
        });
    }
};
exports.PrismaPlayerRepository = PrismaPlayerRepository;
exports.PrismaPlayerRepository = PrismaPlayerRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_service_1.PrismaService)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaPlayerRepository);
