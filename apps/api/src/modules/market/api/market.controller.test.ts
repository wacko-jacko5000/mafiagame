import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { MarketService } from "../application/market.service";
import { MarketController } from "./market.controller";

describe("MarketController", () => {
  let app: INestApplication;
  const marketService = {
    listListings: vi.fn(),
    getListingById: vi.fn(),
    createListing: vi.fn(),
    buyListing: vi.fn(),
    cancelListing: vi.fn()
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [MarketController],
      providers: [
        {
          provide: MarketService,
          useValue: marketService
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

  it("lists market listings", async () => {
    vi.mocked(marketService.listListings).mockResolvedValueOnce([
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

    const response = await request(app.getHttpServer()).get("/market/listings").expect(200);

    expect(response.body[0]).toEqual({
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

  it("creates a listing", async () => {
    const playerId = crypto.randomUUID();
    const inventoryItemId = crypto.randomUUID();
    vi.mocked(marketService.createListing).mockResolvedValueOnce({
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

    const response = await request(app.getHttpServer())
      .post("/market/listings")
      .send({
        playerId,
        inventoryItemId,
        price: 900
      })
      .expect(201);

    expect(response.body.status).toBe("active");
  });

  it("buys a listing", async () => {
    const listingId = "11111111-1111-1111-1111-111111111111";
    const buyerPlayerId = crypto.randomUUID();
    vi.mocked(marketService.buyListing).mockResolvedValueOnce({
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

    const response = await request(app.getHttpServer())
      .post(`/market/listings/${listingId}/buy`)
      .send({ buyerPlayerId })
      .expect(201);

    expect(response.body.buyerCashAfterPurchase).toBe(1600);
    expect(response.body.listing.status).toBe("sold");
  });

  it("cancels a listing", async () => {
    const listingId = "11111111-1111-1111-1111-111111111111";
    const playerId = crypto.randomUUID();
    vi.mocked(marketService.cancelListing).mockResolvedValueOnce({
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

    const response = await request(app.getHttpServer())
      .post(`/market/listings/${listingId}/cancel`)
      .send({ playerId })
      .expect(201);

    expect(response.body.status).toBe("cancelled");
  });
});
