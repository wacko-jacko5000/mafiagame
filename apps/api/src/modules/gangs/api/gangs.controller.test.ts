import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { GangsService } from "../application/gangs.service";
import {
  GangInvitesController,
  GangsController,
  PlayerGangInvitesController
} from "./gangs.controller";

describe("GangsController", () => {
  let app: INestApplication;
  const gangsService = {
    acceptInvite: vi.fn(),
    createGang: vi.fn(),
    declineInvite: vi.fn(),
    getGangById: vi.fn(),
    invitePlayer: vi.fn(),
    joinGang: vi.fn(),
    leaveGang: vi.fn(),
    listGangInvites: vi.fn(),
    listGangMembers: vi.fn(),
    listPlayerGangInvites: vi.fn()
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [GangsController, GangInvitesController, PlayerGangInvitesController],
      providers: [
        {
          provide: GangsService,
          useValue: gangsService
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

  it("creates a gang", async () => {
    const playerId = crypto.randomUUID();
    const gangId = crypto.randomUUID();
    vi.mocked(gangsService.createGang).mockResolvedValueOnce({
      id: gangId,
      name: "Night Owls",
      createdAt: new Date("2026-03-16T22:00:00.000Z"),
      createdByPlayerId: playerId,
      memberCount: 1
    });

    const response = await request(app.getHttpServer())
      .post("/gangs")
      .send({
        playerId,
        name: "Night Owls"
      })
      .expect(201);

    expect(response.body).toEqual({
      id: gangId,
      name: "Night Owls",
      createdAt: "2026-03-16T22:00:00.000Z",
      createdByPlayerId: playerId,
      memberCount: 1
    });
  });

  it("joins a gang", async () => {
    const playerId = crypto.randomUUID();
    const gangId = crypto.randomUUID();
    vi.mocked(gangsService.joinGang).mockResolvedValueOnce({
      id: crypto.randomUUID(),
      gangId,
      playerId,
      displayName: "Nina Vale",
      role: "member",
      joinedAt: new Date("2026-03-16T22:05:00.000Z")
    });

    const response = await request(app.getHttpServer())
      .post(`/gangs/${gangId}/join`)
      .send({ playerId })
      .expect(201);

    expect(response.body).toMatchObject({
      gangId,
      playerId,
      displayName: "Nina Vale",
      role: "member"
    });
  });

  it("invites a player to a gang", async () => {
    const gangId = crypto.randomUUID();
    const playerId = crypto.randomUUID();
    const invitedByPlayerId = crypto.randomUUID();
    vi.mocked(gangsService.invitePlayer).mockResolvedValueOnce({
      id: crypto.randomUUID(),
      gangId,
      gangName: "Night Owls",
      invitedPlayerId: playerId,
      invitedPlayerDisplayName: "Nina Vale",
      invitedByPlayerId,
      invitedByPlayerDisplayName: "Don Luca",
      status: "pending",
      createdAt: new Date("2026-03-17T00:20:00.000Z")
    });

    const response = await request(app.getHttpServer())
      .post(`/gangs/${gangId}/invite/${playerId}`)
      .send({ invitedByPlayerId })
      .expect(201);

    expect(response.body).toMatchObject({
      gangId,
      gangName: "Night Owls",
      invitedPlayerId: playerId,
      invitedByPlayerId,
      status: "pending"
    });
  });

  it("leaves a gang", async () => {
    const playerId = crypto.randomUUID();
    const gangId = crypto.randomUUID();
    vi.mocked(gangsService.leaveGang).mockResolvedValueOnce({
      gangId,
      playerId,
      role: "member",
      gangDeleted: false
    });

    const response = await request(app.getHttpServer())
      .post(`/gangs/${gangId}/leave`)
      .send({ playerId })
      .expect(201);

    expect(response.body).toEqual({
      gangId,
      playerId,
      role: "member",
      gangDeleted: false
    });
  });

  it("gets a gang summary", async () => {
    const gangId = crypto.randomUUID();
    vi.mocked(gangsService.getGangById).mockResolvedValueOnce({
      id: gangId,
      name: "Night Owls",
      createdAt: new Date("2026-03-16T22:00:00.000Z"),
      createdByPlayerId: crypto.randomUUID(),
      memberCount: 2
    });

    const response = await request(app.getHttpServer())
      .get(`/gangs/${gangId}`)
      .expect(200);

    expect(response.body.memberCount).toBe(2);
  });

  it("lists gang members", async () => {
    const gangId = crypto.randomUUID();
    vi.mocked(gangsService.listGangMembers).mockResolvedValueOnce([
      {
        id: crypto.randomUUID(),
        gangId,
        playerId: crypto.randomUUID(),
        displayName: "Don Luca",
        role: "leader",
        joinedAt: new Date("2026-03-16T22:00:00.000Z")
      }
    ]);

    const response = await request(app.getHttpServer())
      .get(`/gangs/${gangId}/members`)
      .expect(200);

    expect(response.body).toEqual([
      {
        id: expect.any(String),
        gangId,
        playerId: expect.any(String),
        displayName: "Don Luca",
        role: "leader",
        joinedAt: "2026-03-16T22:00:00.000Z"
      }
    ]);
  });

  it("lists gang invites", async () => {
    const gangId = crypto.randomUUID();
    vi.mocked(gangsService.listGangInvites).mockResolvedValueOnce([
      {
        id: crypto.randomUUID(),
        gangId,
        gangName: "Night Owls",
        invitedPlayerId: crypto.randomUUID(),
        invitedPlayerDisplayName: "Nina Vale",
        invitedByPlayerId: crypto.randomUUID(),
        invitedByPlayerDisplayName: "Don Luca",
        status: "pending",
        createdAt: new Date("2026-03-17T00:20:00.000Z")
      }
    ]);

    const response = await request(app.getHttpServer())
      .get(`/gangs/${gangId}/invites`)
      .expect(200);

    expect(response.body[0].status).toBe("pending");
  });

  it("accepts a gang invite", async () => {
    const inviteId = crypto.randomUUID();
    const playerId = crypto.randomUUID();
    vi.mocked(gangsService.acceptInvite).mockResolvedValueOnce({
      inviteId,
      status: "accepted",
      membership: {
        id: crypto.randomUUID(),
        gangId: crypto.randomUUID(),
        playerId,
        displayName: "Nina Vale",
        role: "member",
        joinedAt: new Date("2026-03-17T00:25:00.000Z")
      }
    });

    const response = await request(app.getHttpServer())
      .post(`/gang-invites/${inviteId}/accept`)
      .send({ playerId })
      .expect(201);

    expect(response.body.status).toBe("accepted");
    expect(response.body.membership.playerId).toBe(playerId);
  });

  it("declines a gang invite", async () => {
    const inviteId = crypto.randomUUID();
    const playerId = crypto.randomUUID();
    vi.mocked(gangsService.declineInvite).mockResolvedValueOnce({
      inviteId,
      status: "declined",
      membership: null
    });

    const response = await request(app.getHttpServer())
      .post(`/gang-invites/${inviteId}/decline`)
      .send({ playerId })
      .expect(201);

    expect(response.body).toEqual({
      inviteId,
      status: "declined",
      membership: null
    });
  });

  it("lists player gang invites", async () => {
    const playerId = crypto.randomUUID();
    vi.mocked(gangsService.listPlayerGangInvites).mockResolvedValueOnce([
      {
        id: crypto.randomUUID(),
        gangId: crypto.randomUUID(),
        gangName: "Night Owls",
        invitedPlayerId: playerId,
        invitedPlayerDisplayName: "Nina Vale",
        invitedByPlayerId: crypto.randomUUID(),
        invitedByPlayerDisplayName: "Don Luca",
        status: "pending",
        createdAt: new Date("2026-03-17T00:20:00.000Z")
      }
    ]);

    const response = await request(app.getHttpServer())
      .get(`/players/${playerId}/gang-invites`)
      .expect(200);

    expect(response.body[0].invitedPlayerId).toBe(playerId);
  });
});
