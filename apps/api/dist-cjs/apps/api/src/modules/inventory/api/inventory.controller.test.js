"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const supertest_1 = __importDefault(require("supertest"));
const vitest_1 = require("vitest");
const auth_guard_1 = require("../../auth/api/auth.guard");
const auth_service_1 = require("../../auth/application/auth.service");
const inventory_controller_1 = require("./inventory.controller");
const inventory_service_1 = require("../application/inventory.service");
(0, vitest_1.describe)("InventoryController", () => {
    let app;
    const inventoryService = {
        getEquippedItems: vitest_1.vi.fn(),
        equipItem: vitest_1.vi.fn(),
        listShopItems: vitest_1.vi.fn(),
        listShopItemsForPlayer: vitest_1.vi.fn(),
        listPlayerInventory: vitest_1.vi.fn(),
        purchaseItem: vitest_1.vi.fn(),
        unequipSlot: vitest_1.vi.fn()
    };
    const authService = {
        authenticate: vitest_1.vi.fn()
    };
    (0, vitest_1.beforeAll)(async () => {
        const moduleRef = await testing_1.Test.createTestingModule({
            controllers: [inventory_controller_1.InventoryController],
            providers: [
                {
                    provide: inventory_service_1.InventoryService,
                    useValue: inventoryService
                },
                {
                    provide: auth_service_1.AuthService,
                    useValue: authService
                },
                auth_guard_1.AuthGuard
            ]
        }).compile();
        app = moduleRef.createNestApplication();
        await app.init();
    });
    (0, vitest_1.afterAll)(async () => {
        if (app) {
            await app.close();
        }
    });
    (0, vitest_1.it)("lists shop items", async () => {
        vitest_1.vi.mocked(inventoryService.listShopItems).mockReturnValueOnce([
            {
                id: "rusty-knife",
                name: "Glock 17",
                type: "weapon",
                category: "handguns",
                price: 400,
                equipSlot: "weapon",
                unlockLevel: 1,
                unlockRank: "Scum"
            }
        ]);
        const response = await (0, supertest_1.default)(app.getHttpServer()).get("/shop/items").expect(200);
        (0, vitest_1.expect)(response.body).toEqual([
            {
                id: "rusty-knife",
                name: "Glock 17",
                type: "weapon",
                category: "handguns",
                price: 400,
                equipSlot: "weapon",
                unlockLevel: 1,
                unlockRank: "Scum"
            }
        ]);
    });
    (0, vitest_1.it)("lists player-aware shop items for the authenticated player", async () => {
        const playerId = crypto.randomUUID();
        vitest_1.vi.mocked(authService.authenticate).mockResolvedValueOnce({
            accountId: crypto.randomUUID(),
            email: "test@example.com",
            playerId
        });
        vitest_1.vi.mocked(inventoryService.listShopItemsForPlayer).mockResolvedValueOnce([
            {
                id: "beretta-92fs",
                name: "Beretta 92FS",
                type: "weapon",
                category: "handguns",
                price: 2400,
                equipSlot: "weapon",
                unlockLevel: 2,
                unlockRank: "Empty Suit",
                isUnlocked: false,
                isLocked: true
            }
        ]);
        const response = await (0, supertest_1.default)(app.getHttpServer())
            .get("/me/shop/items")
            .set("Authorization", "Bearer token-123")
            .expect(200);
        (0, vitest_1.expect)(response.body).toEqual([
            {
                id: "beretta-92fs",
                name: "Beretta 92FS",
                type: "weapon",
                category: "handguns",
                price: 2400,
                equipSlot: "weapon",
                unlockLevel: 2,
                unlockRank: "Empty Suit",
                isUnlocked: false,
                isLocked: true
            }
        ]);
    });
    (0, vitest_1.it)("lists player inventory", async () => {
        const playerId = crypto.randomUUID();
        vitest_1.vi.mocked(inventoryService.listPlayerInventory).mockResolvedValueOnce([
            {
                id: "owned-1",
                playerId,
                itemId: "rusty-knife",
                name: "Glock 17",
                type: "weapon",
                price: 400,
                equippedSlot: null,
                marketListingId: null,
                acquiredAt: new Date("2026-03-16T20:00:00.000Z")
            }
        ]);
        const response = await (0, supertest_1.default)(app.getHttpServer())
            .get(`/players/${playerId}/inventory`)
            .expect(200);
        (0, vitest_1.expect)(response.body[0]).toMatchObject({
            itemId: "rusty-knife",
            name: "Glock 17"
        });
    });
    (0, vitest_1.it)("lists equipped items for a player", async () => {
        const playerId = crypto.randomUUID();
        vitest_1.vi.mocked(inventoryService.getEquippedItems).mockResolvedValueOnce({
            weapon: {
                id: "owned-1",
                playerId,
                itemId: "rusty-knife",
                name: "Glock 17",
                type: "weapon",
                price: 400,
                equippedSlot: "weapon",
                marketListingId: null,
                acquiredAt: new Date("2026-03-16T20:00:00.000Z")
            },
            armor: null
        });
        const response = await (0, supertest_1.default)(app.getHttpServer())
            .get(`/players/${playerId}/equipment`)
            .expect(200);
        (0, vitest_1.expect)(response.body).toEqual({
            weapon: {
                id: "owned-1",
                playerId,
                itemId: "rusty-knife",
                name: "Glock 17",
                type: "weapon",
                price: 400,
                equippedSlot: "weapon",
                marketListingId: null,
                acquiredAt: "2026-03-16T20:00:00.000Z"
            },
            armor: null
        });
    });
    (0, vitest_1.it)("purchases a shop item for a player", async () => {
        const playerId = crypto.randomUUID();
        vitest_1.vi.mocked(inventoryService.purchaseItem).mockResolvedValueOnce({
            playerCashAfterPurchase: 2100,
            ownedItem: {
                id: "owned-1",
                playerId,
                itemId: "rusty-knife",
                name: "Glock 17",
                type: "weapon",
                price: 400,
                equippedSlot: null,
                marketListingId: null,
                acquiredAt: new Date("2026-03-16T20:00:00.000Z")
            }
        });
        const response = await (0, supertest_1.default)(app.getHttpServer())
            .post(`/players/${playerId}/shop/rusty-knife/purchase`)
            .expect(201);
        (0, vitest_1.expect)(response.body).toEqual({
            playerCashAfterPurchase: 2100,
            ownedItem: {
                id: "owned-1",
                playerId,
                itemId: "rusty-knife",
                name: "Glock 17",
                type: "weapon",
                price: 400,
                equippedSlot: null,
                marketListingId: null,
                acquiredAt: "2026-03-16T20:00:00.000Z"
            }
        });
    });
    (0, vitest_1.it)("equips an owned item into a slot", async () => {
        const playerId = crypto.randomUUID();
        const inventoryItemId = crypto.randomUUID();
        vitest_1.vi.mocked(inventoryService.equipItem).mockResolvedValueOnce({
            id: inventoryItemId,
            playerId,
            itemId: "rusty-knife",
            name: "Glock 17",
            type: "weapon",
            price: 400,
            equippedSlot: "weapon",
            marketListingId: null,
            acquiredAt: new Date("2026-03-16T20:00:00.000Z")
        });
        const response = await (0, supertest_1.default)(app.getHttpServer())
            .post(`/players/${playerId}/inventory/${inventoryItemId}/equip/weapon`)
            .expect(201);
        (0, vitest_1.expect)(response.body.equippedSlot).toBe("weapon");
    });
    (0, vitest_1.it)("unequips a slot", async () => {
        const playerId = crypto.randomUUID();
        vitest_1.vi.mocked(inventoryService.unequipSlot).mockResolvedValueOnce({
            id: "owned-1",
            playerId,
            itemId: "rusty-knife",
            name: "Glock 17",
            type: "weapon",
            price: 400,
            equippedSlot: null,
            marketListingId: null,
            acquiredAt: new Date("2026-03-16T20:00:00.000Z")
        });
        const response = await (0, supertest_1.default)(app.getHttpServer())
            .post(`/players/${playerId}/equipment/weapon/unequip`)
            .expect(201);
        (0, vitest_1.expect)(response.body.equippedSlot).toBeNull();
    });
    (0, vitest_1.it)("purchases an item for the authenticated player", async () => {
        const playerId = crypto.randomUUID();
        vitest_1.vi.mocked(authService.authenticate).mockResolvedValueOnce({
            accountId: crypto.randomUUID(),
            email: "test@example.com",
            playerId
        });
        vitest_1.vi.mocked(inventoryService.purchaseItem).mockResolvedValueOnce({
            playerCashAfterPurchase: 2100,
            ownedItem: {
                id: "owned-1",
                playerId,
                itemId: "rusty-knife",
                name: "Glock 17",
                type: "weapon",
                price: 400,
                equippedSlot: null,
                marketListingId: null,
                acquiredAt: new Date("2026-03-16T20:00:00.000Z")
            }
        });
        await (0, supertest_1.default)(app.getHttpServer())
            .post("/me/shop/rusty-knife/purchase")
            .set("Authorization", "Bearer token-123")
            .expect(201);
    });
});
