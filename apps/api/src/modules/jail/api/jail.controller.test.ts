import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { JailController } from "./jail.controller";
import { JailService } from "../application/jail.service";

describe("JailController", () => {
  let app: INestApplication;
  const jailService = {
    getStatus: vi.fn()
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [JailController],
      providers: [
        {
          provide: JailService,
          useValue: jailService
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

  it("returns jail status for a player", async () => {
    const playerId = crypto.randomUUID();
    vi.mocked(jailService.getStatus).mockResolvedValueOnce({
      playerId,
      active: true,
      until: new Date("2026-03-16T20:05:00.000Z"),
      remainingSeconds: 300
    });

    const response = await request(app.getHttpServer())
      .get(`/players/${playerId}/jail/status`)
      .expect(200);

    expect(response.body).toEqual({
      playerId,
      active: true,
      until: "2026-03-16T20:05:00.000Z",
      remainingSeconds: 300
    });
  });
});
