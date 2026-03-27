"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const market_service_1 = require("./market.service");
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
function createMarketRepositoryMock() {
    return {
        listListings: vitest_1.vi.fn(),
        findListingById: vitest_1.vi.fn(),
        createListing: vitest_1.vi.fn(),
        cancelListing: vitest_1.vi.fn(),
        buyListing: vitest_1.vi.fn()
    };
}
(0, vitest_1.describe)("MarketService", () => {
    (0, vitest_1.it)("lists market listings", async () => {
        const service = new market_service_1.MarketService(createPlayerServiceMock(), createDomainEventsServiceMock(), {
            ...createMarketRepositoryMock(),
            listListings: vitest_1.vi.fn().mockResolvedValue([
                {
                    id: "listing-1",
                    inventoryItemId: "owned-1",
                    sellerPlayerId: "player-1",
                    buyerPlayerId: null,
                    itemId: "rusty-knife",
                    price: 900,
                    status: "active",
                    createdAt: new Date("2026-03-17T10:00:00.000Z"),
                    soldAt: null
                }
            ])
        });
        const result = await service.listListings();
        (0, vitest_1.expect)(result[0]).toMatchObject({
            id: "listing-1",
            itemName: "Glock 17",
            itemType: "weapon",
            price: 900
        });
    });
    (0, vitest_1.it)("creates a listing for an owned unequipped item", async () => {
        const playerId = crypto.randomUUID();
        const playerService = createPlayerServiceMock();
        const repository = createMarketRepositoryMock();
        vitest_1.vi.mocked(playerService.getPlayerById).mockResolvedValue({
            id: playerId,
            displayName: "Seller",
            cash: 2500,
            respect: 0,
            energy: 100,
            health: 100,
            jailedUntil: null,
            hospitalizedUntil: null,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        vitest_1.vi.mocked(repository.createListing).mockResolvedValue({
            status: "created",
            listing: {
                id: "listing-1",
                inventoryItemId: "owned-1",
                sellerPlayerId: playerId,
                buyerPlayerId: null,
                itemId: "rusty-knife",
                price: 900,
                status: "active",
                createdAt: new Date("2026-03-17T10:00:00.000Z"),
                soldAt: null
            }
        });
        const service = new market_service_1.MarketService(playerService, createDomainEventsServiceMock(), repository);
        const result = await service.createListing({
            playerId,
            inventoryItemId: "owned-1",
            price: 900
        });
        (0, vitest_1.expect)(result.status).toBe("active");
        (0, vitest_1.expect)(result.price).toBe(900);
    });
    (0, vitest_1.it)("rejects invalid listing prices", async () => {
        const service = new market_service_1.MarketService(createPlayerServiceMock(), createDomainEventsServiceMock(), createMarketRepositoryMock());
        await (0, vitest_1.expect)(service.createListing({
            playerId: crypto.randomUUID(),
            inventoryItemId: crypto.randomUUID(),
            price: 0
        })).rejects.toMatchObject({
            status: 400
        });
    });
    (0, vitest_1.it)("buys an active listing and returns settlement data", async () => {
        const buyerPlayerId = crypto.randomUUID();
        const playerService = createPlayerServiceMock();
        const domainEventsService = createDomainEventsServiceMock();
        const repository = createMarketRepositoryMock();
        vitest_1.vi.mocked(playerService.getPlayerById).mockResolvedValue({
            id: buyerPlayerId,
            displayName: "Buyer",
            cash: 2500,
            respect: 0,
            energy: 100,
            health: 100,
            jailedUntil: null,
            hospitalizedUntil: null,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        vitest_1.vi.mocked(repository.buyListing).mockResolvedValue({
            status: "purchased",
            listing: {
                id: "listing-1",
                inventoryItemId: "owned-1",
                sellerPlayerId: "seller-1",
                buyerPlayerId,
                itemId: "rusty-knife",
                price: 900,
                status: "sold",
                createdAt: new Date("2026-03-17T10:00:00.000Z"),
                soldAt: new Date("2026-03-17T10:05:00.000Z")
            },
            buyerCashAfterPurchase: 1600,
            sellerCashAfterSale: 3400
        });
        const service = new market_service_1.MarketService(playerService, domainEventsService, repository);
        const result = await service.buyListing({
            listingId: "listing-1",
            buyerPlayerId
        });
        (0, vitest_1.expect)(result).toMatchObject({
            transferredInventoryItemId: "owned-1",
            buyerCashAfterPurchase: 1600,
            sellerCashAfterSale: 3400
        });
        (0, vitest_1.expect)(domainEventsService.publish).toHaveBeenCalledWith({
            type: "market.item_sold",
            occurredAt: new Date("2026-03-17T10:05:00.000Z"),
            listingId: "listing-1",
            inventoryItemId: "owned-1",
            itemId: "rusty-knife",
            itemName: "Glock 17",
            sellerPlayerId: "seller-1",
            buyerPlayerId,
            price: 900
        });
    });
    (0, vitest_1.it)("blocks buying a listing without enough cash", async () => {
        const buyerPlayerId = crypto.randomUUID();
        const playerService = createPlayerServiceMock();
        const repository = createMarketRepositoryMock();
        vitest_1.vi.mocked(playerService.getPlayerById).mockResolvedValue({
            id: buyerPlayerId,
            displayName: "Buyer",
            cash: 100,
            respect: 0,
            energy: 100,
            health: 100,
            jailedUntil: null,
            hospitalizedUntil: null,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        vitest_1.vi.mocked(repository.buyListing).mockResolvedValue({
            status: "insufficient_cash",
            listing: null,
            buyerCashAfterPurchase: null,
            sellerCashAfterSale: null
        });
        const service = new market_service_1.MarketService(playerService, createDomainEventsServiceMock(), repository);
        await (0, vitest_1.expect)(service.buyListing({
            listingId: "listing-1",
            buyerPlayerId
        })).rejects.toMatchObject({
            status: 400
        });
    });
});
