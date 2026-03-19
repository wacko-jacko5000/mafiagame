import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { AuthGuard } from "../../auth/api/auth.guard";
import { AuthService } from "../../auth/application/auth.service";
import { HospitalService } from "../../hospital/application/hospital.service";
import { JailService } from "../../jail/application/jail.service";
import { PlayerService } from "../../player/application/player.service";
import { DomainEventsService } from "../../../platform/domain-events/domain-events.service";
import { CRIME_RANDOM_PROVIDER } from "../application/crime.constants";
import { CrimeService } from "../application/crime.service";
import { CrimeController } from "./crime.controller";

describe("CrimeController", () => {
  let app: INestApplication;
  const playerService = {
    getPlayerById: vi.fn(),
    applyResourceDelta: vi.fn()
  };
  const jailService = {
    getStatus: vi.fn(),
    jailPlayer: vi.fn()
  };
  const hospitalService = {
    getStatus: vi.fn(),
    hospitalizePlayer: vi.fn()
  };
  const domainEventsService = {
    publish: vi.fn()
  };
  const authService = {
    authenticate: vi.fn()
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [CrimeController],
      providers: [
        CrimeService,
        {
          provide: PlayerService,
          useValue: playerService
        },
        {
          provide: JailService,
          useValue: jailService
        },
        {
          provide: HospitalService,
          useValue: hospitalService
        },
        {
          provide: DomainEventsService,
          useValue: domainEventsService
        },
        {
          provide: AuthService,
          useValue: authService
        },
        AuthGuard,
        {
          provide: CRIME_RANDOM_PROVIDER,
          useValue: () => 0.3
        }
      ]
    })
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it("lists available crimes", async () => {
    const response = await request(app.getHttpServer()).get("/crimes").expect(200);

    expect(response.body).toHaveLength(3);
    expect(response.body[0]).toMatchObject({
      id: "pickpocket"
    });
  });

  it("executes a crime for a player", async () => {
    const playerId = crypto.randomUUID();
    vi.mocked(jailService.getStatus).mockResolvedValueOnce({
      playerId,
      active: false,
      until: null,
      remainingSeconds: 0
    });
    vi.mocked(hospitalService.getStatus).mockResolvedValueOnce({
      playerId,
      active: false,
      until: null,
      remainingSeconds: 0
    });
    vi.mocked(playerService.getPlayerById).mockResolvedValueOnce({
      id: playerId,
      accountId: null,
      displayName: "Don Luca",
      cash: 2500,
      respect: 0,
      energy: 100,
      health: 100,
      jailedUntil: null,
      hospitalizedUntil: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    vi.mocked(playerService.applyResourceDelta).mockResolvedValueOnce({
      id: playerId,
      accountId: null,
      displayName: "Don Luca",
      cash: 2700,
      respect: 1,
      energy: 90,
      health: 100,
      jailedUntil: null,
      hospitalizedUntil: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const response = await request(app.getHttpServer())
      .post(`/players/${playerId}/crimes/pickpocket/execute`)
      .expect(201);

    expect(response.body).toMatchObject({
      crimeId: "pickpocket",
      success: true,
      energySpent: 10,
      consequence: {
        type: "none",
        activeUntil: null
      }
    });
  });

  it("rejects invalid player ids", async () => {
    await request(app.getHttpServer())
      .post("/players/not-a-uuid/crimes/pickpocket/execute")
      .expect(400);
  });

  it("executes a crime for the authenticated player", async () => {
    const playerId = crypto.randomUUID();
    vi.mocked(authService.authenticate).mockResolvedValueOnce({
      accountId: crypto.randomUUID(),
      email: "test@example.com",
      playerId
    });
    vi.mocked(jailService.getStatus).mockResolvedValueOnce({
      playerId,
      active: false,
      until: null,
      remainingSeconds: 0
    });
    vi.mocked(hospitalService.getStatus).mockResolvedValueOnce({
      playerId,
      active: false,
      until: null,
      remainingSeconds: 0
    });
    vi.mocked(playerService.getPlayerById).mockResolvedValueOnce({
      id: playerId,
      accountId: null,
      displayName: "Don Luca",
      cash: 2500,
      respect: 0,
      energy: 100,
      health: 100,
      jailedUntil: null,
      hospitalizedUntil: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    vi.mocked(playerService.applyResourceDelta).mockResolvedValueOnce({
      id: playerId,
      accountId: null,
      displayName: "Don Luca",
      cash: 2700,
      respect: 1,
      energy: 90,
      health: 100,
      jailedUntil: null,
      hospitalizedUntil: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await request(app.getHttpServer())
      .post("/me/crimes/pickpocket/execute")
      .set("Authorization", "Bearer token-123")
      .expect(201);
  });
});
