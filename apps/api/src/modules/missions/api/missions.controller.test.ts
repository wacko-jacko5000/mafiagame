import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { AuthGuard } from "../../auth/api/auth.guard";
import { AuthService } from "../../auth/application/auth.service";
import { MissionsService } from "../application/missions.service";
import { MissionsController } from "./missions.controller";

describe("MissionsController", () => {
  let app: INestApplication;
  const missionsService = {
    acceptMission: vi.fn(),
    completeMission: vi.fn(),
    listMissions: vi.fn(),
    listPlayerMissions: vi.fn()
  };
  const authService = {
    authenticate: vi.fn()
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [MissionsController],
      providers: [
        {
          provide: MissionsService,
          useValue: missionsService
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

  it("lists mission definitions", async () => {
    vi.mocked(missionsService.listMissions).mockReturnValueOnce([
      {
        id: "crime-spree",
        name: "Crime Spree",
        description: "Commit 3 crimes to build early momentum.",
        objectiveType: "commit_crime_n_times",
        objectiveTarget: 3,
        rewardCash: 300,
        rewardRespect: 1,
        isRepeatable: true
      }
    ]);

    const response = await request(app.getHttpServer()).get("/missions").expect(200);

    expect(response.body).toEqual([
      {
        id: "crime-spree",
        name: "Crime Spree",
        description: "Commit 3 crimes to build early momentum.",
        objectiveType: "commit_crime_n_times",
        objectiveTarget: 3,
        rewardCash: 300,
        rewardRespect: 1,
        isRepeatable: true
      }
    ]);
  });

  it("lists player missions", async () => {
    const playerId = crypto.randomUUID();
    vi.mocked(missionsService.listPlayerMissions).mockResolvedValueOnce([
      {
        id: crypto.randomUUID(),
        playerId,
        missionId: "crime-spree",
        status: "active",
        progress: 1,
        targetProgress: 3,
        acceptedAt: new Date("2026-03-18T10:00:00.000Z"),
        completedAt: null,
        definition: {
          id: "crime-spree",
          name: "Crime Spree",
          description: "Commit 3 crimes to build early momentum.",
          objectiveType: "commit_crime_n_times",
          objectiveTarget: 3,
          rewardCash: 300,
          rewardRespect: 1,
          isRepeatable: true
        }
      }
    ]);

    const response = await request(app.getHttpServer())
      .get(`/players/${playerId}/missions`)
      .expect(200);

    expect(response.body[0]).toMatchObject({
      playerId,
      missionId: "crime-spree",
      status: "active",
      progress: 1
    });
  });

  it("accepts a mission for a player", async () => {
    const playerId = crypto.randomUUID();

    vi.mocked(missionsService.acceptMission).mockResolvedValueOnce({
      id: crypto.randomUUID(),
      playerId,
      missionId: "crime-spree",
      status: "active",
      progress: 0,
      targetProgress: 3,
      acceptedAt: new Date("2026-03-18T10:00:00.000Z"),
      completedAt: null,
      definition: {
        id: "crime-spree",
        name: "Crime Spree",
        description: "Commit 3 crimes to build early momentum.",
        objectiveType: "commit_crime_n_times",
        objectiveTarget: 3,
        rewardCash: 300,
        rewardRespect: 1,
        isRepeatable: true
      }
    });

    const response = await request(app.getHttpServer())
      .post(`/players/${playerId}/missions/crime-spree/accept`)
      .expect(201);

    expect(response.body).toMatchObject({
      playerId,
      missionId: "crime-spree",
      status: "active",
      progress: 0
    });
  });

  it("completes a mission for a player", async () => {
    const playerId = crypto.randomUUID();

    vi.mocked(missionsService.completeMission).mockResolvedValueOnce({
      mission: {
        id: crypto.randomUUID(),
        playerId,
        missionId: "crime-spree",
        status: "completed",
        progress: 3,
        targetProgress: 3,
        acceptedAt: new Date("2026-03-18T10:00:00.000Z"),
        completedAt: new Date("2026-03-18T11:00:00.000Z"),
        definition: {
          id: "crime-spree",
          name: "Crime Spree",
          description: "Commit 3 crimes to build early momentum.",
          objectiveType: "commit_crime_n_times",
          objectiveTarget: 3,
          rewardCash: 300,
          rewardRespect: 1,
          isRepeatable: true
        }
      },
      rewards: {
        cash: 300,
        respect: 1
      },
      playerResources: {
        cash: 2800,
        respect: 1,
        energy: 90,
        health: 100
      }
    });

    const response = await request(app.getHttpServer())
      .post(`/players/${playerId}/missions/crime-spree/complete`)
      .expect(201);

    expect(response.body).toMatchObject({
      rewards: {
        cash: 300,
        respect: 1
      },
      playerResources: {
        cash: 2800,
        respect: 1
      }
    });
  });

  it("accepts a mission for the authenticated player", async () => {
    const playerId = crypto.randomUUID();
    vi.mocked(authService.authenticate).mockResolvedValueOnce({
      accountId: crypto.randomUUID(),
      email: "test@example.com",
      playerId
    });
    vi.mocked(missionsService.acceptMission).mockResolvedValueOnce({
      id: crypto.randomUUID(),
      playerId,
      missionId: "crime-spree",
      status: "active",
      progress: 0,
      targetProgress: 3,
      acceptedAt: new Date("2026-03-18T10:00:00.000Z"),
      completedAt: null,
      definition: {
        id: "crime-spree",
        name: "Crime Spree",
        description: "Commit 3 crimes to build early momentum.",
        objectiveType: "commit_crime_n_times",
        objectiveTarget: 3,
        rewardCash: 300,
        rewardRespect: 1,
        isRepeatable: true
      }
    });

    await request(app.getHttpServer())
      .post("/me/missions/crime-spree/accept")
      .set("Authorization", "Bearer token-123")
      .expect(201);
  });
});
