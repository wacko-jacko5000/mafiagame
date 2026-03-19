import { describe, expect, it, vi } from "vitest";

import { PrismaGangsRepository } from "./prisma-gangs.repository";

describe("PrismaGangsRepository", () => {
  it("creates a gang and leader membership in one transaction", async () => {
    const now = new Date("2026-03-16T22:00:00.000Z");
    const playerId = crypto.randomUUID();
    const gangId = crypto.randomUUID();
    const transaction = {
      gang: {
        create: vi.fn().mockResolvedValue({
          id: gangId,
          name: "Night Owls",
          createdAt: now,
          createdByPlayerId: playerId
        })
      },
      gangMember: {
        create: vi.fn().mockResolvedValue({
          id: crypto.randomUUID(),
          gangId,
          playerId,
          role: "leader",
          joinedAt: now
        })
      }
    };
    const repository = new PrismaGangsRepository({
      $transaction: vi.fn().mockImplementation((callback) => callback(transaction))
    } as never);

    const result = await repository.createGang({
      playerId,
      name: "Night Owls"
    });

    expect(result).toEqual({
      gang: {
        id: gangId,
        name: "Night Owls",
        createdAt: now,
        createdByPlayerId: playerId
      },
      membership: {
        id: expect.any(String),
        gangId,
        playerId,
        role: "leader",
        joinedAt: now
      }
    });
  });

  it("joins a gang as a member", async () => {
    const repository = new PrismaGangsRepository({
      gangMember: {
        create: vi.fn().mockResolvedValue({
          id: crypto.randomUUID(),
          gangId: "gang-1",
          playerId: "player-1",
          role: "member",
          joinedAt: new Date("2026-03-16T22:05:00.000Z")
        })
      }
    } as never);

    const result = await repository.joinGang({
      gangId: "gang-1",
      playerId: "player-1"
    });

    expect(result).toMatchObject({
      gangId: "gang-1",
      playerId: "player-1",
      role: "member"
    });
  });

  it("lists members ordered by joined time", async () => {
    const now = new Date("2026-03-16T22:00:00.000Z");
    const repository = new PrismaGangsRepository({
      gangMember: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: "member-1",
            gangId: "gang-1",
            playerId: "player-1",
            role: "leader",
            joinedAt: now
          }
        ])
      }
    } as never);

    const result = await repository.listGangMembers("gang-1");

    expect(result).toEqual([
      {
        id: "member-1",
        gangId: "gang-1",
        playerId: "player-1",
        role: "leader",
        joinedAt: now
      }
    ]);
  });

  it("removes membership and deletes the gang when requested", async () => {
    const now = new Date("2026-03-16T22:00:00.000Z");
    const transaction = {
      gang: {
        delete: vi.fn().mockResolvedValue({
          id: "gang-1",
          name: "Night Owls",
          createdAt: now,
          createdByPlayerId: "player-1"
        })
      },
      gangMember: {
        findUnique: vi.fn().mockResolvedValue({
          id: "member-1",
          gangId: "gang-1",
          playerId: "player-1",
          role: "leader",
          joinedAt: now
        }),
        delete: vi.fn().mockResolvedValue({
          id: "member-1",
          gangId: "gang-1",
          playerId: "player-1",
          role: "leader",
          joinedAt: now
        })
      }
    };
    const repository = new PrismaGangsRepository({
      $transaction: vi.fn().mockImplementation((callback) => callback(transaction))
    } as never);

    const result = await repository.leaveGang({
      gangId: "gang-1",
      playerId: "player-1",
      deleteGang: true
    });

    expect(result).toEqual({
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

  it("creates a pending invite", async () => {
    const now = new Date("2026-03-17T00:20:00.000Z");
    const repository = new PrismaGangsRepository({
      gangInvite: {
        create: vi.fn().mockResolvedValue({
          id: "invite-1",
          gangId: "gang-1",
          invitedPlayerId: "player-2",
          invitedByPlayerId: "player-1",
          status: "pending",
          createdAt: now
        })
      }
    } as never);

    const result = await repository.createInvite({
      gangId: "gang-1",
      invitedPlayerId: "player-2",
      invitedByPlayerId: "player-1"
    });

    expect(result).toEqual({
      id: "invite-1",
      gangId: "gang-1",
      invitedPlayerId: "player-2",
      invitedByPlayerId: "player-1",
      status: "pending",
      createdAt: now
    });
  });

  it("accepts an invite and creates membership in one transaction", async () => {
    const now = new Date("2026-03-17T00:25:00.000Z");
    const transaction = {
      gangInvite: {
        findUnique: vi.fn().mockResolvedValue({
          id: "invite-1",
          gangId: "gang-1",
          invitedPlayerId: "player-2",
          invitedByPlayerId: "player-1",
          status: "pending",
          createdAt: now
        }),
        update: vi.fn().mockResolvedValue({
          id: "invite-1",
          gangId: "gang-1",
          invitedPlayerId: "player-2",
          invitedByPlayerId: "player-1",
          status: "accepted",
          createdAt: now
        })
      },
      gangMember: {
        create: vi.fn().mockResolvedValue({
          id: "member-2",
          gangId: "gang-1",
          playerId: "player-2",
          role: "member",
          joinedAt: now
        })
      }
    };
    const repository = new PrismaGangsRepository({
      $transaction: vi.fn().mockImplementation((callback) => callback(transaction))
    } as never);

    const result = await repository.acceptInvite({
      inviteId: "invite-1",
      playerId: "player-2"
    });

    expect(result).toEqual({
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
