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
exports.AchievementsController = void 0;
const common_1 = require("@nestjs/common");
const achievements_service_1 = require("../application/achievements.service");
const achievements_presenter_1 = require("./achievements.presenter");
let AchievementsController = class AchievementsController {
    achievementsService;
    constructor(achievementsService) {
        this.achievementsService = achievementsService;
    }
    getAchievements() {
        return this.achievementsService
            .listAchievements()
            .map(achievements_presenter_1.toAchievementDefinitionResponseBody);
    }
    async getPlayerAchievements(playerId) {
        const achievements = await this.achievementsService.listPlayerAchievements(playerId);
        return achievements.map(achievements_presenter_1.toPlayerAchievementResponseBody);
    }
};
exports.AchievementsController = AchievementsController;
__decorate([
    (0, common_1.Get)("achievements"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Array)
], AchievementsController.prototype, "getAchievements", null);
__decorate([
    (0, common_1.Get)("players/:playerId/achievements"),
    __param(0, (0, common_1.Param)("playerId", common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AchievementsController.prototype, "getPlayerAchievements", null);
exports.AchievementsController = AchievementsController = __decorate([
    (0, common_1.Controller)(),
    __param(0, (0, common_1.Inject)(achievements_service_1.AchievementsService)),
    __metadata("design:paramtypes", [achievements_service_1.AchievementsService])
], AchievementsController);
