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
exports.PlayerActivityController = void 0;
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("../../auth/api/auth.guard");
const current_actor_decorator_1 = require("../../auth/api/current-actor.decorator");
const current_player_utils_1 = require("../../auth/api/current-player.utils");
const player_activity_service_1 = require("../application/player-activity.service");
const player_activity_presenter_1 = require("./player-activity.presenter");
let PlayerActivityController = class PlayerActivityController {
    playerActivityService;
    constructor(playerActivityService) {
        this.playerActivityService = playerActivityService;
    }
    async listPlayerActivity(playerId, limit) {
        const activities = await this.playerActivityService.listPlayerActivity(playerId, parseOptionalPositiveInteger(limit));
        return activities.map(player_activity_presenter_1.toPlayerActivityResponseBody);
    }
    async listCurrentPlayerActivity(actor, limit) {
        const activities = await this.playerActivityService.listPlayerActivity((0, current_player_utils_1.requireCurrentPlayerId)(actor), parseOptionalPositiveInteger(limit));
        return activities.map(player_activity_presenter_1.toPlayerActivityResponseBody);
    }
    async markActivityRead(playerId, activityId) {
        const activity = await this.playerActivityService.markActivityRead(playerId, activityId);
        return (0, player_activity_presenter_1.toPlayerActivityResponseBody)(activity);
    }
    async markCurrentPlayerActivityRead(activityId, actor) {
        const activity = await this.playerActivityService.markActivityRead((0, current_player_utils_1.requireCurrentPlayerId)(actor), activityId);
        return (0, player_activity_presenter_1.toPlayerActivityResponseBody)(activity);
    }
};
exports.PlayerActivityController = PlayerActivityController;
__decorate([
    (0, common_1.Get)("players/:playerId/activity"),
    __param(0, (0, common_1.Param)("playerId", common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)("limit")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PlayerActivityController.prototype, "listPlayerActivity", null);
__decorate([
    (0, common_1.Get)("me/activity"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, current_actor_decorator_1.CurrentActor)()),
    __param(1, (0, common_1.Query)("limit")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PlayerActivityController.prototype, "listCurrentPlayerActivity", null);
__decorate([
    (0, common_1.Post)("players/:playerId/activity/:activityId/read"),
    __param(0, (0, common_1.Param)("playerId", common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)("activityId", common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PlayerActivityController.prototype, "markActivityRead", null);
__decorate([
    (0, common_1.Post)("me/activity/:activityId/read"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Param)("activityId", common_1.ParseUUIDPipe)),
    __param(1, (0, current_actor_decorator_1.CurrentActor)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PlayerActivityController.prototype, "markCurrentPlayerActivityRead", null);
exports.PlayerActivityController = PlayerActivityController = __decorate([
    (0, common_1.Controller)(),
    __param(0, (0, common_1.Inject)(player_activity_service_1.PlayerActivityService)),
    __metadata("design:paramtypes", [player_activity_service_1.PlayerActivityService])
], PlayerActivityController);
function parseOptionalPositiveInteger(value) {
    if (value === undefined) {
        return undefined;
    }
    const parsedValue = Number(value);
    if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
        throw new common_1.BadRequestException("Activity limit must be a positive integer.");
    }
    return parsedValue;
}
