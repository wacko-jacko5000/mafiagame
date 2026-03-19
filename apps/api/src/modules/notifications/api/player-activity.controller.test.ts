import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { AuthGuard } from "../../auth/api/auth.guard";
import { AuthService } from "../../auth/application/auth.service";
import { PlayerActivityService } from "../application/player-activity.service";
import { PlayerActivityController } from "./player-activity.controller";

describe("PlayerActivityController", () => {
  let app: INestApplication;
  const playerActivityService = {
    listPlayerActivity: vi.fn(),
    markActivityRead: vi.fn()
  };
  const authService = {
    authenticate: vi.fn()
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [PlayerActivityController],
      providers: [
        {
          provide: PlayerActivityService,
          useValue: playerActivityService
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

  it("lists player activity entries", async () => {
    const playerId = "11111111-1111-1111-1111-111111111111";
    vi.mocked(playerActivityService.listPlayerActivity).mockResolvedValueOnce([
      {
        id: "22222222-2222-2222-2222-222222222222",
        playerId,
        type: "market_item_sold",
        title: "Item sold",
        body: "Your Rusty Knife sold for $900.",
        createdAt: new Date("2026-03-18T10:00:00.000Z"),
        readAt: null
      }
    ]);

    const response = await request(app.getHttpServer())
      .get(`/players/${playerId}/activity?limit=10`)
      .expect(200);

    expect(response.body).toEqual([
      {
        id: "22222222-2222-2222-2222-222222222222",
        playerId,
        type: "market_item_sold",
        title: "Item sold",
        body: "Your Rusty Knife sold for $900.",
        createdAt: "2026-03-18T10:00:00.000Z",
        readAt: null
      }
    ]);
  });

  it("marks a player activity entry as read", async () => {
    const playerId = "11111111-1111-1111-1111-111111111111";
    const activityId = "22222222-2222-2222-2222-222222222222";
    vi.mocked(playerActivityService.markActivityRead).mockResolvedValueOnce({
      id: activityId,
      playerId,
      type: "achievement_unlocked",
      title: "Achievement unlocked",
      body: "First Crime: Complete your first crime attempt.",
      createdAt: new Date("2026-03-18T10:00:00.000Z"),
      readAt: new Date("2026-03-18T10:10:00.000Z")
    });

    const response = await request(app.getHttpServer())
      .post(`/players/${playerId}/activity/${activityId}/read`)
      .expect(201);

    expect(response.body.readAt).toBe("2026-03-18T10:10:00.000Z");
  });

  it("lists activity for the authenticated player", async () => {
    const playerId = "11111111-1111-1111-1111-111111111111";
    vi.mocked(authService.authenticate).mockResolvedValueOnce({
      accountId: crypto.randomUUID(),
      email: "test@example.com",
      playerId
    });
    vi.mocked(playerActivityService.listPlayerActivity).mockResolvedValueOnce([]);

    await request(app.getHttpServer())
      .get("/me/activity")
      .set("Authorization", "Bearer token-123")
      .expect(200);
  });
});
