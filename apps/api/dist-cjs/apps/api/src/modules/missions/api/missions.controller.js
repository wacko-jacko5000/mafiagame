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
exports.MissionsController = void 0;
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("../../auth/api/auth.guard");
const current_actor_decorator_1 = require("../../auth/api/current-actor.decorator");
const current_player_utils_1 = require("../../auth/api/current-player.utils");
const missions_service_1 = require("../application/missions.service");
const missions_presenter_1 = require("./missions.presenter");
let MissionsController = class MissionsController {
    missionsService;
    constructor(missionsService) {
        this.missionsService = missionsService;
    }
    getMissions() {
        return this.missionsService.listMissions().map(missions_presenter_1.toMissionDefinitionResponseBody);
    }
    async getPlayerMissions(playerId) {
        const missions = await this.missionsService.listPlayerMissions(playerId);
        return missions.map(missions_presenter_1.toPlayerMissionResponseBody);
    }
    async getCurrentPlayerMissions(actor) {
        const missions = await this.missionsService.listPlayerMissions((0, current_player_utils_1.requireCurrentPlayerId)(actor));
        return missions.map(missions_presenter_1.toPlayerMissionResponseBody);
    }
    async acceptMission(playerId, missionId) {
        const mission = await this.missionsService.acceptMission(playerId, missionId);
        return (0, missions_presenter_1.toPlayerMissionResponseBody)(mission);
    }
    async acceptCurrentPlayerMission(missionId, actor) {
        const mission = await this.missionsService.acceptMission((0, current_player_utils_1.requireCurrentPlayerId)(actor), missionId);
        return (0, missions_presenter_1.toPlayerMissionResponseBody)(mission);
    }
    async completeMission(playerId, missionId) {
        const result = await this.missionsService.completeMission(playerId, missionId);
        return (0, missions_presenter_1.toMissionCompletionResponseBody)(result);
    }
    async completeCurrentPlayerMission(missionId, actor) {
        const result = await this.missionsService.completeMission((0, current_player_utils_1.requireCurrentPlayerId)(actor), missionId);
        return (0, missions_presenter_1.toMissionCompletionResponseBody)(result);
    }
};
exports.MissionsController = MissionsController;
__decorate([
    (0, common_1.Get)("missions"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Array)
], MissionsController.prototype, "getMissions", null);
__decorate([
    (0, common_1.Get)("players/:playerId/missions"),
    __param(0, (0, common_1.Param)("playerId", common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MissionsController.prototype, "getPlayerMissions", null);
__decorate([
    (0, common_1.Get)("me/missions"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, current_actor_decorator_1.CurrentActor)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MissionsController.prototype, "getCurrentPlayerMissions", null);
__decorate([
    (0, common_1.Post)("players/:playerId/missions/:missionId/accept"),
    __param(0, (0, common_1.Param)("playerId", common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)("missionId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MissionsController.prototype, "acceptMission", null);
__decorate([
    (0, common_1.Post)("me/missions/:missionId/accept"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Param)("missionId")),
    __param(1, (0, current_actor_decorator_1.CurrentActor)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MissionsController.prototype, "acceptCurrentPlayerMission", null);
__decorate([
    (0, common_1.Post)("players/:playerId/missions/:missionId/complete"),
    __param(0, (0, common_1.Param)("playerId", common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)("missionId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MissionsController.prototype, "completeMission", null);
__decorate([
    (0, common_1.Post)("me/missions/:missionId/complete"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Param)("missionId")),
    __param(1, (0, current_actor_decorator_1.CurrentActor)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MissionsController.prototype, "completeCurrentPlayerMission", null);
exports.MissionsController = MissionsController = __decorate([
    (0, common_1.Controller)(),
    __param(0, (0, common_1.Inject)(missions_service_1.MissionsService)),
    __metadata("design:paramtypes", [missions_service_1.MissionsService])
], MissionsController);
