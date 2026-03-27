"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const prisma_gangs_repository_1 = require("./prisma-gangs.repository");
(0, vitest_1.describe)("PrismaGangsRepository", () => {
    (0, vitest_1.it)("creates a gang and leader membership in one transaction", async () => {
        const now = new Date("2026-03-16T22:00:00.000Z");
        const playerId = crypto.randomUUID();
        const gangId = crypto.randomUUID();
        const transaction = {
            gang: {
                create: vitest_1.vi.fn().mockResolvedValue({
                    id: gangId,
                    name: "Night Owls",
                    createdAt: now,
                    createdByPlayerId: playerId
                })
            },
            gangMember: {
                create: vitest_1.vi.fn().mockResolvedValue({
                    id: crypto.randomUUID(),
                    gangId,
                    playerId,
                    role: "leader",
                    joinedAt: now
                })
            }
        };
        const repository = new prisma_gangs_repository_1.PrismaGangsRepository({
            $transaction: vitest_1.vi.fn().mockImplementation((callback) => callback(transaction))
        });
        const result = await repository.createGang({
            playerId,
            name: "Night Owls"
        });
        (0, vitest_1.expect)(result).toEqual({
            gang: {
                id: gangId,
                name: "Night Owls",
                createdAt: now,
                createdByPlayerId: playerId
            },
            membership: {
                id: vitest_1.expect.any(String),
                gangId,
                playerId,
                role: "leader",
                joinedAt: now
            }
        });
    });
    (0, vitest_1.it)("joins a gang as a member", async () => {
        const repository = new prisma_gangs_repository_1.PrismaGangsRepository({
            gangMember: {
                create: vitest_1.vi.fn().mockResolvedValue({
                    id: crypto.randomUUID(),
                    gangId: "gang-1",
                    playerId: "player-1",
                    role: "member",
                    joinedAt: new Date("2026-03-16T22:05:00.000Z")
                })
            }
        });
        const result = await repository.joinGang({
            gangId: "gang-1",
            playerId: "player-1"
        });
        (0, vitest_1.expect)(result).toMatchObject({
            gangId: "gang-1",
            playerId: "player-1",
            role: "member"
        });
    });
    (0, vitest_1.it)("lists members ordered by joined time", async () => {
        const now = new Date("2026-03-16T22:00:00.000Z");
        const repository = new prisma_gangs_repository_1.PrismaGangsRepository({
            gangMember: {
                findMany: vitest_1.vi.fn().mockResolvedValue([
                    {
                        id: "member-1",
                        gangId: "gang-1",
                        playerId: "player-1",
                        role: "leader",
                        joinedAt: now
                    }
                ])
            }
        });
        const result = await repository.listGangMembers("gang-1");
        (0, vitest_1.expect)(result).toEqual([
            {
                id: "member-1",
                gangId: "gang-1",
                playerId: "player-1",
                role: "leader",
                joinedAt: now
            }
        ]);
    });
    (0, vitest_1.it)("removes membership and deletes the gang when requested", async () => {
        const now = new Date("2026-03-16T22:00:00.000Z");
        const transaction = {
            gang: {
                delete: vitest_1.vi.fn().mockResolvedValue({
                    id: "gang-1",
                    name: "Night Owls",
                    createdAt: now,
                    createdByPlayerId: "player-1"
                })
            },
            gangMember: {
                findUnique: vitest_1.vi.fn().mockResolvedValue({
                    id: "member-1",
                    gangId: "gang-1",
                    playerId: "player-1",
                    role: "leader",
                    joinedAt: now
                }),
                delete: vitest_1.vi.fn().mockResolvedValue({
                    id: "member-1",
                    gangId: "gang-1",
                    playerId: "player-1",
                    role: "leader",
                    joinedAt: now
                })
            }
        };
        const repository = new prisma_gangs_repository_1.PrismaGangsRepository({
            $transaction: vitest_1.vi.fn().mockImplementation((callback) => callback(transaction))
        });
        const result = await repository.leaveGang({
            gangId: "gang-1",
            playerId: "player-1",
            deleteGang: true
        });
        (0, vitest_1.expect)(result).toEqual({
            membership: {
                id: "member-1",
                gangId: "gang-1",
                playerId: "player-1",
                role: "leader",
                joinedAt: now
            },
            gangDeleted: true
        });
    });
    (0, vitest_1.it)("creates a pending invite", async () => {
        const now = new Date("2026-03-17T00:20:00.000Z");
        const repository = new prisma_gangs_repository_1.PrismaGangsRepository({
            gangInvite: {
                create: vitest_1.vi.fn().mockResolvedValue({
                    id: "invite-1",
                    gangId: "gang-1",
                    invitedPlayerId: "player-2",
                    invitedByPlayerId: "player-1",
                    status: "pending",
                    createdAt: now
                })
            }
        });
        const result = await repository.createInvite({
            gangId: "gang-1",
            invitedPlayerId: "player-2",
            invitedByPlayerId: "player-1"
        });
        (0, vitest_1.expect)(result).toEqual({
            id: "invite-1",
            gangId: "gang-1",
            invitedPlayerId: "player-2",
            invitedByPlayerId: "player-1",
            status: "pending",
            createdAt: now
        });
    });
    (0, vitest_1.it)("accepts an invite and creates membership in one transaction", async () => {
        const now = new Date("2026-03-17T00:25:00.000Z");
        const transaction = {
            gangInvite: {
                findUnique: vitest_1.vi.fn().mockResolvedValue({
                    id: "invite-1",
                    gangId: "gang-1",
                    invitedPlayerId: "player-2",
                    invitedByPlayerId: "player-1",
                    status: "pending",
                    createdAt: now
                }),
                update: vitest_1.vi.fn().mockResolvedValue({
                    id: "invite-1",
                    gangId: "gang-1",
                    invitedPlayerId: "player-2",
                    invitedByPlayerId: "player-1",
                    status: "accepted",
                    createdAt: now
                })
            },
            gangMember: {
                create: vitest_1.vi.fn().mockResolvedValue({
                    id: "member-2",
                    gangId: "gang-1",
                    playerId: "player-2",
                    role: "member",
                    joinedAt: now
                })
            }
        };
        const repository = new prisma_gangs_repository_1.PrismaGangsRepository({
            $transaction: vitest_1.vi.fn().mockImplementation((callback) => callback(transaction))
        });
        const result = await repository.acceptInvite({
            inviteId: "invite-1",
            playerId: "player-2"
        });
        (0, vitest_1.expect)(result).toEqual({
            invite: {
                id: "invite-1",
                gangId: "gang-1",
                invitedPlayerId: "player-2",
                invitedByPlayerId: "player-1",
                status: "accepted",
                createdAt: now
            },
            membership: {
                id: "member-2",
                gangId: "gang-1",
                playerId: "player-2",
                role: "member",
                joinedAt: now
            }
        });
    });
});
