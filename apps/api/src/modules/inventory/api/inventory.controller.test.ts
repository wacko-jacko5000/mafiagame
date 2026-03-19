import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { AuthGuard } from "../../auth/api/auth.guard";
import { AuthService } from "../../auth/application/auth.service";
import { InventoryController } from "./inventory.controller";
import { InventoryService } from "../application/inventory.service";

describe("InventoryController", () => {
  let app: INestApplication;
  const inventoryService = {
    getEquippedItems: vi.fn(),
    equipItem: vi.fn(),
    listShopItems: vi.fn(),
    listPlayerInventory: vi.fn(),
    purchaseItem: vi.fn(),
    unequipSlot: vi.fn()
  };
  const authService = {
    authenticate: vi.fn()
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [InventoryController],
      providers: [
        {
          provide: InventoryService,
          useValue: inventoryService
        },
        {
          provide: AuthService,
          useValue: authService
        },
        AuthGuard
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

  it("lists shop items", async () => {
    vi.mocked(inventoryService.listShopItems).mockReturnValueOnce([
      {
        id: "rusty-knife",
        name: "Rusty Knife",
        type: "weapon",
        price: 400,
        equipSlot: "weapon"
      }
    ]);

    const response = await request(app.getHttpServer()).get("/shop/items").expect(200);

    expect(response.body).toEqual([
      {
        id: "rusty-knife",
        name: "Rusty Knife",
        type: "weapon",
        price: 400,
        equipSlot: "weapon"
      }
    ]);
  });

  it("lists player inventory", async () => {
    const playerId = crypto.randomUUID();
    vi.mocked(inventoryService.listPlayerInventory).mockResolvedValueOnce([
      {
        id: "owned-1",
        playerId,
        itemId: "rusty-knife",
        name: "Rusty Knife",
        type: "weapon",
        price: 400,
        equippedSlot: null,
        marketListingId: null,
        acquiredAt: new Date("2026-03-16T20:00:00.000Z")
      }
    ]);

    const response = await request(app.getHttpServer())
      .get(`/players/${playerId}/inventory`)
      .expect(200);

    expect(response.body[0]).toMatchObject({
        itemId: "rusty-knife",
        name: "Rusty Knife"
      });
  });

  it("lists equipped items for a player", async () => {
    const playerId = crypto.randomUUID();
    vi.mocked(inventoryService.getEquippedItems).mockResolvedValueOnce({
      weapon: {
        id: "owned-1",
        playerId,
        itemId: "rusty-knife",
        name: "Rusty Knife",
        type: "weapon",
        price: 400,
        equippedSlot: "weapon",
        marketListingId: null,
        acquiredAt: new Date("2026-03-16T20:00:00.000Z")
      },
      armor: null
    });

    const response = await request(app.getHttpServer())
      .get(`/players/${playerId}/equipment`)
      .expect(200);

    expect(response.body).toEqual({
      weapon: {
        id: "owned-1",
        playerId,
        itemId: "rusty-knife",
        name: "Rusty Knife",
        type: "weapon",
        price: 400,
        equippedSlot: "weapon",
        marketListingId: null,
        acquiredAt: "2026-03-16T20:00:00.000Z"
      },
      armor: null
    });
  });

  it("purchases a shop item for a player", async () => {
    const playerId = crypto.randomUUID();
    vi.mocked(inventoryService.purchaseItem).mockResolvedValueOnce({
      playerCashAfterPurchase: 2100,
      ownedItem: {
        id: "owned-1",
        playerId,
        itemId: "rusty-knife",
        name: "Rusty Knife",
        type: "weapon",
        price: 400,
        equippedSlot: null,
        marketListingId: null,
        acquiredAt: new Date("2026-03-16T20:00:00.000Z")
      }
    });

    const response = await request(app.getHttpServer())
      .post(`/players/${playerId}/shop/rusty-knife/purchase`)
      .expect(201);

    expect(response.body).toEqual({
      playerCashAfterPurchase: 2100,
      ownedItem: {
        id: "owned-1",
        playerId,
        itemId: "rusty-knife",
        name: "Rusty Knife",
        type: "weapon",
        price: 400,
        equippedSlot: null,
        marketListingId: null,
        acquiredAt: "2026-03-16T20:00:00.000Z"
      }
    });
  });

  it("equips an owned item into a slot", async () => {
    const playerId = crypto.randomUUID();
    const inventoryItemId = crypto.randomUUID();
    vi.mocked(inventoryService.equipItem).mockResolvedValueOnce({
      id: inventoryItemId,
      playerId,
      itemId: "rusty-knife",
      name: "Rusty Knife",
      type: "weapon",
      price: 400,
      equippedSlot: "weapon",
      marketListingId: null,
      acquiredAt: new Date("2026-03-16T20:00:00.000Z")
    });

    const response = await request(app.getHttpServer())
      .post(`/players/${playerId}/inventory/${inventoryItemId}/equip/weapon`)
      .expect(201);

    expect(response.body.equippedSlot).toBe("weapon");
  });

  it("unequips a slot", async () => {
    const playerId = crypto.randomUUID();
    vi.mocked(inventoryService.unequipSlot).mockResolvedValueOnce({
      id: "owned-1",
      playerId,
      itemId: "rusty-knife",
      name: "Rusty Knife",
      type: "weapon",
      price: 400,
      equippedSlot: null,
      marketListingId: null,
      acquiredAt: new Date("2026-03-16T20:00:00.000Z")
    });

    const response = await request(app.getHttpServer())
      .post(`/players/${playerId}/equipment/weapon/unequip`)
      .expect(201);

    expect(response.body.equippedSlot).toBeNull();
  });

  it("purchases an item for the authenticated player", async () => {
    const playerId = crypto.randomUUID();
    vi.mocked(authService.authenticate).mockResolvedValueOnce({
      accountId: crypto.randomUUID(),
      email: "test@example.com",
      playerId
    });
    vi.mocked(inventoryService.purchaseItem).mockResolvedValueOnce({
      playerCashAfterPurchase: 2100,
      ownedItem: {
        id: "owned-1",
        playerId,
        itemId: "rusty-knife",
        name: "Rusty Knife",
        type: "weapon",
        price: 400,
        equippedSlot: null,
        marketListingId: null,
        acquiredAt: new Date("2026-03-16T20:00:00.000Z")
      }
    });

    await request(app.getHttpServer())
      .post("/me/shop/rusty-knife/purchase")
      .set("Authorization", "Bearer token-123")
      .expect(201);
  });
});
