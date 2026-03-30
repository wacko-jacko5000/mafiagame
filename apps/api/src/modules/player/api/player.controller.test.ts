import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { AuthService } from "../../auth/application/auth.service";
import { PlayerModule } from "../player.module";
import { PLAYER_REPOSITORY, type PlayerRepository } from "../application/player.repository";

function createRepositoryMock(): PlayerRepository {
  return {
    create: vi.fn(),
    applyResourceDelta: vi.fn(),
    updateCustodyStatus: vi.fn(),
    applyCustodyEntry: vi.fn(),
    buyOutCustodyStatus: vi.fn(),
    findByAccountId: vi.fn(),
    findByDisplayName: vi.fn(),
    findById: vi.fn()
  };
}

describe("PlayerController", () => {
  let app: INestApplication;
  let repository: PlayerRepository;
  const authService = {
    authenticate: vi.fn()
  };

  beforeAll(async () => {
    repository = createRepositoryMock();

    const moduleRef = await Test.createTestingModule({
      imports: [PlayerModule]
    })
      .overrideProvider(AuthService)
      .useValue(authService)
      .overrideProvider(PLAYER_REPOSITORY)
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

  it("creates a player", async () => {
    const now = new Date("2026-03-16T20:00:00.000Z");
    const playerId = crypto.randomUUID();

    vi.mocked(repository.findByDisplayName).mockResolvedValueOnce(null);
    vi.mocked(repository.create).mockResolvedValueOnce({
      id: playerId,
      accountId: null,
      displayName: "Don Luca",
      cash: 2500,
      respect: 0,
      energy: 100,
      health: 100,
      jailedUntil: null,
      hospitalizedUntil: null,
      heat: 0,
      heatUpdatedAt: now,
      createdAt: now,
      updatedAt: now
    });

    const response = await request(app.getHttpServer())
      .post("/players")
      .send({ displayName: "Don Luca" })
      .expect(201);

    expect(response.body).toMatchObject({
      id: playerId,
      displayName: "Don Luca",
      cash: 2500,
      level: 1,
      rank: "Scum",
      currentRespect: 0,
      currentLevelMinRespect: 0,
      nextLevel: 2,
      nextRank: "Empty Suit",
      nextLevelRespectRequired: 100,
      respectToNextLevel: 100,
      progressPercent: 0,
      energy: 100,
      health: 100,
      jailedUntil: null,
      hospitalizedUntil: null
    });
  });

  it("fetches a player by id", async () => {
    const now = new Date("2026-03-16T20:00:00.000Z");
    const playerId = crypto.randomUUID();

    vi.mocked(repository.findById).mockResolvedValueOnce({
      id: playerId,
      accountId: null,
      displayName: "Don Luca",
      cash: 2500,
      respect: 0,
      energy: 100,
      health: 100,
      jailedUntil: null,
      hospitalizedUntil: null,
      heat: 0,
      heatUpdatedAt: now,
      createdAt: now,
      updatedAt: now
    });

    const response = await request(app.getHttpServer())
      .get(`/players/${playerId}`)
      .expect(200);

    expect(response.body.id).toBe(playerId);
    expect(response.body.displayName).toBe("Don Luca");
    expect(response.body.level).toBe(1);
    expect(response.body.rank).toBe("Scum");
    expect(response.body.currentRespect).toBe(0);
  });

  it("fetches player resources", async () => {
    const now = new Date("2026-03-16T20:00:00.000Z");
    const playerId = crypto.randomUUID();

    vi.mocked(repository.findById).mockResolvedValueOnce({
      id: playerId,
      accountId: null,
      displayName: "Don Luca",
      cash: 2500,
      respect: 0,
      energy: 100,
      health: 100,
      jailedUntil: null,
      hospitalizedUntil: null,
      heat: 0,
      heatUpdatedAt: now,
      createdAt: now,
      updatedAt: now
    });

    const response = await request(app.getHttpServer())
      .get(`/players/${playerId}/resources`)
      .expect(200);

    expect(response.body).toEqual({
      cash: 2500,
      respect: 0,
      energy: 100,
      health: 100
    });
  });

  it("rejects invalid player names", async () => {
    await request(app.getHttpServer())
      .post("/players")
      .send({ displayName: "x" })
      .expect(400);
  });

  it("rejects invalid player ids", async () => {
    await request(app.getHttpServer())
      .get("/players/not-a-uuid")
      .expect(400);
  });

  it("binds a created player to the authenticated account when a bearer token is present", async () => {
    const accountId = crypto.randomUUID();
    const playerId = crypto.randomUUID();
    vi.mocked(authService.authenticate).mockResolvedValueOnce({
      accountId,
      email: "test@example.com",
      playerId: null
    });
    vi.mocked(repository.findByDisplayName).mockResolvedValueOnce(null);
    vi.mocked(repository.findByAccountId).mockResolvedValueOnce(null);
    vi.mocked(repository.create).mockResolvedValueOnce({
      id: playerId,
      accountId,
      displayName: "Don Luca",
      cash: 2500,
      respect: 0,
      energy: 100,
      health: 100,
      jailedUntil: null,
      hospitalizedUntil: null,
      heat: 0,
      heatUpdatedAt: new Date("2026-03-16T20:00:00.000Z"),
      createdAt: new Date("2026-03-16T20:00:00.000Z"),
      updatedAt: new Date("2026-03-16T20:00:00.000Z")
    });

    const response = await request(app.getHttpServer())
      .post("/players")
      .set("Authorization", "Bearer token-123")
      .send({ displayName: "Don Luca" })
      .expect(201);

    expect(response.body.id).toBe(playerId);
    expect(repository.findByAccountId).toHaveBeenCalledWith(accountId);
  });
});
