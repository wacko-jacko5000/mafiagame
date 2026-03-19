import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { AuthGuard } from "./auth.guard";
import { AuthController } from "./auth.controller";
import { AuthService } from "../application/auth.service";

describe("AuthController", () => {
  let app: INestApplication;
  const authService = {
    authenticate: vi.fn(),
    getAccountById: vi.fn(),
    login: vi.fn(),
    register: vi.fn()
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthGuard,
        {
          provide: AuthService,
          useValue: authService
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

  it("registers an account and returns a bearer token", async () => {
    vi.mocked(authService.register).mockResolvedValueOnce({
      accessToken: "token-123",
      account: {
        id: crypto.randomUUID(),
        email: "test@example.com",
        passwordHash: "hidden",
        createdAt: new Date("2026-03-18T20:00:00.000Z"),
        updatedAt: new Date("2026-03-18T20:00:00.000Z"),
        player: null
      }
    });

    const response = await request(app.getHttpServer())
      .post("/auth/register")
      .send({
        email: "test@example.com",
        password: "password123"
      })
      .expect(201);

    expect(response.body).toMatchObject({
      accessToken: "token-123",
      account: {
        email: "test@example.com",
        player: null
      }
    });
  });

  it("returns the authenticated account", async () => {
    const accountId = crypto.randomUUID();
    const playerId = crypto.randomUUID();
    vi.mocked(authService.authenticate).mockResolvedValueOnce({
      accountId,
      email: "test@example.com",
      playerId
    });
    vi.mocked(authService.getAccountById).mockResolvedValueOnce({
      id: accountId,
      email: "test@example.com",
      passwordHash: "hidden",
      createdAt: new Date("2026-03-18T20:00:00.000Z"),
      updatedAt: new Date("2026-03-18T20:00:00.000Z"),
      player: {
        id: playerId,
        displayName: "Don Luca"
      }
    });

    const response = await request(app.getHttpServer())
      .get("/auth/me")
      .set("Authorization", "Bearer token-123")
      .expect(200);

    expect(response.body).toEqual({
      account: {
        id: accountId,
        email: "test@example.com",
        createdAt: "2026-03-18T20:00:00.000Z",
        updatedAt: "2026-03-18T20:00:00.000Z",
        player: {
          id: playerId,
          displayName: "Don Luca"
        }
      }
    });
  });
});
