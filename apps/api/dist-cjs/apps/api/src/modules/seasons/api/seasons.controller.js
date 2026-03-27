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
exports.AdminSeasonsController = exports.SeasonsController = void 0;
const common_1 = require("@nestjs/common");
const admin_api_key_guard_1 = require("../../admin-tools/api/admin-api-key.guard");
const seasons_service_1 = require("../application/seasons.service");
const create_season_request_1 = require("./create-season-request");
const seasons_presenter_1 = require("./seasons.presenter");
let SeasonsController = class SeasonsController {
    seasonsService;
    constructor(seasonsService) {
        this.seasonsService = seasonsService;
    }
    async listSeasons() {
        const seasons = await this.seasonsService.listSeasons();
        return seasons.map(seasons_presenter_1.toSeasonResponseBody);
    }
    async getCurrentSeason() {
        const season = await this.seasonsService.getCurrentSeason();
        return {
            season: season ? (0, seasons_presenter_1.toSeasonResponseBody)(season) : null
        };
    }
    async getSeasonById(seasonId) {
        const season = await this.seasonsService.getSeasonById(seasonId);
        return (0, seasons_presenter_1.toSeasonResponseBody)(season);
    }
};
exports.SeasonsController = SeasonsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SeasonsController.prototype, "listSeasons", null);
__decorate([
    (0, common_1.Get)("current"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SeasonsController.prototype, "getCurrentSeason", null);
__decorate([
    (0, common_1.Get)(":seasonId"),
    __param(0, (0, common_1.Param)("seasonId", common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SeasonsController.prototype, "getSeasonById", null);
exports.SeasonsController = SeasonsController = __decorate([
    (0, common_1.Controller)("seasons"),
    __param(0, (0, common_1.Inject)(seasons_service_1.SeasonsService)),
    __metadata("design:paramtypes", [seasons_service_1.SeasonsService])
], SeasonsController);
let AdminSeasonsController = class AdminSeasonsController {
    seasonsService;
    constructor(seasonsService) {
        this.seasonsService = seasonsService;
    }
    async createSeason(body) {
        const season = await this.seasonsService.createSeason((0, create_season_request_1.parseCreateSeasonRequest)(body));
        return (0, seasons_presenter_1.toSeasonResponseBody)(season);
    }
    async activateSeason(seasonId) {
        const season = await this.seasonsService.activateSeason(seasonId);
        return (0, seasons_presenter_1.toSeasonResponseBody)(season);
    }
    async deactivateSeason(seasonId) {
        const season = await this.seasonsService.deactivateSeason(seasonId);
        return (0, seasons_presenter_1.toSeasonResponseBody)(season);
    }
};
exports.AdminSeasonsController = AdminSeasonsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminSeasonsController.prototype, "createSeason", null);
__decorate([
    (0, common_1.Post)(":seasonId/activate"),
    __param(0, (0, common_1.Param)("seasonId", common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminSeasonsController.prototype, "activateSeason", null);
__decorate([
    (0, common_1.Post)(":seasonId/deactivate"),
    __param(0, (0, common_1.Param)("seasonId", common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminSeasonsController.prototype, "deactivateSeason", null);
exports.AdminSeasonsController = AdminSeasonsController = __decorate([
    (0, common_1.Controller)("admin/seasons"),
    (0, common_1.UseGuards)(admin_api_key_guard_1.AdminApiKeyGuard),
    __param(0, (0, common_1.Inject)(seasons_service_1.SeasonsService)),
    __metadata("design:paramtypes", [seasons_service_1.SeasonsService])
], AdminSeasonsController);
