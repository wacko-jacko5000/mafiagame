import { describe, expect, it, vi } from "vitest";

import { DomainEventsService } from "../../../platform/domain-events/domain-events.service";
import { PlayerService } from "../../player/application/player.service";
import type { MarketRepository } from "./market.repository";
import { MarketService } from "./market.service";

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

function createMarketRepositoryMock(): MarketRepository {
  return {
    listListings: vi.fn(),
    findListingById: vi.fn(),
    createListing: vi.fn(),
    cancelListing: vi.fn(),
    buyListing: vi.fn()
  };
}

describe("MarketService", () => {
  it("lists market listings", async () => {
    const service = new MarketService(
      createPlayerServiceMock(),
      createDomainEventsServiceMock(),
      {
        ...createMarketRepositoryMock(),
        listListings: vi.fn().mockResolvedValue([
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
      }
    );

    const result = await service.listListings();

    expect(result[0]).toMatchObject({
      id: "listing-1",
      itemName: "Rusty Knife",
      itemType: "weapon",
      price: 900
    });
  });

  it("creates a listing for an owned unequipped item", async () => {
    const playerId = crypto.randomUUID();
    const playerService = createPlayerServiceMock();
    const repository = createMarketRepositoryMock();
    vi.mocked(playerService.getPlayerById).mockResolvedValue({
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
    vi.mocked(repository.createListing).mockResolvedValue({
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

    const service = new MarketService(
      playerService,
      createDomainEventsServiceMock(),
      repository
    );
    const result = await service.createListing({
      playerId,
      inventoryItemId: "owned-1",
      price: 900
    });

    expect(result.status).toBe("active");
    expect(result.price).toBe(900);
  });

  it("rejects invalid listing prices", async () => {
    const service = new MarketService(
      createPlayerServiceMock(),
      createDomainEventsServiceMock(),
      createMarketRepositoryMock()
    );

    await expect(
      service.createListing({
        playerId: crypto.randomUUID(),
        inventoryItemId: crypto.randomUUID(),
        price: 0
      })
    ).rejects.toMatchObject({
      status: 400
    });
  });

  it("buys an active listing and returns settlement data", async () => {
    const buyerPlayerId = crypto.randomUUID();
    const playerService = createPlayerServiceMock();
    const domainEventsService = createDomainEventsServiceMock();
    const repository = createMarketRepositoryMock();
    vi.mocked(playerService.getPlayerById).mockResolvedValue({
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
    vi.mocked(repository.buyListing).mockResolvedValue({
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

    const service = new MarketService(playerService, domainEventsService, repository);
    const result = await service.buyListing({
      listingId: "listing-1",
      buyerPlayerId
    });

    expect(result).toMatchObject({
      transferredInventoryItemId: "owned-1",
      buyerCashAfterPurchase: 1600,
      sellerCashAfterSale: 3400
    });
    expect(domainEventsService.publish).toHaveBeenCalledWith({
      type: "market.item_sold",
      occurredAt: new Date("2026-03-17T10:05:00.000Z"),
      listingId: "listing-1",
      inventoryItemId: "owned-1",
      itemId: "rusty-knife",
      itemName: "Rusty Knife",
      sellerPlayerId: "seller-1",
      buyerPlayerId,
      price: 900
    });
  });

  it("blocks buying a listing without enough cash", async () => {
    const buyerPlayerId = crypto.randomUUID();
    const playerService = createPlayerServiceMock();
    const repository = createMarketRepositoryMock();
    vi.mocked(playerService.getPlayerById).mockResolvedValue({
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
    vi.mocked(repository.buyListing).mockResolvedValue({
      status: "insufficient_cash",
      listing: null,
      buyerCashAfterPurchase: null,
      sellerCashAfterSale: null
    });

    const service = new MarketService(
      playerService,
      createDomainEventsServiceMock(),
      repository
    );

    await expect(
      service.buyListing({
        listingId: "listing-1",
        buyerPlayerId
      })
    ).rejects.toMatchObject({
      status: 400
    });
  });
});
