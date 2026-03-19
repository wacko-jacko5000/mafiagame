import { INestApplication } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { AdminApiKeyGuard } from "../../admin-tools/api/admin-api-key.guard";
import { SeasonsService } from "../application/seasons.service";
import {
  AdminSeasonsController,
  SeasonsController
} from "./seasons.controller";

describe("SeasonsController", () => {
  let app: INestApplication;
  const seasonsService = {
    listSeasons: vi.fn(),
    getCurrentSeason: vi.fn(),
    getSeasonById: vi.fn(),
    createSeason: vi.fn(),
    activateSeason: vi.fn(),
    deactivateSeason: vi.fn()
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [SeasonsController, AdminSeasonsController],
      providers: [
        AdminApiKeyGuard,
        {
          provide: SeasonsService,
          useValue: seasonsService
        },
        {
          provide: ConfigService,
          useValue: {
            get: vi.fn().mockReturnValue("test-admin-token")
          }
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

  it("lists season history", async () => {
    vi.mocked(seasonsService.listSeasons).mockResolvedValueOnce([
      {
        id: crypto.randomUUID(),
        name: "Season One",
        status: "inactive",
        startsAt: null,
        endsAt: null,
        activatedAt: new Date("2026-03-01T00:00:00.000Z"),
        deactivatedAt: new Date("2026-03-10T00:00:00.000Z"),
        createdAt: new Date("2026-02-20T00:00:00.000Z")
      }
    ]);

    const response = await request(app.getHttpServer()).get("/seasons").expect(200);

    expect(response.body).toEqual([
      {
        id: expect.any(String),
        name: "Season One",
        status: "inactive",
        startsAt: null,
        endsAt: null,
        activatedAt: "2026-03-01T00:00:00.000Z",
        deactivatedAt: "2026-03-10T00:00:00.000Z",
        createdAt: "2026-02-20T00:00:00.000Z"
      }
    ]);
  });

  it("returns the current season when one is active", async () => {
    const seasonId = crypto.randomUUID();
    vi.mocked(seasonsService.getCurrentSeason).mockResolvedValueOnce({
      id: seasonId,
      name: "Season Two",
      status: "active",
      startsAt: null,
      endsAt: null,
      activatedAt: new Date("2026-03-18T20:00:00.000Z"),
      deactivatedAt: null,
      createdAt: new Date("2026-03-15T00:00:00.000Z")
    });

    const response = await request(app.getHttpServer())
      .get("/seasons/current")
      .expect(200);

    expect(response.body).toMatchObject({
      season: {
        id: seasonId,
        name: "Season Two",
        status: "active"
      }
    });
  });

  it("returns null when no season is active", async () => {
    vi.mocked(seasonsService.getCurrentSeason).mockResolvedValueOnce(null);

    const response = await request(app.getHttpServer())
      .get("/seasons/current")
      .expect(200);

    expect(response.body).toEqual({
      season: null
    });
  });

  it("returns a single season by id", async () => {
    const seasonId = crypto.randomUUID();
    vi.mocked(seasonsService.getSeasonById).mockResolvedValueOnce({
      id: seasonId,
      name: "Season Three",
      status: "draft",
      startsAt: new Date("2026-04-01T00:00:00.000Z"),
      endsAt: new Date("2026-04-30T00:00:00.000Z"),
      activatedAt: null,
      deactivatedAt: null,
      createdAt: new Date("2026-03-18T00:00:00.000Z")
    });

    const response = await request(app.getHttpServer())
      .get(`/seasons/${seasonId}`)
      .expect(200);

    expect(response.body).toMatchObject({
      id: seasonId,
      name: "Season Three",
      status: "draft",
      startsAt: "2026-04-01T00:00:00.000Z",
      endsAt: "2026-04-30T00:00:00.000Z"
    });
  });

  it("rejects admin season creation without the admin token", async () => {
    await request(app.getHttpServer()).post("/admin/seasons").send({}).expect(401);
  });

  it("creates a season through the admin route", async () => {
    const seasonId = crypto.randomUUID();
    vi.mocked(seasonsService.createSeason).mockResolvedValueOnce({
      id: seasonId,
      name: "Spring Season",
      status: "draft",
      startsAt: new Date("2026-04-01T00:00:00.000Z"),
      endsAt: new Date("2026-04-30T00:00:00.000Z"),
      activatedAt: null,
      deactivatedAt: null,
      createdAt: new Date("2026-03-18T21:00:00.000Z")
    });

    const response = await request(app.getHttpServer())
      .post("/admin/seasons")
      .set("x-admin-token", "test-admin-token")
      .send({
        name: "Spring Season",
        startsAt: "2026-04-01T00:00:00.000Z",
        endsAt: "2026-04-30T00:00:00.000Z"
      })
      .expect(201);

    expect(seasonsService.createSeason).toHaveBeenCalledWith({
      name: "Spring Season",
      startsAt: new Date("2026-04-01T00:00:00.000Z"),
      endsAt: new Date("2026-04-30T00:00:00.000Z")
    });
    expect(response.body).toMatchObject({
      id: seasonId,
      name: "Spring Season",
      status: "draft"
    });
  });

  it("activates a season through the admin route", async () => {
    const seasonId = crypto.randomUUID();
    vi.mocked(seasonsService.activateSeason).mockResolvedValueOnce({
      id: seasonId,
      name: "Season Four",
      status: "active",
      startsAt: null,
      endsAt: null,
      activatedAt: new Date("2026-03-18T21:15:00.000Z"),
      deactivatedAt: null,
      createdAt: new Date("2026-03-18T21:00:00.000Z")
    });

    const response = await request(app.getHttpServer())
      .post(`/admin/seasons/${seasonId}/activate`)
      .set("x-admin-token", "test-admin-token")
      .expect(201);

    expect(seasonsService.activateSeason).toHaveBeenCalledWith(seasonId);
    expect(response.body.status).toBe("active");
  });

  it("deactivates a season through the admin route", async () => {
    const seasonId = crypto.randomUUID();
    vi.mocked(seasonsService.deactivateSeason).mockResolvedValueOnce({
      id: seasonId,
      name: "Season Five",
      status: "inactive",
      startsAt: null,
      endsAt: null,
      activatedAt: new Date("2026-03-17T00:00:00.000Z"),
      deactivatedAt: new Date("2026-03-18T21:20:00.000Z"),
      createdAt: new Date("2026-03-16T00:00:00.000Z")
    });

    const response = await request(app.getHttpServer())
      .post(`/admin/seasons/${seasonId}/deactivate`)
      .set("x-admin-token", "test-admin-token")
      .expect(201);

    expect(seasonsService.deactivateSeason).toHaveBeenCalledWith(seasonId);
    expect(response.body.status).toBe("inactive");
  });
});
