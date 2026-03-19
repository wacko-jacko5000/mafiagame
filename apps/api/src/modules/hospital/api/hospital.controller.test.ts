import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { HospitalController } from "./hospital.controller";
import { HospitalService } from "../application/hospital.service";

describe("HospitalController", () => {
  let app: INestApplication;
  const hospitalService = {
    getStatus: vi.fn()
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [HospitalController],
      providers: [
        {
          provide: HospitalService,
          useValue: hospitalService
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

  it("returns hospital status for a player", async () => {
    const playerId = crypto.randomUUID();
    vi.mocked(hospitalService.getStatus).mockResolvedValueOnce({
      playerId,
      active: true,
      until: new Date("2026-03-16T20:08:00.000Z"),
      remainingSeconds: 480
    });

    const response = await request(app.getHttpServer())
      .get(`/players/${playerId}/hospital/status`)
      .expect(200);

    expect(response.body).toEqual({
      playerId,
      active: true,
      until: "2026-03-16T20:08:00.000Z",
      remainingSeconds: 480
    });
  });
});
