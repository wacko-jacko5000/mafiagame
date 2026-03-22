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
        id: "level-1-complete-5-crimes",
        name: "Complete 5 crimes",
        description: "Complete 5 crimes",
        unlockLevel: 1,
        objectiveType: "crime_count",
        target: 5,
        rewardCash: 500,
        rewardRespect: 10,
        isRepeatable: false
      }
    ]);

    const response = await request(app.getHttpServer()).get("/missions").expect(200);

    expect(response.body).toEqual([
      {
        id: "level-1-complete-5-crimes",
        name: "Complete 5 crimes",
        description: "Complete 5 crimes",
        unlockLevel: 1,
        requiredLevel: 1,
        objectiveType: "crime_count",
        target: 5,
        objectiveTarget: 5,
        rewardCash: 500,
        rewardRespect: 10,
        isRepeatable: false
      }
    ]);
  });

  it("lists player missions", async () => {
    const playerId = crypto.randomUUID();
    vi.mocked(missionsService.listPlayerMissions).mockResolvedValueOnce([
      {
        id: crypto.randomUUID(),
        playerId,
        missionId: "level-1-complete-5-crimes",
        status: "active",
        progress: 1,
        targetProgress: 5,
        acceptedAt: new Date("2026-03-18T10:00:00.000Z"),
        completedAt: null,
        definition: {
          id: "level-1-complete-5-crimes",
          name: "Complete 5 crimes",
          description: "Complete 5 crimes",
          unlockLevel: 1,
          objectiveType: "crime_count",
          target: 5,
          rewardCash: 500,
          rewardRespect: 10,
          isRepeatable: false
        }
      }
    ]);

    const response = await request(app.getHttpServer())
      .get(`/players/${playerId}/missions`)
      .expect(200);

    expect(response.body[0]).toMatchObject({
      playerId,
      missionId: "level-1-complete-5-crimes",
      status: "active",
      progress: 1
    });
  });
});
