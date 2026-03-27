"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const supertest_1 = __importDefault(require("supertest"));
const vitest_1 = require("vitest");
const gangs_service_1 = require("../application/gangs.service");
const gangs_controller_1 = require("./gangs.controller");
(0, vitest_1.describe)("GangsController", () => {
    let app;
    const gangsService = {
        acceptInvite: vitest_1.vi.fn(),
        createGang: vitest_1.vi.fn(),
        declineInvite: vitest_1.vi.fn(),
        getGangById: vitest_1.vi.fn(),
        invitePlayer: vitest_1.vi.fn(),
        joinGang: vitest_1.vi.fn(),
        leaveGang: vitest_1.vi.fn(),
        getPlayerGangMembership: vitest_1.vi.fn(),
        listGangInvites: vitest_1.vi.fn(),
        listGangMembers: vitest_1.vi.fn(),
        listPlayerGangInvites: vitest_1.vi.fn()
    };
    (0, vitest_1.beforeAll)(async () => {
        const moduleRef = await testing_1.Test.createTestingModule({
            controllers: [
                gangs_controller_1.GangsController,
                gangs_controller_1.GangInvitesController,
                gangs_controller_1.PlayerGangInvitesController,
                gangs_controller_1.PlayerGangMembershipController
            ],
            providers: [
                {
                    provide: gangs_service_1.GangsService,
                    useValue: gangsService
                }
            ]
        }).compile();
        app = moduleRef.createNestApplication();
        await app.init();
    });
    (0, vitest_1.afterAll)(async () => {
        if (app) {
            await app.close();
        }
    });
    (0, vitest_1.it)("creates a gang", async () => {
        const playerId = crypto.randomUUID();
        const gangId = crypto.randomUUID();
        vitest_1.vi.mocked(gangsService.createGang).mockResolvedValueOnce({
            id: gangId,
            name: "Night Owls",
            createdAt: new Date("2026-03-16T22:00:00.000Z"),
            createdByPlayerId: playerId,
            memberCount: 1
        });
        const response = await (0, supertest_1.default)(app.getHttpServer())
            .post("/gangs")
            .send({
            playerId,
            name: "Night Owls"
        })
            .expect(201);
        (0, vitest_1.expect)(response.body).toEqual({
            id: gangId,
            name: "Night Owls",
            createdAt: "2026-03-16T22:00:00.000Z",
            createdByPlayerId: playerId,
            memberCount: 1
        });
    });
    (0, vitest_1.it)("joins a gang", async () => {
        const playerId = crypto.randomUUID();
        const gangId = crypto.randomUUID();
        vitest_1.vi.mocked(gangsService.joinGang).mockResolvedValueOnce({
            id: crypto.randomUUID(),
            gangId,
            playerId,
            displayName: "Nina Vale",
            role: "member",
            joinedAt: new Date("2026-03-16T22:05:00.000Z")
        });
        const response = await (0, supertest_1.default)(app.getHttpServer())
            .post(`/gangs/${gangId}/join`)
            .send({ playerId })
            .expect(201);
        (0, vitest_1.expect)(response.body).toMatchObject({
            gangId,
            playerId,
            displayName: "Nina Vale",
            role: "member"
        });
    });
    (0, vitest_1.it)("invites a player to a gang", async () => {
        const gangId = crypto.randomUUID();
        const playerId = crypto.randomUUID();
        const invitedByPlayerId = crypto.randomUUID();
        vitest_1.vi.mocked(gangsService.invitePlayer).mockResolvedValueOnce({
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
        const response = await (0, supertest_1.default)(app.getHttpServer())
            .post(`/gangs/${gangId}/invite/${playerId}`)
            .send({ invitedByPlayerId })
            .expect(201);
        (0, vitest_1.expect)(response.body).toMatchObject({
            gangId,
            gangName: "Night Owls",
            invitedPlayerId: playerId,
            invitedByPlayerId,
            status: "pending"
        });
    });
    (0, vitest_1.it)("leaves a gang", async () => {
        const playerId = crypto.randomUUID();
        const gangId = crypto.randomUUID();
        vitest_1.vi.mocked(gangsService.leaveGang).mockResolvedValueOnce({
            gangId,
            playerId,
            role: "member",
            gangDeleted: false
        });
        const response = await (0, supertest_1.default)(app.getHttpServer())
            .post(`/gangs/${gangId}/leave`)
            .send({ playerId })
            .expect(201);
        (0, vitest_1.expect)(response.body).toEqual({
            gangId,
            playerId,
            role: "member",
            gangDeleted: false
        });
    });
    (0, vitest_1.it)("gets a gang summary", async () => {
        const gangId = crypto.randomUUID();
        vitest_1.vi.mocked(gangsService.getGangById).mockResolvedValueOnce({
            id: gangId,
            name: "Night Owls",
            createdAt: new Date("2026-03-16T22:00:00.000Z"),
            createdByPlayerId: crypto.randomUUID(),
            memberCount: 2
        });
        const response = await (0, supertest_1.default)(app.getHttpServer())
            .get(`/gangs/${gangId}`)
            .expect(200);
        (0, vitest_1.expect)(response.body.memberCount).toBe(2);
    });
    (0, vitest_1.it)("lists gang members", async () => {
        const gangId = crypto.randomUUID();
        vitest_1.vi.mocked(gangsService.listGangMembers).mockResolvedValueOnce([
            {
                id: crypto.randomUUID(),
                gangId,
                playerId: crypto.randomUUID(),
                displayName: "Don Luca",
                role: "leader",
                joinedAt: new Date("2026-03-16T22:00:00.000Z")
            }
        ]);
        const response = await (0, supertest_1.default)(app.getHttpServer())
            .get(`/gangs/${gangId}/members`)
            .expect(200);
        (0, vitest_1.expect)(response.body).toEqual([
            {
                id: vitest_1.expect.any(String),
                gangId,
                playerId: vitest_1.expect.any(String),
                displayName: "Don Luca",
                role: "leader",
                joinedAt: "2026-03-16T22:00:00.000Z"
            }
        ]);
    });
    (0, vitest_1.it)("lists gang invites", async () => {
        const gangId = crypto.randomUUID();
        vitest_1.vi.mocked(gangsService.listGangInvites).mockResolvedValueOnce([
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
        const response = await (0, supertest_1.default)(app.getHttpServer())
            .get(`/gangs/${gangId}/invites`)
            .expect(200);
        (0, vitest_1.expect)(response.body[0].status).toBe("pending");
    });
    (0, vitest_1.it)("accepts a gang invite", async () => {
        const inviteId = crypto.randomUUID();
        const playerId = crypto.randomUUID();
        vitest_1.vi.mocked(gangsService.acceptInvite).mockResolvedValueOnce({
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
        const response = await (0, supertest_1.default)(app.getHttpServer())
            .post(`/gang-invites/${inviteId}/accept`)
            .send({ playerId })
            .expect(201);
        (0, vitest_1.expect)(response.body.status).toBe("accepted");
        (0, vitest_1.expect)(response.body.membership.playerId).toBe(playerId);
    });
    (0, vitest_1.it)("declines a gang invite", async () => {
        const inviteId = crypto.randomUUID();
        const playerId = crypto.randomUUID();
        vitest_1.vi.mocked(gangsService.declineInvite).mockResolvedValueOnce({
            inviteId,
            status: "declined",
            membership: null
        });
        const response = await (0, supertest_1.default)(app.getHttpServer())
            .post(`/gang-invites/${inviteId}/decline`)
            .send({ playerId })
            .expect(201);
        (0, vitest_1.expect)(response.body).toEqual({
            inviteId,
            status: "declined",
            membership: null
        });
    });
    (0, vitest_1.it)("lists player gang invites", async () => {
        const playerId = crypto.randomUUID();
        vitest_1.vi.mocked(gangsService.listPlayerGangInvites).mockResolvedValueOnce([
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
        const response = await (0, supertest_1.default)(app.getHttpServer())
            .get(`/players/${playerId}/gang-invites`)
            .expect(200);
        (0, vitest_1.expect)(response.body[0].invitedPlayerId).toBe(playerId);
    });
    (0, vitest_1.it)("gets the current player gang membership", async () => {
        const playerId = crypto.randomUUID();
        const gangId = crypto.randomUUID();
        vitest_1.vi.mocked(gangsService.getPlayerGangMembership).mockResolvedValueOnce({
            membership: {
                id: crypto.randomUUID(),
                gangId,
                playerId,
                displayName: "Nina Vale",
                role: "leader",
                joinedAt: new Date("2026-03-17T00:25:00.000Z")
            },
            gang: {
                id: gangId,
                name: "Night Owls",
                createdAt: new Date("2026-03-16T22:00:00.000Z"),
                createdByPlayerId: playerId,
                memberCount: 3
            }
        });
        const response = await (0, supertest_1.default)(app.getHttpServer())
            .get(`/players/${playerId}/gang-membership`)
            .expect(200);
        (0, vitest_1.expect)(response.body).toEqual({
            membership: {
                id: vitest_1.expect.any(String),
                gangId,
                playerId,
                displayName: "Nina Vale",
                role: "leader",
                joinedAt: "2026-03-17T00:25:00.000Z"
            },
            gang: {
                id: gangId,
                name: "Night Owls",
                createdAt: "2026-03-16T22:00:00.000Z",
                createdByPlayerId: playerId,
                memberCount: 3
            }
        });
    });
});
