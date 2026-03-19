import { INestApplication } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { AuthService } from "../../auth/application/auth.service";
import { OptionalAuthGuard } from "../../auth/api/auth.guard";
import { AdminBalanceService } from "../application/admin-balance.service";
import { AdminBalanceController } from "./admin-balance.controller";
import { AdminApiKeyGuard } from "./admin-api-key.guard";

describe("AdminBalanceController", () => {
  let app: INestApplication;
  const adminBalanceService = {
    getAllSections: vi.fn(),
    getSection: vi.fn(),
    getAuditLog: vi.fn(),
    updateSection: vi.fn()
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AdminBalanceController],
      providers: [
        AdminApiKeyGuard,
        OptionalAuthGuard,
        {
          provide: AdminBalanceService,
          useValue: adminBalanceService
        },
        {
          provide: AuthService,
          useValue: {
            authenticate: vi.fn()
          }
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

  it("rejects requests without the admin token", async () => {
    await request(app.getHttpServer()).get("/admin/balance").expect(401);
  });

  it("lists all balance sections when authorized", async () => {
    vi.mocked(adminBalanceService.getAllSections).mockResolvedValueOnce([
      {
        section: "crimes",
        label: "Crime Catalog",
        editableFields: [
          "energyCost",
          "successRate",
          "cashRewardMin",
          "cashRewardMax",
          "respectReward"
        ],
        entries: []
      }
    ]);

    const response = await request(app.getHttpServer())
      .get("/admin/balance")
      .set("x-admin-token", "test-admin-token")
      .expect(200);

    expect(response.body).toEqual({
      sections: [
        {
          section: "crimes",
          label: "Crime Catalog",
          editableFields: [
            "energyCost",
            "successRate",
            "cashRewardMin",
            "cashRewardMax",
            "respectReward"
          ],
          entries: []
        }
      ]
    });
  });

  it("lists audit entries when authorized", async () => {
    vi.mocked(adminBalanceService.getAuditLog).mockResolvedValueOnce([
      {
        id: crypto.randomUUID(),
        section: "shop-items",
        targetId: "rusty-knife",
        changedByAccountId: null,
        previousValue: {
          id: "rusty-knife",
          price: 400
        },
        newValue: {
          id: "rusty-knife",
          price: 450
        },
        changedAt: "2026-03-18T20:00:00.000Z"
      }
    ]);

    const response = await request(app.getHttpServer())
      .get("/admin/balance/audit")
      .set("x-admin-token", "test-admin-token")
      .expect(200);

    expect(response.body.entries).toHaveLength(1);
    expect(adminBalanceService.getAuditLog).toHaveBeenCalledWith({
      section: undefined,
      targetId: undefined,
      limit: undefined
    });
  });

  it("updates a balance section when authorized", async () => {
    vi.mocked(adminBalanceService.updateSection).mockResolvedValueOnce({
      section: "shop-items",
      label: "Starter Shop Items",
      editableFields: ["price"],
      entries: [
        {
          id: "rusty-knife",
          name: "Rusty Knife",
          type: "weapon",
          price: 450,
          equipSlot: "weapon"
        }
      ]
    });

    const response = await request(app.getHttpServer())
      .patch("/admin/balance/shop-items")
      .set("x-admin-token", "test-admin-token")
      .send({
        items: [
          {
            id: "rusty-knife",
            price: 450
          }
        ]
      })
      .expect(200);

    expect(adminBalanceService.updateSection).toHaveBeenCalledWith("shop-items", {
      items: [
        {
          id: "rusty-knife",
          price: 450
        }
      ]
    }, null);
    expect(response.body.entries[0]).toMatchObject({
      id: "rusty-knife",
      price: 450
    });
  });
});
