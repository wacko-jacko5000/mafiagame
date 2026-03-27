import { describe, expect, it, vi } from "vitest";

import { HospitalService } from "../../hospital/application/hospital.service";
import { InventoryService } from "../../inventory/application/inventory.service";
import { JailService } from "../../jail/application/jail.service";
import { PlayerActivityService } from "../../notifications/application/player-activity.service";
import { PlayerService } from "../../player/application/player.service";
import { CombatService } from "./combat.service";
import type { CombatRepository } from "./combat.repository";
import { DomainEventsService } from "../../../platform/domain-events/domain-events.service";

function createPlayerServiceMock() {
  return {
    getPlayerById: vi.fn()
  } as unknown as PlayerService;
}

function createJailServiceMock() {
  return {
    getStatus: vi.fn()
  } as unknown as JailService;
}

function createHospitalServiceMock() {
  return {
    getStatus: vi.fn()
  } as unknown as HospitalService;
}

function createInventoryServiceMock() {
  return {
    getCombatLoadout: vi.fn()
  } as unknown as InventoryService;
}

function createDomainEventsServiceMock() {
  return {
    publish: vi.fn()
  } as unknown as DomainEventsService;
}

function createPlayerActivityServiceMock() {
  return {
    createActivity: vi.fn()
  } as unknown as PlayerActivityService;
}

function createCombatRepositoryMock(): CombatRepository {
  return {
    applyAttack: vi.fn()
  };
}

describe("CombatService", () => {
  it("resolves an attack using equipped bonuses", async () => {
    const attackerId = crypto.randomUUID();
    const targetId = crypto.randomUUID();
    const playerService = createPlayerServiceMock();
    const jailService = createJailServiceMock();
    const hospitalService = createHospitalServiceMock();
    const inventoryService = createInventoryServiceMock();
    const playerActivityService = createPlayerActivityServiceMock();
    const domainEventsService = createDomainEventsServiceMock();
    const repository = createCombatRepositoryMock();

    vi.mocked(playerService.getPlayerById)
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
    vi.mocked(jailService.getStatus).mockResolvedValue({
      playerId: attackerId,
      active: false,
      until: null,
      remainingSeconds: 0
    });
    vi.mocked(hospitalService.getStatus)
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
    vi.mocked(inventoryService.getCombatLoadout)
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
    vi.mocked(repository.applyAttack).mockResolvedValue({
      targetHealthBefore: 100,
      targetHealthAfter: 83,
      targetHospitalized: false,
      hospitalizedUntil: null
    });

    const service = new CombatService(
      playerService,
      jailService,
      hospitalService,
      inventoryService,
      playerActivityService,
      domainEventsService,
      repository
    );
    const result = await service.attack(attackerId, targetId);

    expect(repository.applyAttack).toHaveBeenCalledWith(
      expect.objectContaining({
        attackerId,
        targetId,
        damageDealt: 17
      })
    );
    expect(result).toMatchObject({
      attackerId,
      targetId,
      attackerWeaponItemId: "cheap-pistol",
      targetArmorItemId: "leather-jacket",
      damageDealt: 17,
      targetHealthAfter: 83,
      targetHospitalized: false
    });
  });

  it("rejects self attacks", async () => {
    const id = crypto.randomUUID();
    const service = new CombatService(
      createPlayerServiceMock(),
      createJailServiceMock(),
      createHospitalServiceMock(),
      createInventoryServiceMock(),
      createPlayerActivityServiceMock(),
      createDomainEventsServiceMock(),
      createCombatRepositoryMock()
    );

    await expect(service.attack(id, id)).rejects.toMatchObject({
      status: 409
    });
  });

  it("rejects attackers who are jailed", async () => {
    const attackerId = crypto.randomUUID();
    const targetId = crypto.randomUUID();
    const playerService = createPlayerServiceMock();
    vi.mocked(playerService.getPlayerById)
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

    const service = new CombatService(
      playerService,
      {
        getStatus: vi.fn().mockResolvedValue({
          playerId: attackerId,
          active: true,
          until: new Date("2026-03-16T22:10:00.000Z"),
          remainingSeconds: 300
        })
      } as unknown as JailService,
      createHospitalServiceMock(),
      createInventoryServiceMock(),
      createPlayerActivityServiceMock(),
      createDomainEventsServiceMock(),
      createCombatRepositoryMock()
    );

    await expect(service.attack(attackerId, targetId)).rejects.toMatchObject({
      status: 409
    });
  });

  it("rejects attacks against hospitalized targets", async () => {
    const attackerId = crypto.randomUUID();
    const targetId = crypto.randomUUID();
    const playerService = createPlayerServiceMock();
    const jailService = createJailServiceMock();
    const hospitalService = createHospitalServiceMock();
    vi.mocked(playerService.getPlayerById)
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
    vi.mocked(jailService.getStatus).mockResolvedValue({
      playerId: attackerId,
      active: false,
      until: null,
      remainingSeconds: 0
    });
    vi.mocked(hospitalService.getStatus)
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

    const service = new CombatService(
      playerService,
      jailService,
      hospitalService,
      createInventoryServiceMock(),
      createPlayerActivityServiceMock(),
      createDomainEventsServiceMock(),
      createCombatRepositoryMock()
    );

    await expect(service.attack(attackerId, targetId)).rejects.toMatchObject({
      status: 409
    });
  });

  it("hospitalizes the target when post-damage health reaches the threshold", async () => {
    const attackerId = crypto.randomUUID();
    const targetId = crypto.randomUUID();
    const playerService = createPlayerServiceMock();
    const jailService = createJailServiceMock();
    const hospitalService = createHospitalServiceMock();
    const inventoryService = createInventoryServiceMock();
    const playerActivityService = createPlayerActivityServiceMock();
    const domainEventsService = createDomainEventsServiceMock();
    const repository = createCombatRepositoryMock();

    vi.mocked(playerService.getPlayerById)
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
    vi.mocked(jailService.getStatus).mockResolvedValue({
      playerId: attackerId,
      active: false,
      until: null,
      remainingSeconds: 0
    });
    vi.mocked(hospitalService.getStatus)
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
    vi.mocked(inventoryService.getCombatLoadout).mockResolvedValue({
      weapon: null,
      armor: null
    });
    vi.mocked(repository.applyAttack).mockResolvedValue({
      targetHealthBefore: 15,
      targetHealthAfter: 3,
      targetHospitalized: true,
      hospitalizedUntil: new Date("2026-03-16T22:10:00.000Z")
    });

    const service = new CombatService(
      playerService,
      jailService,
      hospitalService,
      inventoryService,
      playerActivityService,
      domainEventsService,
      repository
    );
    const result = await service.attack(attackerId, targetId);

    expect(result.targetHospitalized).toBe(true);
    expect(result.hospitalizedUntil?.toISOString()).toBe("2026-03-16T22:10:00.000Z");
    expect(domainEventsService.publish).toHaveBeenCalledWith({
      type: "combat.won",
      occurredAt: expect.any(Date),
      attackerPlayerId: attackerId,
      targetPlayerId: targetId,
      damageDealt: 12,
      hospitalizedUntil: new Date("2026-03-16T22:10:00.000Z")
    });
  });
});
