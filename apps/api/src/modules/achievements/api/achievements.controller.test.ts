import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { AchievementsService } from "../application/achievements.service";
import { AchievementsController } from "./achievements.controller";

describe("AchievementsController", () => {
  let app: INestApplication;
  const achievementsService = {
    listAchievements: vi.fn(),
    listPlayerAchievements: vi.fn()
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AchievementsController],
      providers: [
        {
          provide: AchievementsService,
          useValue: achievementsService
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

  it("lists achievement definitions", async () => {
    vi.mocked(achievementsService.listAchievements).mockReturnValueOnce([
      {
        id: "complete_first_crime",
        name: "First Crime",
        description: "Complete your first crime attempt.",
        triggerType: "crime_completed_count",
        targetCount: 1
      }
    ]);

    const response = await request(app.getHttpServer()).get("/achievements").expect(200);

    expect(response.body).toEqual([
      {
        id: "complete_first_crime",
        name: "First Crime",
        description: "Complete your first crime attempt.",
        triggerType: "crime_completed_count",
        targetCount: 1
      }
    ]);
  });

  it("lists player achievement state", async () => {
    const playerId = crypto.randomUUID();
    vi.mocked(achievementsService.listPlayerAchievements).mockResolvedValueOnce([
      {
        playerId,
        achievementId: "sell_first_item",
        progress: 1,
        targetProgress: 1,
        unlockedAt: new Date("2026-03-18T10:00:00.000Z"),
        definition: {
          id: "sell_first_item",
          name: "First Sale",
          description: "Sell your first item on the market.",
          triggerType: "market_item_sold_count",
          targetCount: 1
        }
      }
    ]);

    const response = await request(app.getHttpServer())
      .get(`/players/${playerId}/achievements`)
      .expect(200);

    expect(response.body).toEqual([
      {
        playerId,
        achievementId: "sell_first_item",
        progress: 1,
        targetProgress: 1,
        unlockedAt: "2026-03-18T10:00:00.000Z",
        definition: {
          id: "sell_first_item",
          name: "First Sale",
          description: "Sell your first item on the market.",
          triggerType: "market_item_sold_count",
          targetCount: 1
        }
      }
    ]);
  });
});
