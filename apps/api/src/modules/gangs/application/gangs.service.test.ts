import { describe, expect, it, vi } from "vitest";

import { DomainEventsService } from "../../../platform/domain-events/domain-events.service";
import { PlayerService } from "../../player/application/player.service";
import { GangsService } from "./gangs.service";
import type { GangsRepository } from "./gangs.repository";

function createPlayerServiceMock() {
  return {
    getPlayerById: vi.fn()
  } as unknown as PlayerService;
}

function createDomainEventsServiceMock() {
  return {
    publish: vi.fn()
  } as unknown as DomainEventsService;
}

function createGangsRepositoryMock(): GangsRepository {
  return {
    acceptInvite: vi.fn(),
    countGangMembers: vi.fn(),
    createInvite: vi.fn(),
    createGang: vi.fn(),
    declineInvite: vi.fn(),
    findGangById: vi.fn(),
    findGangByName: vi.fn(),
    findInviteById: vi.fn(),
    findMembershipByPlayerId: vi.fn(),
    findPendingInviteByPlayerId: vi.fn(),
    joinGang: vi.fn(),
    leaveGang: vi.fn(),
    listGangInvites: vi.fn(),
    listGangMembers: vi.fn()
    ,
    listPlayerGangInvites: vi.fn()
  };
}

