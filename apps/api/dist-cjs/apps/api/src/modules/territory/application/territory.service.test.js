"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const territory_service_1 = require("./territory.service");
function createPlayerServiceMock() {
    return {
        applyResourceDelta: vitest_1.vi.fn()
    };
}
function createGangsServiceMock() {
    return {
        assertPlayerIsGangLeader: vitest_1.vi.fn(),
        getGangById: vitest_1.vi.fn()
    };
}
function createDomainEventsServiceMock() {
    return {
        publish: vitest_1.vi.fn()
    };
}
function createTerritoryRepositoryMock() {
    return {
        claimDistrict: vitest_1.vi.fn(),
        claimDistrictPayout: vitest_1.vi.fn(),
        findActiveWarByDistrictId: vitest_1.vi.fn(),
        findDistrictById: vitest_1.vi.fn(),
        findWarById: vitest_1.vi.fn(),
        listDistricts: vitest_1.vi.fn(),
        updateDistrictBalance: vitest_1.vi.fn(),
        resolveWar: vitest_1.vi.fn(),
        startWar: vitest_1.vi.fn()
    };
}
(0, vitest_1.describe)("TerritoryService", () => {
    (0, vitest_1.it)("lists districts with payout and controller data", async () => {
        const playerService = createPlayerServiceMock();
        const gangsService = createGangsServiceMock();
        const domainEventsService = createDomainEventsServiceMock();
        const repository = createTerritoryRepositoryMock();
        const districtId = crypto.randomUUID();
        const gangId = crypto.randomUUID();
        vitest_1.vi.mocked(repository.listDistricts).mockResolvedValue([
            {
                id: districtId,
                name: "Downtown",
                payoutAmount: 1000,
                payoutCooldownMinutes: 60,
                createdAt: new Date("2026-03-17T00:05:00.000Z"),
                control: {
                    id: crypto.randomUUID(),
                    districtId,
                    gangId,
                    capturedAt: new Date("2026-03-17T00:10:00.000Z"),
                    lastPayoutClaimedAt: new Date("2026-03-17T01:10:00.000Z")
                },
                activeWar: null
            }
        ]);
        vitest_1.vi.mocked(gangsService.getGangById).mockResolvedValue({
            id: gangId,
            name: "Night Owls",
            createdAt: new Date("2026-03-16T22:00:00.000Z"),
            createdByPlayerId: crypto.randomUUID(),
            memberCount: 2
        });
        const service = new territory_service_1.TerritoryService(playerService, gangsService, domainEventsService, repository);
        const result = await service.listDistricts();
        (0, vitest_1.expect)(result).toEqual([
            {
                id: districtId,
                name: "Downtown",
                payout: {
                    amount: 1000,
                    cooldownMinutes: 60,
                    lastClaimedAt: new Date("2026-03-17T01:10:00.000Z"),
                    nextClaimAvailableAt: new Date("2026-03-17T02:10:00.000Z")
                },
                createdAt: new Date("2026-03-17T00:05:00.000Z"),
                controller: {
                    gangId,
                    gangName: "Night Owls",
                    capturedAt: new Date("2026-03-17T00:10:00.000Z")
                },
                activeWar: null
            }
        ]);
    });
    (0, vitest_1.it)("returns a single district by id with payout data", async () => {
        const playerService = createPlayerServiceMock();
        const gangsService = createGangsServiceMock();
        const domainEventsService = createDomainEventsServiceMock();
        const repository = createTerritoryRepositoryMock();
        const districtId = crypto.randomUUID();
        vitest_1.vi.mocked(repository.findDistrictById).mockResolvedValue({
            id: districtId,
            name: "Little Italy",
            payoutAmount: 1000,
            payoutCooldownMinutes: 60,
            createdAt: new Date("2026-03-17T00:05:00.000Z"),
            control: null,
            activeWar: null
        });
        const service = new territory_service_1.TerritoryService(playerService, gangsService, domainEventsService, repository);
        const result = await service.getDistrictById(districtId);
        (0, vitest_1.expect)(result.controller).toBeNull();
        (0, vitest_1.expect)(result.activeWar).toBeNull();
        (0, vitest_1.expect)(result.payout).toEqual({
            amount: 1000,
            cooldownMinutes: 60,
            lastClaimedAt: null,
            nextClaimAvailableAt: null
        });
    });
    (0, vitest_1.it)("claims an unclaimed district for a gang only when the player is authorized", async () => {
        const playerService = createPlayerServiceMock();
        const gangsService = createGangsServiceMock();
        const domainEventsService = createDomainEventsServiceMock();
        const repository = createTerritoryRepositoryMock();
        const districtId = crypto.randomUUID();
        const gangId = crypto.randomUUID();
        const playerId = crypto.randomUUID();
        const capturedAt = new Date("2026-03-17T00:10:00.000Z");
        vitest_1.vi.mocked(gangsService.assertPlayerIsGangLeader).mockResolvedValue();
        vitest_1.vi.mocked(gangsService.getGangById).mockResolvedValue({
            id: gangId,
            name: "Night Owls",
            createdAt: new Date("2026-03-16T22:00:00.000Z"),
            createdByPlayerId: playerId,
            memberCount: 2
        });
        vitest_1.vi.mocked(repository.claimDistrict).mockResolvedValue({
            id: crypto.randomUUID(),
            districtId,
            gangId,
            capturedAt,
            lastPayoutClaimedAt: null
        });
        vitest_1.vi.mocked(repository.findDistrictById)
            .mockResolvedValueOnce({
            id: districtId,
            name: "Downtown",
            payoutAmount: 1000,
            payoutCooldownMinutes: 60,
            createdAt: new Date("2026-03-17T00:05:00.000Z"),
            control: null,
            activeWar: null
        })
            .mockResolvedValueOnce({
            id: districtId,
            name: "Downtown",
            payoutAmount: 1000,
            payoutCooldownMinutes: 60,
            createdAt: new Date("2026-03-17T00:05:00.000Z"),
            control: {
                id: crypto.randomUUID(),
                districtId,
                gangId,
                capturedAt,
                lastPayoutClaimedAt: null
            },
            activeWar: null
        });
        const service = new territory_service_1.TerritoryService(playerService, gangsService, domainEventsService, repository);
        const result = await service.claimDistrict({
            districtId,
            gangId,
            playerId
        });
        (0, vitest_1.expect)(gangsService.assertPlayerIsGangLeader).toHaveBeenCalledWith(gangId, playerId);
        (0, vitest_1.expect)(repository.claimDistrict).toHaveBeenCalledWith({
            districtId,
            gangId
        });
        (0, vitest_1.expect)(domainEventsService.publish).toHaveBeenCalledWith({
            type: "territory.district_claimed",
            occurredAt: vitest_1.expect.any(Date),
            playerId,
            gangId,
            districtId
        });
        (0, vitest_1.expect)(result.controller?.gangId).toBe(gangId);
    });
    (0, vitest_1.it)("rejects unauthorized district claims", async () => {
        const playerService = createPlayerServiceMock();
        const gangsService = createGangsServiceMock();
        const domainEventsService = createDomainEventsServiceMock();
        const repository = createTerritoryRepositoryMock();
        vitest_1.vi.mocked(gangsService.assertPlayerIsGangLeader).mockRejectedValue({
            status: 409
        });
        const service = new territory_service_1.TerritoryService(playerService, gangsService, domainEventsService, repository);
        await (0, vitest_1.expect)(service.claimDistrict({
            districtId: crypto.randomUUID(),
            gangId: crypto.randomUUID(),
            playerId: crypto.randomUUID()
        })).rejects.toMatchObject({
            status: 409
        });
    });
    (0, vitest_1.it)("claims a district payout for the controlling gang leader and credits the player", async () => {
        vitest_1.vi.useFakeTimers();
        vitest_1.vi.setSystemTime(new Date("2026-03-17T03:00:00.000Z"));
        const playerService = createPlayerServiceMock();
        const gangsService = createGangsServiceMock();
        const domainEventsService = createDomainEventsServiceMock();
        const repository = createTerritoryRepositoryMock();
        const districtId = crypto.randomUUID();
        const gangId = crypto.randomUUID();
        const playerId = crypto.randomUUID();
        vitest_1.vi.mocked(gangsService.assertPlayerIsGangLeader).mockResolvedValue();
        vitest_1.vi.mocked(gangsService.getGangById).mockResolvedValue({
            id: gangId,
            name: "Night Owls",
            createdAt: new Date("2026-03-16T22:00:00.000Z"),
            createdByPlayerId: playerId,
            memberCount: 2
        });
        vitest_1.vi.mocked(repository.findDistrictById)
            .mockResolvedValueOnce({
            id: districtId,
            name: "Downtown",
            payoutAmount: 1000,
            payoutCooldownMinutes: 60,
            createdAt: new Date("2026-03-17T00:05:00.000Z"),
            control: {
                id: crypto.randomUUID(),
                districtId,
                gangId,
                capturedAt: new Date("2026-03-17T00:10:00.000Z"),
                lastPayoutClaimedAt: null
            },
            activeWar: null
        })
            .mockResolvedValueOnce({
            id: districtId,
            name: "Downtown",
            payoutAmount: 1000,
            payoutCooldownMinutes: 60,
            createdAt: new Date("2026-03-17T00:05:00.000Z"),
            control: {
                id: crypto.randomUUID(),
                districtId,
                gangId,
                capturedAt: new Date("2026-03-17T00:10:00.000Z"),
                lastPayoutClaimedAt: new Date("2026-03-17T03:00:00.000Z")
            },
            activeWar: null
        });
        vitest_1.vi.mocked(repository.claimDistrictPayout).mockResolvedValue("claimed");
        vitest_1.vi.mocked(playerService.applyResourceDelta).mockResolvedValue({
            id: playerId,
            displayName: "Boss",
            cash: 4000,
            respect: 0,
            energy: 100,
            health: 100,
            jailedUntil: null,
            hospitalizedUntil: null,
            createdAt: new Date("2026-03-17T00:00:00.000Z"),
            updatedAt: new Date("2026-03-17T03:00:00.000Z")
        });
        const service = new territory_service_1.TerritoryService(playerService, gangsService, domainEventsService, repository);
        const result = await service.claimDistrictPayout({
            districtId,
            gangId,
            playerId
        });
        (0, vitest_1.expect)(repository.claimDistrictPayout).toHaveBeenCalledWith({
            districtId,
            gangId,
            claimedAt: new Date("2026-03-17T03:00:00.000Z"),
            latestEligibleClaimedAt: new Date("2026-03-17T02:00:00.000Z")
        });
        (0, vitest_1.expect)(playerService.applyResourceDelta).toHaveBeenCalledWith(playerId, {
            cash: 1000
        });
        (0, vitest_1.expect)(domainEventsService.publish).toHaveBeenCalledWith({
            type: "territory.payout_claimed",
            occurredAt: new Date("2026-03-17T03:00:00.000Z"),
            playerId,
            gangId,
            districtId,
            districtName: "Downtown",
            payoutAmount: 1000
        });
        (0, vitest_1.expect)(result).toMatchObject({
            payoutAmount: 1000,
            paidToPlayerId: playerId,
            playerCashAfterClaim: 4000
        });
        vitest_1.vi.useRealTimers();
    });
    (0, vitest_1.it)("blocks a district payout when the district is uncontrolled", async () => {
        const playerService = createPlayerServiceMock();
        const gangsService = createGangsServiceMock();
        const domainEventsService = createDomainEventsServiceMock();
        const repository = createTerritoryRepositoryMock();
        vitest_1.vi.mocked(gangsService.assertPlayerIsGangLeader).mockResolvedValue();
        vitest_1.vi.mocked(repository.findDistrictById).mockResolvedValue({
            id: crypto.randomUUID(),
            name: "Downtown",
            payoutAmount: 1000,
            payoutCooldownMinutes: 60,
            createdAt: new Date("2026-03-17T00:05:00.000Z"),
            control: null,
            activeWar: null
        });
        const service = new territory_service_1.TerritoryService(playerService, gangsService, domainEventsService, repository);
        await (0, vitest_1.expect)(service.claimDistrictPayout({
            districtId: crypto.randomUUID(),
            gangId: crypto.randomUUID(),
            playerId: crypto.randomUUID()
        })).rejects.toMatchObject({
            status: 409
        });
        (0, vitest_1.expect)(playerService.applyResourceDelta).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)("blocks a district payout when the cooldown has not elapsed", async () => {
        vitest_1.vi.useFakeTimers();
        vitest_1.vi.setSystemTime(new Date("2026-03-17T03:00:00.000Z"));
        const playerService = createPlayerServiceMock();
        const gangsService = createGangsServiceMock();
        const domainEventsService = createDomainEventsServiceMock();
        const repository = createTerritoryRepositoryMock();
        const districtId = crypto.randomUUID();
        const gangId = crypto.randomUUID();
        const playerId = crypto.randomUUID();
        vitest_1.vi.mocked(gangsService.assertPlayerIsGangLeader).mockResolvedValue();
        vitest_1.vi.mocked(gangsService.getGangById).mockResolvedValue({
            id: gangId,
            name: "Night Owls",
            createdAt: new Date(),
            createdByPlayerId: playerId,
            memberCount: 2
        });
        vitest_1.vi.mocked(repository.findDistrictById).mockResolvedValue({
            id: districtId,
            name: "Downtown",
            payoutAmount: 1000,
            payoutCooldownMinutes: 60,
            createdAt: new Date("2026-03-17T00:05:00.000Z"),
            control: {
                id: crypto.randomUUID(),
                districtId,
                gangId,
                capturedAt: new Date("2026-03-17T00:10:00.000Z"),
                lastPayoutClaimedAt: new Date("2026-03-17T02:30:00.000Z")
            },
            activeWar: null
        });
        const service = new territory_service_1.TerritoryService(playerService, gangsService, domainEventsService, repository);
        await (0, vitest_1.expect)(service.claimDistrictPayout({
            districtId,
            gangId,
            playerId
        })).rejects.toMatchObject({
            status: 409
        });
        (0, vitest_1.expect)(repository.claimDistrictPayout).not.toHaveBeenCalled();
        vitest_1.vi.useRealTimers();
    });
    (0, vitest_1.it)("starts a war when another gang controls the district", async () => {
        const playerService = createPlayerServiceMock();
        const gangsService = createGangsServiceMock();
        const domainEventsService = createDomainEventsServiceMock();
        const repository = createTerritoryRepositoryMock();
        const districtId = crypto.randomUUID();
        const attackerGangId = crypto.randomUUID();
        const defenderGangId = crypto.randomUUID();
        const playerId = crypto.randomUUID();
        const warId = crypto.randomUUID();
        vitest_1.vi.mocked(gangsService.assertPlayerIsGangLeader).mockResolvedValue();
        vitest_1.vi.mocked(gangsService.getGangById)
            .mockResolvedValueOnce({
            id: defenderGangId,
            name: "Defenders",
            createdAt: new Date(),
            createdByPlayerId: crypto.randomUUID(),
            memberCount: 2
        })
            .mockResolvedValueOnce({
            id: attackerGangId,
            name: "Attackers",
            createdAt: new Date(),
            createdByPlayerId: playerId,
            memberCount: 2
        })
            .mockResolvedValueOnce({
            id: defenderGangId,
            name: "Defenders",
            createdAt: new Date(),
            createdByPlayerId: crypto.randomUUID(),
            memberCount: 2
        });
        vitest_1.vi.mocked(repository.findDistrictById).mockResolvedValue({
            id: districtId,
            name: "Downtown",
            payoutAmount: 1000,
            payoutCooldownMinutes: 60,
            createdAt: new Date(),
            control: {
                id: crypto.randomUUID(),
                districtId,
                gangId: defenderGangId,
                capturedAt: new Date(),
                lastPayoutClaimedAt: null
            },
            activeWar: null
        });
        vitest_1.vi.mocked(repository.startWar).mockResolvedValue({
            id: warId,
            districtId,
            attackerGangId,
            defenderGangId,
            startedByPlayerId: playerId,
            status: "pending",
            createdAt: new Date("2026-03-17T00:45:00.000Z"),
            resolvedAt: null,
            winningGangId: null
        });
        const service = new territory_service_1.TerritoryService(playerService, gangsService, domainEventsService, repository);
        const result = await service.startWar({
            districtId,
            playerId,
            attackerGangId
        });
        (0, vitest_1.expect)(result).toMatchObject({
            id: warId,
            attackerGangId,
            defenderGangId,
            status: "pending"
        });
    });
    (0, vitest_1.it)("resolves a war and updates district control through the winner", async () => {
        const playerService = createPlayerServiceMock();
        const gangsService = createGangsServiceMock();
        const domainEventsService = createDomainEventsServiceMock();
        const repository = createTerritoryRepositoryMock();
        const warId = crypto.randomUUID();
        const districtId = crypto.randomUUID();
        const attackerGangId = crypto.randomUUID();
        const defenderGangId = crypto.randomUUID();
        vitest_1.vi.mocked(repository.findWarById)
            .mockResolvedValueOnce({
            id: warId,
            districtId,
            attackerGangId,
            defenderGangId,
            startedByPlayerId: crypto.randomUUID(),
            status: "pending",
            createdAt: new Date("2026-03-17T00:45:00.000Z"),
            resolvedAt: null,
            winningGangId: null
        })
            .mockResolvedValueOnce({
            id: warId,
            districtId,
            attackerGangId,
            defenderGangId,
            startedByPlayerId: crypto.randomUUID(),
            status: "resolved",
            createdAt: new Date("2026-03-17T00:45:00.000Z"),
            resolvedAt: new Date("2026-03-17T01:00:00.000Z"),
            winningGangId: attackerGangId
        });
        vitest_1.vi.mocked(repository.resolveWar).mockResolvedValue({
            id: warId,
            districtId,
            attackerGangId,
            defenderGangId,
            startedByPlayerId: crypto.randomUUID(),
            status: "resolved",
            createdAt: new Date("2026-03-17T00:45:00.000Z"),
            resolvedAt: new Date("2026-03-17T01:00:00.000Z"),
            winningGangId: attackerGangId
        });
        vitest_1.vi.mocked(repository.findDistrictById).mockResolvedValue({
            id: districtId,
            name: "Downtown",
            payoutAmount: 1000,
            payoutCooldownMinutes: 60,
            createdAt: new Date(),
            control: {
                id: crypto.randomUUID(),
                districtId,
                gangId: attackerGangId,
                capturedAt: new Date("2026-03-17T01:00:00.000Z"),
                lastPayoutClaimedAt: null
            },
            activeWar: null
        });
        vitest_1.vi.mocked(gangsService.getGangById).mockImplementation(async (gangId) => ({
            id: gangId,
            name: gangId === attackerGangId ? "Attackers" : "Defenders",
            createdAt: new Date(),
            createdByPlayerId: crypto.randomUUID(),
            memberCount: 2
        }));
        const service = new territory_service_1.TerritoryService(playerService, gangsService, domainEventsService, repository);
        const result = await service.resolveWar({
            warId,
            winningGangId: attackerGangId
        });
        (0, vitest_1.expect)(domainEventsService.publish).toHaveBeenCalledWith({
            type: "territory.war_won",
            occurredAt: new Date("2026-03-17T01:00:00.000Z"),
            warId,
            districtId,
            districtName: "Downtown",
            winningGangId: attackerGangId,
            winningGangName: "Attackers",
            attackerGangId,
            defenderGangId,
            resolvedAt: new Date("2026-03-17T01:00:00.000Z")
        });
        (0, vitest_1.expect)(result.war.status).toBe("resolved");
        (0, vitest_1.expect)(result.district.controller?.gangId).toBe(attackerGangId);
    });
});
