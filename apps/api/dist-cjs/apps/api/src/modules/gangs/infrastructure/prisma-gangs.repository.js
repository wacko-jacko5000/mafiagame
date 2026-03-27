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
exports.PrismaGangsRepository = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../../platform/database/prisma.service");
const gangs_errors_1 = require("../domain/gangs.errors");
function toGangSnapshot(gang) {
    return {
        id: gang.id,
        name: gang.name,
        createdAt: gang.createdAt,
        createdByPlayerId: gang.createdByPlayerId
    };
}
function toGangMemberSnapshot(member) {
    return {
        id: member.id,
        gangId: member.gangId,
        playerId: member.playerId,
        role: member.role,
        joinedAt: member.joinedAt
    };
}
function toGangInviteSnapshot(invite) {
    return {
        id: invite.id,
        gangId: invite.gangId,
        invitedPlayerId: invite.invitedPlayerId,
        invitedByPlayerId: invite.invitedByPlayerId,
        status: invite.status,
        createdAt: invite.createdAt
    };
}
let PrismaGangsRepository = class PrismaGangsRepository {
    prismaService;
    constructor(prismaService) {
        this.prismaService = prismaService;
    }
    async createGang(values) {
        const prismaClient = this.prismaService;
        try {
            return await prismaClient.$transaction(async (tx) => {
                const gang = await tx.gang.create({
                    data: {
                        name: values.name,
                        createdByPlayerId: values.playerId
                    }
                });
                const membership = await tx.gangMember.create({
                    data: {
                        gangId: gang.id,
                        playerId: values.playerId,
                        role: "leader"
                    }
                });
                return {
                    gang: toGangSnapshot(gang),
                    membership: toGangMemberSnapshot(membership)
                };
            });
        }
        catch (error) {
            this.rethrowUniqueConstraintError(error, values);
            throw error;
        }
    }
    async countGangMembers(gangId) {
        const prismaClient = this.prismaService;
        return prismaClient.gangMember.count({
            where: {
                gangId
            }
        });
    }
    async findGangById(gangId) {
        const prismaClient = this.prismaService;
        const gang = await prismaClient.gang.findUnique({
            where: {
                id: gangId
            }
        });
        return gang ? toGangSnapshot(gang) : null;
    }
    async findGangByName(name) {
        const prismaClient = this.prismaService;
        const gang = await prismaClient.gang.findUnique({
            where: {
                name
            }
        });
        return gang ? toGangSnapshot(gang) : null;
    }
    async findMembershipByPlayerId(playerId) {
        const prismaClient = this.prismaService;
        const membership = await prismaClient.gangMember.findUnique({
            where: {
                playerId
            }
        });
        return membership ? toGangMemberSnapshot(membership) : null;
    }
    async joinGang(command) {
        const prismaClient = this.prismaService;
        try {
            const membership = await prismaClient.gangMember.create({
                data: {
                    gangId: command.gangId,
                    playerId: command.playerId,
                    role: "member"
                }
            });
            return toGangMemberSnapshot(membership);
        }
        catch (error) {
            this.rethrowUniqueConstraintError(error, {
                playerId: command.playerId,
                name: ""
            });
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === "P2003") {
                return null;
            }
            throw error;
        }
    }
    async leaveGang(command) {
        const prismaClient = this.prismaService;
        return prismaClient.$transaction(async (tx) => {
            const membership = await tx.gangMember.findUnique({
                where: {
                    playerId: command.playerId
                }
            });
            if (!membership || membership.gangId !== command.gangId) {
                return null;
            }
            const deletedMembership = await tx.gangMember.delete({
                where: {
                    id: membership.id
                }
            });
            if (command.deleteGang) {
                await tx.gang.delete({
                    where: {
                        id: command.gangId
                    }
                });
            }
            return {
                membership: toGangMemberSnapshot(deletedMembership),
                gangDeleted: command.deleteGang
            };
        });
    }
    async createInvite(command) {
        const prismaClient = this.prismaService;
        try {
            const invite = await prismaClient.gangInvite.create({
                data: {
                    gangId: command.gangId,
                    invitedPlayerId: command.invitedPlayerId,
                    invitedByPlayerId: command.invitedByPlayerId,
                    status: "pending"
                }
            });
            return toGangInviteSnapshot(invite);
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === "P2003") {
                return null;
            }
            throw error;
        }
    }
    async findInviteById(inviteId) {
        const prismaClient = this.prismaService;
        const invite = await prismaClient.gangInvite.findUnique({
            where: {
                id: inviteId
            }
        });
        return invite ? toGangInviteSnapshot(invite) : null;
    }
    async findPendingInviteByPlayerId(playerId) {
        const prismaClient = this.prismaService;
        const invite = await prismaClient.gangInvite.findFirst({
            where: {
                invitedPlayerId: playerId,
                status: "pending"
            },
            orderBy: {
                createdAt: "desc"
            }
        });
        return invite ? toGangInviteSnapshot(invite) : null;
    }
    async listGangInvites(gangId) {
        const prismaClient = this.prismaService;
        const invites = await prismaClient.gangInvite.findMany({
            where: {
                gangId
            },
            orderBy: {
                createdAt: "desc"
            }
        });
        return invites.map(toGangInviteSnapshot);
    }
    async listPlayerGangInvites(playerId) {
        const prismaClient = this.prismaService;
        const invites = await prismaClient.gangInvite.findMany({
            where: {
                invitedPlayerId: playerId
            },
            orderBy: {
                createdAt: "desc"
            }
        });
        return invites.map(toGangInviteSnapshot);
    }
    async acceptInvite(command) {
        const prismaClient = this.prismaService;
        return prismaClient.$transaction(async (tx) => {
            const invite = await tx.gangInvite.findUnique({
                where: {
                    id: command.inviteId
                }
            });
            if (!invite || invite.invitedPlayerId !== command.playerId || invite.status !== "pending") {
                return null;
            }
            const membership = await tx.gangMember.create({
                data: {
                    gangId: invite.gangId,
                    playerId: invite.invitedPlayerId,
                    role: "member"
                }
            });
            const acceptedInvite = await tx.gangInvite.update({
                where: {
                    id: invite.id
                },
                data: {
                    status: "accepted"
                }
            });
            return {
                invite: toGangInviteSnapshot(acceptedInvite),
                membership: toGangMemberSnapshot(membership)
            };
        });
    }
    async declineInvite(command) {
        const prismaClient = this.prismaService;
        return prismaClient.$transaction(async (tx) => {
            const invite = await tx.gangInvite.findUnique({
                where: {
                    id: command.inviteId
                }
            });
            if (!invite || invite.invitedPlayerId !== command.playerId || invite.status !== "pending") {
                return null;
            }
            const declinedInvite = await tx.gangInvite.update({
                where: {
                    id: invite.id
                },
                data: {
                    status: "declined"
                }
            });
            return toGangInviteSnapshot(declinedInvite);
        });
    }
    async listGangMembers(gangId) {
        const prismaClient = this.prismaService;
        const memberships = await prismaClient.gangMember.findMany({
            where: {
                gangId
            },
            orderBy: {
                joinedAt: "asc"
            }
        });
        return memberships.map(toGangMemberSnapshot);
    }
    rethrowUniqueConstraintError(error, values) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002") {
            const target = Array.isArray(error.meta?.target) ? error.meta.target.join(",") : "";
            if (target.includes("name")) {
                throw new gangs_errors_1.GangNameTakenError(values.name);
            }
            if (target.includes("playerId")) {
                throw new gangs_errors_1.PlayerAlreadyInGangError(values.playerId);
            }
        }
    }
};
exports.PrismaGangsRepository = PrismaGangsRepository;
exports.PrismaGangsRepository = PrismaGangsRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_service_1.PrismaService)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaGangsRepository);
