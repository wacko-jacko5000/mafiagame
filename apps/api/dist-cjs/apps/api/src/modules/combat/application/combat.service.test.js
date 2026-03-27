"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const combat_service_1 = require("./combat.service");
function createPlayerServiceMock() {
    return {
        getPlayerById: vitest_1.vi.fn()
    };
}
function createJailServiceMock() {
    return {
        getStatus: vitest_1.vi.fn()
    };
}
function createHospitalServiceMock() {
    return {
        getStatus: vitest_1.vi.fn()
    };
}
function createInventoryServiceMock() {
    return {
        getCombatLoadout: vitest_1.vi.fn()
    };
}
function createDomainEventsServiceMock() {
    return {
        publish: vitest_1.vi.fn()
    };
}
function createPlayerActivityServiceMock() {
    return {
        createActivity: vitest_1.vi.fn()
    };
}
function createCombatRepositoryMock() {
    return {
        applyAttack: vitest_1.vi.fn()
    };
}
(0, vitest_1.describe)("CombatService", () => {
    (0, vitest_1.it)("resolves an attack using equipped bonuses", async () => {
        const attackerId = crypto.randomUUID();
        const targetId = crypto.randomUUID();
        const playerService = createPlayerServiceMock();
        const jailService = createJailServiceMock();
        const hospitalService = createHospitalServiceMock();
        const inventoryService = createInventoryServiceMock();
        const playerActivityService = createPlayerActivityServiceMock();
        const domainEventsService = createDomainEventsServiceMock();
        const repository = createCombatRepositoryMock();
        vitest_1.vi.mocked(playerService.getPlayerById)
            .mockResolvedValueOnce({
            id: attackerId,
            displayName: "Attacker",
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
            id: targetId,
            displayName: "Target",
            cash: 2500,
            respect: 0,
            energy: 100,
            health: 100,
            jailedUntil: null,
            hospitalizedUntil: null,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        vitest_1.vi.mocked(jailService.getStatus).mockResolvedValue({
            playerId: attackerId,
            active: false,
            until: null,
            remainingSeconds: 0
        });
        vitest_1.vi.mocked(hospitalService.getStatus)
            .mockResolvedValueOnce({
            playerId: attackerId,
            active: false,
            until: null,
            remainingSeconds: 0
        })
            .mockResolvedValueOnce({
            playerId: targetId,
            active: false,
            until: null,
            remainingSeconds: 0
        });
        vitest_1.vi.mocked(inventoryService.getCombatLoadout)
            .mockResolvedValueOnce({
            weapon: {
                inventoryItemId: crypto.randomUUID(),
                itemId: "cheap-pistol",
                attackBonus: 8
            },
            armor: null
        })
            .mockResolvedValueOnce({
            weapon: null,
            armor: {
                inventoryItemId: crypto.randomUUID(),
                itemId: "leather-jacket",
                defenseBonus: 3
            }
        });
        vitest_1.vi.mocked(repository.applyAttack).mockResolvedValue({
            targetHealthBefore: 100,
            targetHealthAfter: 83,
            targetHospitalized: false,
            hospitalizedUntil: null
        });
        const service = new combat_service_1.CombatService(playerService, jailService, hospitalService, inventoryService, playerActivityService, domainEventsService, repository);
        const result = await service.attack(attackerId, targetId);
        (0, vitest_1.expect)(repository.applyAttack).toHaveBeenCalledWith(vitest_1.expect.objectContaining({
            attackerId,
            targetId,
            damageDealt: 17
        }));
        (0, vitest_1.expect)(result).toMatchObject({
            attackerId,
            targetId,
            attackerWeaponItemId: "cheap-pistol",
            targetArmorItemId: "leather-jacket",
            damageDealt: 17,
            targetHealthAfter: 83,
            targetHospitalized: false
        });
    });
    (0, vitest_1.it)("rejects self attacks", async () => {
        const id = crypto.randomUUID();
        const service = new combat_service_1.CombatService(createPlayerServiceMock(), createJailServiceMock(), createHospitalServiceMock(), createInventoryServiceMock(), createPlayerActivityServiceMock(), createDomainEventsServiceMock(), createCombatRepositoryMock());
        await (0, vitest_1.expect)(service.attack(id, id)).rejects.toMatchObject({
            status: 409
        });
    });
    (0, vitest_1.it)("rejects attackers who are jailed", async () => {
        const attackerId = crypto.randomUUID();
        const targetId = crypto.randomUUID();
        const playerService = createPlayerServiceMock();
        vitest_1.vi.mocked(playerService.getPlayerById)
            .mockResolvedValueOnce({
            id: attackerId,
            displayName: "Attacker",
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
            id: targetId,
            displayName: "Target",
            cash: 2500,
            respect: 0,
            energy: 100,
            health: 100,
            jailedUntil: null,
            hospitalizedUntil: null,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        const service = new combat_service_1.CombatService(playerService, {
            getStatus: vitest_1.vi.fn().mockResolvedValue({
                playerId: attackerId,
                active: true,
                until: new Date("2026-03-16T22:10:00.000Z"),
                remainingSeconds: 300
            })
        }, createHospitalServiceMock(), createInventoryServiceMock(), createPlayerActivityServiceMock(), createDomainEventsServiceMock(), createCombatRepositoryMock());
        await (0, vitest_1.expect)(service.attack(attackerId, targetId)).rejects.toMatchObject({
            status: 409
        });
    });
    (0, vitest_1.it)("rejects attacks against hospitalized targets", async () => {
        const attackerId = crypto.randomUUID();
        const targetId = crypto.randomUUID();
        const playerService = createPlayerServiceMock();
        const jailService = createJailServiceMock();
        const hospitalService = createHospitalServiceMock();
        vitest_1.vi.mocked(playerService.getPlayerById)
            .mockResolvedValueOnce({
            id: attackerId,
            displayName: "Attacker",
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
            id: targetId,
            displayName: "Target",
            cash: 2500,
            respect: 0,
            energy: 100,
            health: 7,
            jailedUntil: null,
            hospitalizedUntil: new Date("2026-03-16T22:10:00.000Z"),
            createdAt: new Date(),
            updatedAt: new Date()
        });
        vitest_1.vi.mocked(jailService.getStatus).mockResolvedValue({
            playerId: attackerId,
            active: false,
            until: null,
            remainingSeconds: 0
        });
        vitest_1.vi.mocked(hospitalService.getStatus)
            .mockResolvedValueOnce({
            playerId: attackerId,
            active: false,
            until: null,
            remainingSeconds: 0
        })
            .mockResolvedValueOnce({
            playerId: targetId,
            active: true,
            until: new Date("2026-03-16T22:10:00.000Z"),
            remainingSeconds: 300
        });
        const service = new combat_service_1.CombatService(playerService, jailService, hospitalService, createInventoryServiceMock(), createPlayerActivityServiceMock(), createDomainEventsServiceMock(), createCombatRepositoryMock());
        await (0, vitest_1.expect)(service.attack(attackerId, targetId)).rejects.toMatchObject({
            status: 409
        });
    });
    (0, vitest_1.it)("hospitalizes the target when post-damage health reaches the threshold", async () => {
        const attackerId = crypto.randomUUID();
        const targetId = crypto.randomUUID();
        const playerService = createPlayerServiceMock();
        const jailService = createJailServiceMock();
        const hospitalService = createHospitalServiceMock();
        const inventoryService = createInventoryServiceMock();
        const playerActivityService = createPlayerActivityServiceMock();
        const domainEventsService = createDomainEventsServiceMock();
        const repository = createCombatRepositoryMock();
        vitest_1.vi.mocked(playerService.getPlayerById)
            .mockResolvedValueOnce({
            id: attackerId,
            displayName: "Attacker",
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
            id: targetId,
            displayName: "Target",
            cash: 2500,
            respect: 0,
            energy: 100,
            health: 15,
            jailedUntil: null,
            hospitalizedUntil: null,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        vitest_1.vi.mocked(jailService.getStatus).mockResolvedValue({
            playerId: attackerId,
            active: false,
            until: null,
            remainingSeconds: 0
        });
        vitest_1.vi.mocked(hospitalService.getStatus)
            .mockResolvedValueOnce({
            playerId: attackerId,
            active: false,
            until: null,
            remainingSeconds: 0
        })
            .mockResolvedValueOnce({
            playerId: targetId,
            active: false,
            until: null,
            remainingSeconds: 0
        });
        vitest_1.vi.mocked(inventoryService.getCombatLoadout).mockResolvedValue({
            weapon: null,
            armor: null
        });
        vitest_1.vi.mocked(repository.applyAttack).mockResolvedValue({
            targetHealthBefore: 15,
            targetHealthAfter: 3,
            targetHospitalized: true,
            hospitalizedUntil: new Date("2026-03-16T22:10:00.000Z")
        });
        const service = new combat_service_1.CombatService(playerService, jailService, hospitalService, inventoryService, playerActivityService, domainEventsService, repository);
        const result = await service.attack(attackerId, targetId);
        (0, vitest_1.expect)(result.targetHospitalized).toBe(true);
        (0, vitest_1.expect)(result.hospitalizedUntil?.toISOString()).toBe("2026-03-16T22:10:00.000Z");
        (0, vitest_1.expect)(domainEventsService.publish).toHaveBeenCalledWith({
            type: "combat.won",
            occurredAt: vitest_1.expect.any(Date),
            attackerPlayerId: attackerId,
            targetPlayerId: targetId,
            damageDealt: 12,
            hospitalizedUntil: new Date("2026-03-16T22:10:00.000Z")
        });
    });
});
