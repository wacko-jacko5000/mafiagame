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
exports.DistrictWarsController = exports.TerritoryController = void 0;
const common_1 = require("@nestjs/common");
const territory_service_1 = require("../application/territory.service");
const territory_presenter_1 = require("./territory.presenter");
let TerritoryController = class TerritoryController {
    territoryService;
    constructor(territoryService) {
        this.territoryService = territoryService;
    }
    async listDistricts() {
        const districts = await this.territoryService.listDistricts();
        return districts.map(territory_presenter_1.toDistrictResponseBody);
    }
    async getDistrictById(districtId) {
        const district = await this.territoryService.getDistrictById(districtId);
        return (0, territory_presenter_1.toDistrictResponseBody)(district);
    }
    async claimDistrict(districtId, playerId, gangId) {
        const district = await this.territoryService.claimDistrict({
            districtId,
            playerId,
            gangId
        });
        return (0, territory_presenter_1.toDistrictResponseBody)(district);
    }
    async claimDistrictPayout(districtId, playerId, gangId) {
        const result = await this.territoryService.claimDistrictPayout({
            districtId,
            playerId,
            gangId
        });
        return (0, territory_presenter_1.toDistrictPayoutClaimResponseBody)(result);
    }
    async startWar(districtId, playerId, attackerGangId) {
        const war = await this.territoryService.startWar({
            districtId,
            playerId,
            attackerGangId
        });
        return (0, territory_presenter_1.toDistrictWarResponseBody)(war);
    }
    async getDistrictWar(districtId) {
        const war = await this.territoryService.getDistrictWarForDistrict(districtId);
        return war ? (0, territory_presenter_1.toDistrictWarResponseBody)(war) : null;
    }
};
exports.TerritoryController = TerritoryController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TerritoryController.prototype, "listDistricts", null);
__decorate([
    (0, common_1.Get)(":districtId"),
    __param(0, (0, common_1.Param)("districtId", common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TerritoryController.prototype, "getDistrictById", null);
__decorate([
    (0, common_1.Post)(":districtId/claim"),
    __param(0, (0, common_1.Param)("districtId", common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)("playerId", common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)("gangId", common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], TerritoryController.prototype, "claimDistrict", null);
__decorate([
    (0, common_1.Post)(":districtId/payout/claim"),
    __param(0, (0, common_1.Param)("districtId", common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)("playerId", common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)("gangId", common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], TerritoryController.prototype, "claimDistrictPayout", null);
__decorate([
    (0, common_1.Post)(":districtId/war/start"),
    __param(0, (0, common_1.Param)("districtId", common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)("playerId", common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)("attackerGangId", common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], TerritoryController.prototype, "startWar", null);
__decorate([
    (0, common_1.Get)(":districtId/war"),
    __param(0, (0, common_1.Param)("districtId", common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TerritoryController.prototype, "getDistrictWar", null);
exports.TerritoryController = TerritoryController = __decorate([
    (0, common_1.Controller)("districts"),
    __param(0, (0, common_1.Inject)(territory_service_1.TerritoryService)),
    __metadata("design:paramtypes", [territory_service_1.TerritoryService])
], TerritoryController);
let DistrictWarsController = class DistrictWarsController {
    territoryService;
    constructor(territoryService) {
        this.territoryService = territoryService;
    }
    async getWarById(warId) {
        const war = await this.territoryService.getDistrictWarById(warId);
        return (0, territory_presenter_1.toDistrictWarResponseBody)(war);
    }
    async resolveWar(warId, winningGangId) {
        const result = await this.territoryService.resolveWar({
            warId,
            winningGangId
        });
        return (0, territory_presenter_1.toResolveDistrictWarResponseBody)(result);
    }
};
exports.DistrictWarsController = DistrictWarsController;
__decorate([
    (0, common_1.Get)(":warId"),
    __param(0, (0, common_1.Param)("warId", common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DistrictWarsController.prototype, "getWarById", null);
__decorate([
    (0, common_1.Post)(":warId/resolve"),
    __param(0, (0, common_1.Param)("warId", common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)("winningGangId", common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DistrictWarsController.prototype, "resolveWar", null);
exports.DistrictWarsController = DistrictWarsController = __decorate([
    (0, common_1.Controller)("district-wars"),
    __param(0, (0, common_1.Inject)(territory_service_1.TerritoryService)),
    __metadata("design:paramtypes", [territory_service_1.TerritoryService])
], DistrictWarsController);
