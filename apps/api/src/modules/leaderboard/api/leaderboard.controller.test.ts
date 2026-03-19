import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import {
  LEADERBOARD_REPOSITORY,
  type LeaderboardRepository
} from "../application/leaderboard.repository";
import { LeaderboardModule } from "../leaderboard.module";

function createLeaderboardRepositoryMock(): LeaderboardRepository {
  return {
    listLeaderboardRecords: vi.fn()
  };
}

describe("LeaderboardController", () => {
  let app: INestApplication;
  let repository: LeaderboardRepository;

  beforeAll(async () => {
    repository = createLeaderboardRepositoryMock();

    const moduleRef = await Test.createTestingModule({
      imports: [LeaderboardModule]
    })
      .overrideProvider(LEADERBOARD_REPOSITORY)
      .useValue(repository)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it("lists the available leaderboards", async () => {
    const response = await request(app.getHttpServer())
      .get("/leaderboards")
      .expect(200);

    expect(response.body.map((leaderboard: { id: string }) => leaderboard.id)).toEqual([
      "richest_players",
      "most_respected_players",
      "most_achievements_unlocked"
    ]);
  });

  it("returns a specific leaderboard", async () => {
    vi.mocked(repository.listLeaderboardRecords).mockResolvedValueOnce([
      {
        playerId: "player-1",
        displayName: "Boss",
        createdAt: new Date("2026-03-18T10:00:00.000Z"),
        metricValue: 9000
      }
    ]);

    const response = await request(app.getHttpServer())
      .get("/leaderboards/richest_players?limit=1")
      .expect(200);

    expect(response.body).toMatchObject({
      id: "richest_players",
      metricKey: "cash",
      limit: 1,
      entries: [
        {
          rank: 1,
          playerId: "player-1",
          displayName: "Boss",
          metricValue: 9000
        }
      ]
    });
  });

  it("rejects invalid leaderboard limits", async () => {
    await request(app.getHttpServer())
      .get("/leaderboards/richest_players?limit=abc")
      .expect(400);
  });
});
