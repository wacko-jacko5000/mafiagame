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
exports.LeaderboardController = void 0;
const common_1 = require("@nestjs/common");
const leaderboard_service_1 = require("../application/leaderboard.service");
const leaderboard_presenter_1 = require("./leaderboard.presenter");
let LeaderboardController = class LeaderboardController {
    leaderboardService;
    constructor(leaderboardService) {
        this.leaderboardService = leaderboardService;
    }
    getLeaderboards() {
        return this.leaderboardService
            .listLeaderboards()
            .map(leaderboard_presenter_1.toLeaderboardDefinitionResponseBody);
    }
    async getLeaderboard(leaderboardId, limit) {
        const parsedLimit = parseOptionalPositiveInteger(limit);
        const leaderboard = await this.leaderboardService.getLeaderboard(leaderboardId, parsedLimit);
        return (0, leaderboard_presenter_1.toLeaderboardResponseBody)(leaderboard);
    }
};
exports.LeaderboardController = LeaderboardController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Array)
], LeaderboardController.prototype, "getLeaderboards", null);
__decorate([
    (0, common_1.Get)(":leaderboardId"),
    __param(0, (0, common_1.Param)("leaderboardId")),
    __param(1, (0, common_1.Query)("limit")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], LeaderboardController.prototype, "getLeaderboard", null);
exports.LeaderboardController = LeaderboardController = __decorate([
    (0, common_1.Controller)("leaderboards"),
    __param(0, (0, common_1.Inject)(leaderboard_service_1.LeaderboardService)),
    __metadata("design:paramtypes", [leaderboard_service_1.LeaderboardService])
], LeaderboardController);
function parseOptionalPositiveInteger(value) {
    if (value === undefined) {
        return undefined;
    }
    const parsedValue = Number(value);
    if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
        throw new common_1.BadRequestException("Leaderboard limit must be a positive integer.");
    }
    return parsedValue;
}
