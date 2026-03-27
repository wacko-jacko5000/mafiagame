"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const supertest_1 = __importDefault(require("supertest"));
const vitest_1 = require("vitest");
const market_service_1 = require("../application/market.service");
const market_controller_1 = require("./market.controller");
(0, vitest_1.describe)("MarketController", () => {
    let app;
    const marketService = {
        listListings: vitest_1.vi.fn(),
        getListingById: vitest_1.vi.fn(),
        createListing: vitest_1.vi.fn(),
        buyListing: vitest_1.vi.fn(),
        cancelListing: vitest_1.vi.fn()
    };
    (0, vitest_1.beforeAll)(async () => {
        const moduleRef = await testing_1.Test.createTestingModule({
            controllers: [market_controller_1.MarketController],
            providers: [
                {
                    provide: market_service_1.MarketService,
                    useValue: marketService
                }
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
    (0, vitest_1.it)("lists market listings", async () => {
        vitest_1.vi.mocked(marketService.listListings).mockResolvedValueOnce([
            {
                id: "listing-1",
                inventoryItemId: "owned-1",
                sellerPlayerId: "seller-1",
                buyerPlayerId: null,
                itemId: "rusty-knife",
                itemName: "Rusty Knife",
                itemType: "weapon",
                price: 900,
                status: "active",
                createdAt: new Date("2026-03-17T10:00:00.000Z"),
                soldAt: null
            }
        ]);
        const response = await (0, supertest_1.default)(app.getHttpServer()).get("/market/listings").expect(200);
        (0, vitest_1.expect)(response.body[0]).toEqual({
            id: "listing-1",
            inventoryItemId: "owned-1",
            sellerPlayerId: "seller-1",
            buyerPlayerId: null,
            itemId: "rusty-knife",
            itemName: "Rusty Knife",
            itemType: "weapon",
            price: 900,
            status: "active",
            createdAt: "2026-03-17T10:00:00.000Z",
            soldAt: null
        });
    });
    (0, vitest_1.it)("creates a listing", async () => {
        const playerId = crypto.randomUUID();
        const inventoryItemId = crypto.randomUUID();
        vitest_1.vi.mocked(marketService.createListing).mockResolvedValueOnce({
            id: "listing-1",
            inventoryItemId,
            sellerPlayerId: playerId,
            buyerPlayerId: null,
            itemId: "rusty-knife",
            itemName: "Rusty Knife",
            itemType: "weapon",
            price: 900,
            status: "active",
            createdAt: new Date("2026-03-17T10:00:00.000Z"),
            soldAt: null
        });
        const response = await (0, supertest_1.default)(app.getHttpServer())
            .post("/market/listings")
            .send({
            playerId,
            inventoryItemId,
            price: 900
        })
            .expect(201);
        (0, vitest_1.expect)(response.body.status).toBe("active");
    });
    (0, vitest_1.it)("buys a listing", async () => {
        const listingId = "11111111-1111-1111-1111-111111111111";
        const buyerPlayerId = crypto.randomUUID();
        vitest_1.vi.mocked(marketService.buyListing).mockResolvedValueOnce({
            listing: {
                id: listingId,
                inventoryItemId: "owned-1",
                sellerPlayerId: "seller-1",
                buyerPlayerId,
                itemId: "rusty-knife",
                itemName: "Rusty Knife",
                itemType: "weapon",
                price: 900,
                status: "sold",
                createdAt: new Date("2026-03-17T10:00:00.000Z"),
                soldAt: new Date("2026-03-17T10:05:00.000Z")
            },
            transferredInventoryItemId: "owned-1",
            sellerPlayerId: "seller-1",
            buyerPlayerId,
            buyerCashAfterPurchase: 1600,
            sellerCashAfterSale: 3400
        });
        const response = await (0, supertest_1.default)(app.getHttpServer())
            .post(`/market/listings/${listingId}/buy`)
            .send({ buyerPlayerId })
            .expect(201);
        (0, vitest_1.expect)(response.body.buyerCashAfterPurchase).toBe(1600);
        (0, vitest_1.expect)(response.body.listing.status).toBe("sold");
    });
    (0, vitest_1.it)("cancels a listing", async () => {
        const listingId = "11111111-1111-1111-1111-111111111111";
        const playerId = crypto.randomUUID();
        vitest_1.vi.mocked(marketService.cancelListing).mockResolvedValueOnce({
            id: listingId,
            inventoryItemId: "owned-1",
            sellerPlayerId: playerId,
            buyerPlayerId: null,
            itemId: "rusty-knife",
            itemName: "Rusty Knife",
            itemType: "weapon",
            price: 900,
            status: "cancelled",
            createdAt: new Date("2026-03-17T10:00:00.000Z"),
            soldAt: null
        });
        const response = await (0, supertest_1.default)(app.getHttpServer())
            .post(`/market/listings/${listingId}/cancel`)
            .send({ playerId })
            .expect(201);
        (0, vitest_1.expect)(response.body.status).toBe("cancelled");
    });
});
