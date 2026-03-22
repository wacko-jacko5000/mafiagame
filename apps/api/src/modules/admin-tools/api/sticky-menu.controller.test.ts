import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { AuthService } from "../../auth/application/auth.service";
import { StickyMenuService } from "../application/sticky-menu.service";
import {
  AdminStickyMenuController,
  StickyMenuController
} from "./sticky-menu.controller";
import { AdminApiKeyGuard } from "./admin-api-key.guard";

describe("StickyMenuController", () => {
  let app: INestApplication;
  const stickyMenuService = {
    getConfig: vi.fn(),
    updateConfig: vi.fn()
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [StickyMenuController, AdminStickyMenuController],
      providers: [
        AdminApiKeyGuard,
        {
          provide: StickyMenuService,
          useValue: stickyMenuService
        },
        {
          provide: AuthService,
          useValue: {
            authenticate: vi.fn((token: string) => {
              if (token === "admin-token") {
                return {
                  accountId: crypto.randomUUID(),
                  email: "boss@example.com",
                  isAdmin: true,
                  playerId: null
                };
              }

              return null;
            })
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

  it("returns sticky menu config from the public route", async () => {
    vi.mocked(stickyMenuService.getConfig).mockResolvedValueOnce({
      header: {
        enabled: true,
        resourceKeys: ["cash", "respect"]
      },
      primaryItems: ["home", "crimes", "missions", "shop", "more"],
      moreItems: ["inventory", "activity"],
      availableDestinationKeys: [
        "home",
        "crimes",
        "missions",
        "shop",
        "business",
        "inventory",
        "activity",
        "achievements",
        "gangs",
        "territory",
        "market",
        "leaderboard",
        "more"
      ],
      availableHeaderResourceKeys: ["cash", "respect", "energy", "health", "rank"],
      maxPrimaryItems: 5
    });

    const response = await request(app.getHttpServer()).get("/sticky-menu").expect(200);

    expect(response.body.primaryItems).toEqual(["home", "crimes", "missions", "shop", "more"]);
  });

  it("updates sticky menu config through the admin route", async () => {
    vi.mocked(stickyMenuService.updateConfig).mockResolvedValueOnce({
      header: {
        enabled: true,
        resourceKeys: ["cash", "respect", "energy"]
      },
      primaryItems: ["home", "inventory", "missions", "shop", "more"],
      moreItems: ["activity", "market"],
      availableDestinationKeys: [
        "home",
        "crimes",
        "missions",
        "shop",
        "business",
        "inventory",
        "activity",
        "achievements",
        "gangs",
        "territory",
        "market",
        "leaderboard",
        "more"
      ],
      availableHeaderResourceKeys: ["cash", "respect", "energy", "health", "rank"],
      maxPrimaryItems: 5
    });

    const payload = {
      header: {
        enabled: true,
        resourceKeys: ["cash", "respect", "energy"]
      },
      primaryItems: ["home", "inventory", "missions", "shop", "more"],
      moreItems: ["activity", "market"]
    };

    const response = await request(app.getHttpServer())
      .patch("/admin/sticky-menu")
      .set("Authorization", "Bearer admin-token")
      .send(payload)
      .expect(200);

    expect(stickyMenuService.updateConfig).toHaveBeenCalledWith(payload);
    expect(response.body.moreItems).toEqual(["activity", "market"]);
  });
});
