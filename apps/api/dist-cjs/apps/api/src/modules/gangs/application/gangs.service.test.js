"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const gangs_service_1 = require("./gangs.service");
function createPlayerServiceMock() {
    return {
        getPlayerById: vitest_1.vi.fn()
    };
}
function createDomainEventsServiceMock() {
    return {
        publish: vitest_1.vi.fn()
    };
}
function createGangsRepositoryMock() {
    return {
        acceptInvite: vitest_1.vi.fn(),
        countGangMembers: vitest_1.vi.fn(),
        createInvite: vitest_1.vi.fn(),
        createGang: vitest_1.vi.fn(),
        declineInvite: vitest_1.vi.fn(),
        findGangById: vitest_1.vi.fn(),
        findGangByName: vitest_1.vi.fn(),
        findInviteById: vitest_1.vi.fn(),
        findMembershipByPlayerId: vitest_1.vi.fn(),
        findPendingInviteByPlayerId: vitest_1.vi.fn(),
        joinGang: vitest_1.vi.fn(),
        leaveGang: vitest_1.vi.fn(),
        listGangInvites: vitest_1.vi.fn(),
        listGangMembers: vitest_1.vi.fn(),
        listPlayerGangInvites: vitest_1.vi.fn()
    };
}
(0, vitest_1.describe)("GangsService", () => {
    (0, vitest_1.it)("creates a gang and assigns the creator as leader", async () => {
        const playerId = crypto.randomUUID();
        const playerService = createPlayerServiceMock();
        const repository = createGangsRepositoryMock();
        vitest_1.vi.mocked(playerService.getPlayerById).mockResolvedValue({
            id: playerId,
            displayName: "Don Luca",
            cash: 2500,
            respect: 0,
            energy: 100,
            health: 100,
            jailedUntil: null,
            hospitalizedUntil: null,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        vitest_1.vi.mocked(repository.findGangByName).mockResolvedValue(null);
        vitest_1.vi.mocked(repository.findMembershipByPlayerId).mockResolvedValue(null);
        vitest_1.vi.mocked(repository.createGang).mockResolvedValue({
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
        const service = new gangs_service_1.GangsService(playerService, createDomainEventsServiceMock(), repository);
        const result = await service.createGang({
            playerId,
            name: "  Night   Owls  "
        });
        (0, vitest_1.expect)(repository.createGang).toHaveBeenCalledWith({
            playerId,
            name: "Night Owls"
        });
        (0, vitest_1.expect)(result.memberCount).toBe(1);
    });
    (0, vitest_1.it)("rejects gang joins when the player already belongs to a gang", async () => {
        const playerId = crypto.randomUUID();
        const gangId = crypto.randomUUID();
        const playerService = createPlayerServiceMock();
        const repository = createGangsRepositoryMock();
        vitest_1.vi.mocked(playerService.getPlayerById).mockResolvedValue({
            id: playerId,
            displayName: "Don Luca",
            cash: 2500,
            respect: 0,
            energy: 100,
            health: 100,
            jailedUntil: null,
            hospitalizedUntil: null,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        vitest_1.vi.mocked(repository.findGangById).mockResolvedValue({
            id: gangId,
            name: "Night Owls",
            createdAt: new Date(),
            createdByPlayerId: crypto.randomUUID()
        });
        vitest_1.vi.mocked(repository.countGangMembers).mockResolvedValue(1);
        vitest_1.vi.mocked(repository.findMembershipByPlayerId).mockResolvedValue({
            id: crypto.randomUUID(),
            gangId: crypto.randomUUID(),
            playerId,
            role: "member",
            joinedAt: new Date()
        });
        const service = new gangs_service_1.GangsService(playerService, createDomainEventsServiceMock(), repository);
        await (0, vitest_1.expect)(service.joinGang({ gangId, playerId })).rejects.toMatchObject({
            status: 409
        });
    });
    (0, vitest_1.it)("allows only gang leaders to act for gang-authorized actions", async () => {
        const playerId = crypto.randomUUID();
        const gangId = crypto.randomUUID();
        const playerService = createPlayerServiceMock();
        const repository = createGangsRepositoryMock();
        vitest_1.vi.mocked(playerService.getPlayerById).mockResolvedValue({
            id: playerId,
            displayName: "Don Luca",
            cash: 2500,
            respect: 0,
            energy: 100,
            health: 100,
            jailedUntil: null,
            hospitalizedUntil: null,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        vitest_1.vi.mocked(repository.findGangById).mockResolvedValue({
            id: gangId,
            name: "Night Owls",
            createdAt: new Date(),
            createdByPlayerId: playerId
        });
        vitest_1.vi.mocked(repository.countGangMembers).mockResolvedValue(1);
        vitest_1.vi.mocked(repository.findMembershipByPlayerId).mockResolvedValue({
            id: crypto.randomUUID(),
            gangId,
            playerId,
            role: "leader",
            joinedAt: new Date()
        });
        const service = new gangs_service_1.GangsService(playerService, createDomainEventsServiceMock(), repository);
        await (0, vitest_1.expect)(service.assertPlayerIsGangLeader(gangId, playerId)).resolves.toBeUndefined();
    });
    (0, vitest_1.it)("lists gang members with player display names", async () => {
        const gangId = crypto.randomUUID();
        const leaderId = crypto.randomUUID();
        const memberId = crypto.randomUUID();
        const playerService = createPlayerServiceMock();
        const repository = createGangsRepositoryMock();
        vitest_1.vi.mocked(repository.findGangById).mockResolvedValue({
            id: gangId,
            name: "Night Owls",
            createdAt: new Date(),
            createdByPlayerId: leaderId
        });
        vitest_1.vi.mocked(repository.countGangMembers).mockResolvedValue(2);
        vitest_1.vi.mocked(repository.listGangMembers).mockResolvedValue([
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
        vitest_1.vi.mocked(playerService.getPlayerById)
            .mockResolvedValueOnce({
            id: leaderId,
            displayName: "Don Luca",
            cash: 2500,
            respect: 0,
            energy: 100,
            health: 100,
            jailedUntil: null,
            hospitalizedUntil: null,
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
            createdAt: new Date(),
            updatedAt: new Date()
        });
        const service = new gangs_service_1.GangsService(playerService, createDomainEventsServiceMock(), repository);
        const result = await service.listGangMembers(gangId);
        (0, vitest_1.expect)(result).toMatchObject([
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
    (0, vitest_1.it)("allows a non-leader to leave a gang", async () => {
        const playerId = crypto.randomUUID();
        const gangId = crypto.randomUUID();
        const playerService = createPlayerServiceMock();
        const repository = createGangsRepositoryMock();
        vitest_1.vi.mocked(repository.findMembershipByPlayerId).mockResolvedValue({
            id: crypto.randomUUID(),
            gangId,
            playerId,
            role: "member",
            joinedAt: new Date()
        });
        vitest_1.vi.mocked(repository.listGangMembers).mockResolvedValue([
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
        vitest_1.vi.mocked(repository.leaveGang).mockResolvedValue({
            membership: {
                id: crypto.randomUUID(),
                gangId,
                playerId,
                role: "member",
                joinedAt: new Date()
            },
            gangDeleted: false
        });
        const service = new gangs_service_1.GangsService(playerService, createDomainEventsServiceMock(), repository);
        const result = await service.leaveGang({ gangId, playerId });
        (0, vitest_1.expect)(result).toEqual({
            gangId,
            playerId,
            role: "member",
            gangDeleted: false
        });
    });
    (0, vitest_1.it)("deletes the gang when the solo leader leaves", async () => {
        const playerId = crypto.randomUUID();
        const gangId = crypto.randomUUID();
        const playerService = createPlayerServiceMock();
        const repository = createGangsRepositoryMock();
        vitest_1.vi.mocked(repository.findMembershipByPlayerId).mockResolvedValue({
            id: crypto.randomUUID(),
            gangId,
            playerId,
            role: "leader",
            joinedAt: new Date()
        });
        vitest_1.vi.mocked(repository.listGangMembers).mockResolvedValue([
            {
                id: crypto.randomUUID(),
                gangId,
                playerId,
                role: "leader",
                joinedAt: new Date()
            }
        ]);
        vitest_1.vi.mocked(repository.leaveGang).mockResolvedValue({
            membership: {
                id: crypto.randomUUID(),
                gangId,
                playerId,
                role: "leader",
                joinedAt: new Date()
            },
            gangDeleted: true
        });
        const service = new gangs_service_1.GangsService(playerService, createDomainEventsServiceMock(), repository);
        const result = await service.leaveGang({ gangId, playerId });
        (0, vitest_1.expect)(repository.leaveGang).toHaveBeenCalledWith({
            gangId,
            playerId,
            deleteGang: true
        });
        (0, vitest_1.expect)(result.gangDeleted).toBe(true);
    });
    (0, vitest_1.it)("rejects leader leave while other members remain", async () => {
        const playerId = crypto.randomUUID();
        const gangId = crypto.randomUUID();
        const playerService = createPlayerServiceMock();
        const repository = createGangsRepositoryMock();
        vitest_1.vi.mocked(repository.findMembershipByPlayerId).mockResolvedValue({
            id: crypto.randomUUID(),
            gangId,
            playerId,
            role: "leader",
            joinedAt: new Date()
        });
        vitest_1.vi.mocked(repository.listGangMembers).mockResolvedValue([
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
        const service = new gangs_service_1.GangsService(playerService, createDomainEventsServiceMock(), repository);
        await (0, vitest_1.expect)(service.leaveGang({ gangId, playerId })).rejects.toMatchObject({
            status: 409
        });
    });
    (0, vitest_1.it)("allows only leaders to send invites", async () => {
        const gangId = crypto.randomUUID();
        const invitedPlayerId = crypto.randomUUID();
        const invitedByPlayerId = crypto.randomUUID();
        const playerService = createPlayerServiceMock();
        const repository = createGangsRepositoryMock();
        vitest_1.vi.mocked(playerService.getPlayerById)
            .mockResolvedValueOnce({
            id: invitedPlayerId,
            displayName: "Nina Vale",
            cash: 2500,
            respect: 0,
            energy: 100,
            health: 100,
            jailedUntil: null,
            hospitalizedUntil: null,
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
            createdAt: new Date(),
            updatedAt: new Date()
        });
        vitest_1.vi.mocked(repository.findGangById).mockResolvedValue({
            id: gangId,
            name: "Night Owls",
            createdAt: new Date(),
            createdByPlayerId: invitedByPlayerId
        });
        vitest_1.vi.mocked(repository.countGangMembers).mockResolvedValue(2);
        vitest_1.vi.mocked(repository.findMembershipByPlayerId).mockResolvedValue({
            id: crypto.randomUUID(),
            gangId,
            playerId: invitedByPlayerId,
            role: "member",
            joinedAt: new Date()
        });
        const service = new gangs_service_1.GangsService(playerService, createDomainEventsServiceMock(), repository);
        await (0, vitest_1.expect)(service.invitePlayer({
            gangId,
            invitedPlayerId,
            invitedByPlayerId
        })).rejects.toMatchObject({
            status: 409
        });
    });
    (0, vitest_1.it)("creates a pending invite from a leader", async () => {
        const gangId = crypto.randomUUID();
        const invitedPlayerId = crypto.randomUUID();
        const invitedByPlayerId = crypto.randomUUID();
        const playerService = createPlayerServiceMock();
        const repository = createGangsRepositoryMock();
        vitest_1.vi.mocked(playerService.getPlayerById)
            .mockResolvedValueOnce({
            id: invitedPlayerId,
            displayName: "Nina Vale",
            cash: 2500,
            respect: 0,
            energy: 100,
            health: 100,
            jailedUntil: null,
            hospitalizedUntil: null,
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
            createdAt: new Date(),
            updatedAt: new Date()
        });
        vitest_1.vi.mocked(repository.findGangById).mockResolvedValue({
            id: gangId,
            name: "Night Owls",
            createdAt: new Date(),
            createdByPlayerId: invitedByPlayerId
        });
        vitest_1.vi.mocked(repository.countGangMembers).mockResolvedValue(1);
        vitest_1.vi.mocked(repository.findMembershipByPlayerId)
            .mockResolvedValueOnce({
            id: crypto.randomUUID(),
            gangId,
            playerId: invitedByPlayerId,
            role: "leader",
            joinedAt: new Date()
        })
            .mockResolvedValueOnce(null);
        vitest_1.vi.mocked(repository.findPendingInviteByPlayerId).mockResolvedValue(null);
        vitest_1.vi.mocked(repository.createInvite).mockResolvedValue({
            id: crypto.randomUUID(),
            gangId,
            invitedPlayerId,
            invitedByPlayerId,
            status: "pending",
            createdAt: new Date("2026-03-17T00:20:00.000Z")
        });
        const domainEventsService = createDomainEventsServiceMock();
        const service = new gangs_service_1.GangsService(playerService, domainEventsService, repository);
        const result = await service.invitePlayer({
            gangId,
            invitedPlayerId,
            invitedByPlayerId
        });
        (0, vitest_1.expect)(result.status).toBe("pending");
        (0, vitest_1.expect)(result.gangName).toBe("Night Owls");
        (0, vitest_1.expect)(domainEventsService.publish).toHaveBeenCalledWith({
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
    (0, vitest_1.it)("accepts a pending invite and creates membership", async () => {
        const inviteId = crypto.randomUUID();
        const gangId = crypto.randomUUID();
        const playerId = crypto.randomUUID();
        const inviterId = crypto.randomUUID();
        const playerService = createPlayerServiceMock();
        const repository = createGangsRepositoryMock();
        vitest_1.vi.mocked(repository.findInviteById).mockResolvedValue({
            id: inviteId,
            gangId,
            invitedPlayerId: playerId,
            invitedByPlayerId: inviterId,
            status: "pending",
            createdAt: new Date()
        });
        vitest_1.vi.mocked(repository.findMembershipByPlayerId).mockResolvedValue(null);
        vitest_1.vi.mocked(repository.acceptInvite).mockResolvedValue({
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
        vitest_1.vi.mocked(playerService.getPlayerById).mockResolvedValue({
            id: playerId,
            displayName: "Nina Vale",
            cash: 2500,
            respect: 0,
            energy: 100,
            health: 100,
            jailedUntil: null,
            hospitalizedUntil: null,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        const service = new gangs_service_1.GangsService(playerService, createDomainEventsServiceMock(), repository);
        const result = await service.acceptInvite({
            inviteId,
            playerId
        });
        (0, vitest_1.expect)(result.status).toBe("accepted");
        (0, vitest_1.expect)(result.membership?.role).toBe("member");
    });
    (0, vitest_1.it)("declines a pending invite and keeps it inactive", async () => {
        const inviteId = crypto.randomUUID();
        const gangId = crypto.randomUUID();
        const playerId = crypto.randomUUID();
        const inviterId = crypto.randomUUID();
        const playerService = createPlayerServiceMock();
        const repository = createGangsRepositoryMock();
        vitest_1.vi.mocked(repository.findInviteById).mockResolvedValue({
            id: inviteId,
            gangId,
            invitedPlayerId: playerId,
            invitedByPlayerId: inviterId,
            status: "pending",
            createdAt: new Date()
        });
        vitest_1.vi.mocked(repository.declineInvite).mockResolvedValue({
            id: inviteId,
            gangId,
            invitedPlayerId: playerId,
            invitedByPlayerId: inviterId,
            status: "declined",
            createdAt: new Date()
        });
        const service = new gangs_service_1.GangsService(playerService, createDomainEventsServiceMock(), repository);
        const result = await service.declineInvite({
            inviteId,
            playerId
        });
        (0, vitest_1.expect)(result).toEqual({
            inviteId,
            status: "declined",
            membership: null
        });
    });
});
