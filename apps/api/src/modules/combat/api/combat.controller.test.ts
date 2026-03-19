import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { CombatService } from "../application/combat.service";
import { CombatController } from "./combat.controller";

describe("CombatController", () => {
  let app: INestApplication;
  const combatService = {
    attack: vi.fn()
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [CombatController],
      providers: [
        {
          provide: CombatService,
          useValue: combatService
        }
      ]
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it("attacks a target player", async () => {
    const attackerId = crypto.randomUUID();
    const targetId = crypto.randomUUID();
    vi.mocked(combatService.attack).mockResolvedValueOnce({
      attackerId,
      targetId,
      attackerWeaponItemId: "cheap-pistol",
      targetArmorItemId: "leather-jacket",
      baseAttack: 12,
      weaponBonus: 8,
      armorReduction: 3,
      damageDealt: 17,
      targetHealthBefore: 100,
      targetHealthAfter: 83,
      targetHospitalized: false,
      hospitalizedUntil: null
    });

    const response = await request(app.getHttpServer())
      .post(`/combat/players/${attackerId}/attack/${targetId}`)
      .expect(201);

    expect(response.body).toMatchObject({
      attackerId,
      targetId,
      damageDealt: 17,
      targetHealthAfter: 83
    });
  });
});
