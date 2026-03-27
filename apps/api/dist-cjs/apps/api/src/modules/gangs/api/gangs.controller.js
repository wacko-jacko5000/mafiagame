"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerGangMembershipController = exports.PlayerGangInvitesController = exports.GangInvitesController = exports.GangsController = void 0;
const common_1 = require("@nestjs/common");
const gangs_service_1 = require("../application/gangs.service");
const gangs_presenter_1 = require("./gangs.presenter");
let GangsController = class GangsController {
    gangsService;
    constructor(gangsService) {
        this.gangsService = gangsService;
    }
    async createGang(playerId, name) {
        const gang = await this.gangsService.createGang({
            playerId,
            name
        });
        return (0, gangs_presenter_1.toGangResponseBody)(gang);
    }
    async joinGang(gangId, playerId) {
        const membership = await this.gangsService.joinGang({
            gangId,
            playerId
        });
        return (0, gangs_presenter_1.toGangMemberResponseBody)(membership);
    }
    async leaveGang(gangId, playerId) {
        const result = await this.gangsService.leaveGang({
            gangId,
            playerId
        });
        return (0, gangs_presenter_1.toLeaveGangResponseBody)(result);
    }
    async invitePlayer(gangId, invitedPlayerId, invitedByPlayerId) {
        const invite = await this.gangsService.invitePlayer({
            gangId,
            invitedPlayerId,
            invitedByPlayerId
        });
        return (0, gangs_presenter_1.toGangInviteResponseBody)(invite);
    }
    async getGangById(gangId) {
        const gang = await this.gangsService.getGangById(gangId);
        return (0, gangs_presenter_1.toGangResponseBody)(gang);
    }
    async listGangMembers(gangId) {
        const members = await this.gangsService.listGangMembers(gangId);
        return members.map(gangs_presenter_1.toGangMemberResponseBody);
    }
    async listGangInvites(gangId) {
        const invites = await this.gangsService.listGangInvites(gangId);
        return invites.map(gangs_presenter_1.toGangInviteResponseBody);
    }
};
exports.GangsController = GangsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)("playerId", common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)("name")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], GangsController.prototype, "createGang", null);
__decorate([
    (0, common_1.Post)(":gangId/join"),
    __param(0, (0, common_1.Param)("gangId", common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)("playerId", common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], GangsController.prototype, "joinGang", null);
__decorate([
    (0, common_1.Post)(":gangId/leave"),
    __param(0, (0, common_1.Param)("gangId", common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)("playerId", common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], GangsController.prototype, "leaveGang", null);
__decorate([
    (0, common_1.Post)(":gangId/invite/:playerId"),
    __param(0, (0, common_1.Param)("gangId", common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)("playerId", common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)("invitedByPlayerId", common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], GangsController.prototype, "invitePlayer", null);
__decorate([
    (0, common_1.Get)(":gangId"),
    __param(0, (0, common_1.Param)("gangId", common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GangsController.prototype, "getGangById", null);
__decorate([
    (0, common_1.Get)(":gangId/members"),
    __param(0, (0, common_1.Param)("gangId", common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GangsController.prototype, "listGangMembers", null);
__decorate([
    (0, common_1.Get)(":gangId/invites"),
    __param(0, (0, common_1.Param)("gangId", common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GangsController.prototype, "listGangInvites", null);
exports.GangsController = GangsController = __decorate([
    (0, common_1.Controller)("gangs"),
    __param(0, (0, common_1.Inject)(gangs_service_1.GangsService)),
    __metadata("design:paramtypes", [gangs_service_1.GangsService])
], GangsController);
let GangInvitesController = class GangInvitesController {
    gangsService;
    constructor(gangsService) {
        this.gangsService = gangsService;
    }
    async acceptInvite(inviteId, playerId) {
        const result = await this.gangsService.acceptInvite({
            inviteId,
            playerId
        });
        return (0, gangs_presenter_1.toGangInviteDecisionResponseBody)(result);
    }
    async declineInvite(inviteId, playerId) {
        const result = await this.gangsService.declineInvite({
            inviteId,
            playerId
        });
        return (0, gangs_presenter_1.toGangInviteDecisionResponseBody)(result);
    }
};
exports.GangInvitesController = GangInvitesController;
__decorate([
    (0, common_1.Post)(":inviteId/accept"),
    __param(0, (0, common_1.Param)("inviteId", common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)("playerId", common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], GangInvitesController.prototype, "acceptInvite", null);
__decorate([
    (0, common_1.Post)(":inviteId/decline"),
    __param(0, (0, common_1.Param)("inviteId", common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)("playerId", common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], GangInvitesController.prototype, "declineInvite", null);
exports.GangInvitesController = GangInvitesController = __decorate([
    (0, common_1.Controller)("gang-invites"),
    __param(0, (0, common_1.Inject)(gangs_service_1.GangsService)),
    __metadata("design:paramtypes", [gangs_service_1.GangsService])
], GangInvitesController);
let PlayerGangInvitesController = class PlayerGangInvitesController {
    gangsService;
    constructor(gangsService) {
        this.gangsService = gangsService;
    }
    async listPlayerGangInvites(playerId) {
        const invites = await this.gangsService.listPlayerGangInvites(playerId);
        return invites.map(gangs_presenter_1.toGangInviteResponseBody);
    }
};
exports.PlayerGangInvitesController = PlayerGangInvitesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)("playerId", common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PlayerGangInvitesController.prototype, "listPlayerGangInvites", null);
exports.PlayerGangInvitesController = PlayerGangInvitesController = __decorate([
    (0, common_1.Controller)("players/:playerId/gang-invites"),
    __param(0, (0, common_1.Inject)(gangs_service_1.GangsService)),
    __metadata("design:paramtypes", [gangs_service_1.GangsService])
], PlayerGangInvitesController);
let PlayerGangMembershipController = class PlayerGangMembershipController {
    gangsService;
    constructor(gangsService) {
        this.gangsService = gangsService;
    }
    async getPlayerGangMembership(playerId) {
        const membership = await this.gangsService.getPlayerGangMembership(playerId);
        return membership ? (0, gangs_presenter_1.toPlayerGangMembershipResponseBody)(membership) : null;
    }
};
exports.PlayerGangMembershipController = PlayerGangMembershipController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)("playerId", common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PlayerGangMembershipController.prototype, "getPlayerGangMembership", null);
exports.PlayerGangMembershipController = PlayerGangMembershipController = __decorate([
    (0, common_1.Controller)("players/:playerId/gang-membership"),
    __param(0, (0, common_1.Inject)(gangs_service_1.GangsService)),
    __metadata("design:paramtypes", [gangs_service_1.GangsService])
], PlayerGangMembershipController);