describe("GangsService", () => {
  it("creates a gang and assigns the creator as leader", async () => {
    const playerId = crypto.randomUUID();
    const playerService = createPlayerServiceMock();
    const repository = createGangsRepositoryMock();

    vi.mocked(playerService.getPlayerById).mockResolvedValue({
      id: playerId,
      displayName: "Don Luca",
      cash: 2500,
      respect: 0,
      energy: 100,
      health: 100,
      jailedUntil: null,
      hospitalizedUntil: null,
      heat: 0,
      heatUpdatedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });
    vi.mocked(repository.findGangByName).mockResolvedValue(null);
    vi.mocked(repository.findMembershipByPlayerId).mockResolvedValue(null);
    vi.mocked(repository.createGang).mockResolvedValue({
      gang: {
        id: crypto.randomUUID(),
        name: "Night Owls",
        createdAt: new Date("2026-03-16T22:00:00.000Z"),
        createdByPlayerId: playerId
      },
      membership: {
        id: crypto.randomUUID(),
        gangId: crypto.randomUUID(),
        playerId,
        role: "leader",
        joinedAt: new Date("2026-03-16T22:00:00.000Z")
      }
    });

    const service = new GangsService(
      playerService,
      createDomainEventsServiceMock(),
      repository
    );
    const result = await service.createGang({
      playerId,
      name: "  Night   Owls  "
    });

    expect(repository.createGang).toHaveBeenCalledWith({
      playerId,
      name: "Night Owls"
    });
    expect(result.memberCount).toBe(1);
  });

  it("rejects gang joins when the player already belongs to a gang", async () => {
    const playerId = crypto.randomUUID();
    const gangId = crypto.randomUUID();
    const playerService = createPlayerServiceMock();
    const repository = createGangsRepositoryMock();

    vi.mocked(playerService.getPlayerById).mockResolvedValue({
      id: playerId,
      displayName: "Don Luca",
      cash: 2500,
      respect: 0,
      energy: 100,
      health: 100,
      jailedUntil: null,
      hospitalizedUntil: null,
      heat: 0,
      heatUpdatedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });
    vi.mocked(repository.findGangById).mockResolvedValue({
      id: gangId,
      name: "Night Owls",
      createdAt: new Date(),
      createdByPlayerId: crypto.randomUUID()
    });
    vi.mocked(repository.countGangMembers).mockResolvedValue(1);
    vi.mocked(repository.findMembershipByPlayerId).mockResolvedValue({
      id: crypto.randomUUID(),
      gangId: crypto.randomUUID(),
      playerId,
      role: "member",
      joinedAt: new Date()
    });

    const service = new GangsService(
      playerService,
      createDomainEventsServiceMock(),
      repository
    );

    await expect(service.joinGang({ gangId, playerId })).rejects.toMatchObject({
      status: 409
    });
  });

  it("allows only gang leaders to act for gang-authorized actions", async () => {
    const playerId = crypto.randomUUID();
    const gangId = crypto.randomUUID();
    const playerService = createPlayerServiceMock();
    const repository = createGangsRepositoryMock();

    vi.mocked(playerService.getPlayerById).mockResolvedValue({
      id: playerId,
      displayName: "Don Luca",
      cash: 2500,
      respect: 0,
      energy: 100,
      health: 100,
      jailedUntil: null,
      hospitalizedUntil: null,
      heat: 0,
      heatUpdatedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });
    vi.mocked(repository.findGangById).mockResolvedValue({
      id: gangId,
      name: "Night Owls",
      createdAt: new Date(),
      createdByPlayerId: playerId
    });
    vi.mocked(repository.countGangMembers).mockResolvedValue(1);
    vi.mocked(repository.findMembershipByPlayerId).mockResolvedValue({
      id: crypto.randomUUID(),
      gangId,
      playerId,
      role: "leader",
      joinedAt: new Date()
    });

    const service = new GangsService(
      playerService,
      createDomainEventsServiceMock(),
      repository
    );

    await expect(service.assertPlayerIsGangLeader(gangId, playerId)).resolves.toBeUndefined();
  });

  it("lists gang members with player display names", async () => {
    const gangId = crypto.randomUUID();
    const leaderId = crypto.randomUUID();
    const memberId = crypto.randomUUID();
    const playerService = createPlayerServiceMock();
    const repository = createGangsRepositoryMock();

    vi.mocked(repository.findGangById).mockResolvedValue({
      id: gangId,
      name: "Night Owls",
      createdAt: new Date(),
      createdByPlayerId: leaderId
    });
    vi.mocked(repository.countGangMembers).mockResolvedValue(2);
    vi.mocked(repository.listGangMembers).mockResolvedValue([
      {
        id: crypto.randomUUID(),
        gangId,
        playerId: leaderId,
        role: "leader",
        joinedAt: new Date("2026-03-16T22:00:00.000Z")
      },
      {
        id: crypto.randomUUID(),
        gangId,
        playerId: memberId,
        role: "member",
        joinedAt: new Date("2026-03-16T22:05:00.000Z")
      }
    ]);
    vi.mocked(playerService.getPlayerById)
      .mockResolvedValueOnce({
        id: leaderId,
        displayName: "Don Luca",
        cash: 2500,
        respect: 0,
        energy: 100,
        health: 100,
        jailedUntil: null,
        hospitalizedUntil: null,
        heat: 0,
        heatUpdatedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .mockResolvedValueOnce({
        id: memberId,
        displayName: "Nina Vale",
        cash: 2500,
        respect: 0,
        energy: 100,
        health: 100,
        jailedUntil: null,
        hospitalizedUntil: null,
        heat: 0,
        heatUpdatedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });

    const service = new GangsService(
      playerService,
      createDomainEventsServiceMock(),
      repository
    );
    const result = await service.listGangMembers(gangId);

    expect(result).toMatchObject([
      {
        playerId: leaderId,
        displayName: "Don Luca",
        role: "leader"
      },
      {
        playerId: memberId,
        displayName: "Nina Vale",
        role: "member"
      }
    ]);
  });

  it("allows a non-leader to leave a gang", async () => {
    const playerId = crypto.randomUUID();
    const gangId = crypto.randomUUID();
    const playerService = createPlayerServiceMock();
    const repository = createGangsRepositoryMock();

    vi.mocked(repository.findMembershipByPlayerId).mockResolvedValue({
      id: crypto.randomUUID(),
      gangId,
      playerId,
      role: "member",
      joinedAt: new Date()
    });
    vi.mocked(repository.listGangMembers).mockResolvedValue([
      {
        id: crypto.randomUUID(),
        gangId,
        playerId: crypto.randomUUID(),
        role: "leader",
        joinedAt: new Date()
      },
      {
        id: crypto.randomUUID(),
        gangId,
        playerId,
        role: "member",
        joinedAt: new Date()
      }
    ]);
    vi.mocked(repository.leaveGang).mockResolvedValue({
      membership: {
        id: crypto.randomUUID(),
        gangId,
        playerId,
        role: "member",
        joinedAt: new Date()
      },
      gangDeleted: false
    });

    const service = new GangsService(
      playerService,
      createDomainEventsServiceMock(),
      repository
    );
    const result = await service.leaveGang({ gangId, playerId });

    expect(result).toEqual({
      gangId,
      playerId,
      role: "member",
      gangDeleted: false
    });
  });

  it("deletes the gang when the solo leader leaves", async () => {
    const playerId = crypto.randomUUID();
    const gangId = crypto.randomUUID();
    const playerService = createPlayerServiceMock();
    const repository = createGangsRepositoryMock();

    vi.mocked(repository.findMembershipByPlayerId).mockResolvedValue({
      id: crypto.randomUUID(),
      gangId,
      playerId,
      role: "leader",
      joinedAt: new Date()
    });
    vi.mocked(repository.listGangMembers).mockResolvedValue([
      {
        id: crypto.randomUUID(),
        gangId,
        playerId,
        role: "leader",
        joinedAt: new Date()
      }
    ]);
    vi.mocked(repository.leaveGang).mockResolvedValue({
      membership: {
        id: crypto.randomUUID(),
        gangId,
        playerId,
        role: "leader",
        joinedAt: new Date()
      },
      gangDeleted: true
    });

    const service = new GangsService(
      playerService,
      createDomainEventsServiceMock(),
      repository
    );
    const result = await service.leaveGang({ gangId, playerId });

    expect(repository.leaveGang).toHaveBeenCalledWith({
      gangId,
      playerId,
      deleteGang: true
    });
    expect(result.gangDeleted).toBe(true);
  });

  it("rejects leader leave while other members remain", async () => {
    const playerId = crypto.randomUUID();
    const gangId = crypto.randomUUID();
    const playerService = createPlayerServiceMock();
    const repository = createGangsRepositoryMock();

    vi.mocked(repository.findMembershipByPlayerId).mockResolvedValue({
      id: crypto.randomUUID(),
      gangId,
      playerId,
      role: "leader",
      joinedAt: new Date()
    });
    vi.mocked(repository.listGangMembers).mockResolvedValue([
      {
        id: crypto.randomUUID(),
        gangId,
        playerId,
        role: "leader",
        joinedAt: new Date()
      },
      {
        id: crypto.randomUUID(),
        gangId,
        playerId: crypto.randomUUID(),
        role: "member",
        joinedAt: new Date()
      }
    ]);

    const service = new GangsService(
      playerService,
      createDomainEventsServiceMock(),
      repository
    );

    await expect(service.leaveGang({ gangId, playerId })).rejects.toMatchObject({
      status: 409
    });
  });

  it("allows only leaders to send invites", async () => {
    const gangId = crypto.randomUUID();
    const invitedPlayerId = crypto.randomUUID();
    const invitedByPlayerId = crypto.randomUUID();
    const playerService = createPlayerServiceMock();
    const repository = createGangsRepositoryMock();

    vi.mocked(playerService.getPlayerById)
      .mockResolvedValueOnce({
        id: invitedPlayerId,
        displayName: "Nina Vale",
        cash: 2500,
        respect: 0,
        energy: 100,
        health: 100,
        jailedUntil: null,
        hospitalizedUntil: null,
        heat: 0,
        heatUpdatedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .mockResolvedValueOnce({
        id: invitedByPlayerId,
        displayName: "Don Luca",
        cash: 2500,
        respect: 0,
        energy: 100,
        health: 100,
        jailedUntil: null,
        hospitalizedUntil: null,
        heat: 0,
        heatUpdatedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });
    vi.mocked(repository.findGangById).mockResolvedValue({
      id: gangId,
      name: "Night Owls",
      createdAt: new Date(),
      createdByPlayerId: invitedByPlayerId
    });
    vi.mocked(repository.countGangMembers).mockResolvedValue(2);
    vi.mocked(repository.findMembershipByPlayerId).mockResolvedValue({
      id: crypto.randomUUID(),
      gangId,
      playerId: invitedByPlayerId,
      role: "member",
      joinedAt: new Date()
    });

    const service = new GangsService(
      playerService,
      createDomainEventsServiceMock(),
      repository
    );

    await expect(
      service.invitePlayer({
        gangId,
        invitedPlayerId,
        invitedByPlayerId
      })
    ).rejects.toMatchObject({
      status: 409
    });
  });

  it("creates a pending invite from a leader", async () => {
    const gangId = crypto.randomUUID();
    const invitedPlayerId = crypto.randomUUID();
    const invitedByPlayerId = crypto.randomUUID();
    const playerService = createPlayerServiceMock();
    const repository = createGangsRepositoryMock();

    vi.mocked(playerService.getPlayerById)
      .mockResolvedValueOnce({
        id: invitedPlayerId,
        displayName: "Nina Vale",
        cash: 2500,
        respect: 0,
        energy: 100,
        health: 100,
        jailedUntil: null,
        hospitalizedUntil: null,
        heat: 0,
        heatUpdatedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .mockResolvedValueOnce({
        id: invitedByPlayerId,
        displayName: "Don Luca",
        cash: 2500,
        respect: 0,
        energy: 100,
        health: 100,
        jailedUntil: null,
        hospitalizedUntil: null,
        heat: 0,
        heatUpdatedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .mockResolvedValueOnce({
        id: invitedPlayerId,
        displayName: "Nina Vale",
        cash: 2500,
        respect: 0,
        energy: 100,
        health: 100,
        jailedUntil: null,
        hospitalizedUntil: null,
        heat: 0,
        heatUpdatedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });
    vi.mocked(repository.findGangById).mockResolvedValue({
      id: gangId,
      name: "Night Owls",
      createdAt: new Date(),
      createdByPlayerId: invitedByPlayerId
    });
    vi.mocked(repository.countGangMembers).mockResolvedValue(1);
    vi.mocked(repository.findMembershipByPlayerId)
      .mockResolvedValueOnce({
        id: crypto.randomUUID(),
        gangId,
        playerId: invitedByPlayerId,
        role: "leader",
        joinedAt: new Date()
      })
      .mockResolvedValueOnce(null);
    vi.mocked(repository.findPendingInviteByPlayerId).mockResolvedValue(null);
    vi.mocked(repository.createInvite).mockResolvedValue({
      id: crypto.randomUUID(),
      gangId,
      invitedPlayerId,
      invitedByPlayerId,
      status: "pending",
      createdAt: new Date("2026-03-17T00:20:00.000Z")
    });

    const domainEventsService = createDomainEventsServiceMock();
    const service = new GangsService(playerService, domainEventsService, repository);
    const result = await service.invitePlayer({
      gangId,
      invitedPlayerId,
      invitedByPlayerId
    });

    expect(result.status).toBe("pending");
    expect(result.gangName).toBe("Night Owls");
    expect(domainEventsService.publish).toHaveBeenCalledWith({
      type: "gangs.invite_received",
      occurredAt: new Date("2026-03-17T00:20:00.000Z"),
      inviteId: result.id,
      gangId,
      gangName: "Night Owls",
      invitedPlayerId,
      invitedByPlayerId,
      invitedByPlayerDisplayName: "Don Luca"
    });
  });

  it("accepts a pending invite and creates membership", async () => {
    const inviteId = crypto.randomUUID();
    const gangId = crypto.randomUUID();
    const playerId = crypto.randomUUID();
    const inviterId = crypto.randomUUID();
    const playerService = createPlayerServiceMock();
    const repository = createGangsRepositoryMock();

    vi.mocked(repository.findInviteById).mockResolvedValue({
      id: inviteId,
      gangId,
      invitedPlayerId: playerId,
      invitedByPlayerId: inviterId,
      status: "pending",
      createdAt: new Date()
    });
    vi.mocked(repository.findMembershipByPlayerId).mockResolvedValue(null);
    vi.mocked(repository.acceptInvite).mockResolvedValue({
      invite: {
        id: inviteId,
        gangId,
        invitedPlayerId: playerId,
        invitedByPlayerId: inviterId,
        status: "accepted",
        createdAt: new Date()
      },
      membership: {
        id: crypto.randomUUID(),
        gangId,
        playerId,
        role: "member",
        joinedAt: new Date("2026-03-17T00:25:00.000Z")
      }
    });
    vi.mocked(playerService.getPlayerById).mockResolvedValue({
      id: playerId,
      displayName: "Nina Vale",
      cash: 2500,
      respect: 0,
      energy: 100,
      health: 100,
      jailedUntil: null,
      hospitalizedUntil: null,
      heat: 0,
      heatUpdatedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const service = new GangsService(
      playerService,
      createDomainEventsServiceMock(),
      repository
    );
    const result = await service.acceptInvite({
      inviteId,
      playerId
    });

    expect(result.status).toBe("accepted");
    expect(result.membership?.role).toBe("member");
  });

  it("declines a pending invite and keeps it inactive", async () => {
    const inviteId = crypto.randomUUID();
    const gangId = crypto.randomUUID();
    const playerId = crypto.randomUUID();
    const inviterId = crypto.randomUUID();
    const playerService = createPlayerServiceMock();
    const repository = createGangsRepositoryMock();

    vi.mocked(repository.findInviteById).mockResolvedValue({
      id: inviteId,
      gangId,
      invitedPlayerId: playerId,
      invitedByPlayerId: inviterId,
      status: "pending",
      createdAt: new Date()
    });
    vi.mocked(repository.declineInvite).mockResolvedValue({
      id: inviteId,
      gangId,
      invitedPlayerId: playerId,
      invitedByPlayerId: inviterId,
      status: "declined",
      createdAt: new Date()
    });

    const service = new GangsService(
      playerService,
      createDomainEventsServiceMock(),
      repository
    );
    const result = await service.declineInvite({
      inviteId,
      playerId
    });

    expect(result).toEqual({
      inviteId,
      status: "declined",
      membership: null
    });
  });
});
