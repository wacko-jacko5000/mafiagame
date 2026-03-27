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
exports.HospitalController = void 0;
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("../../auth/api/auth.guard");
const current_actor_decorator_1 = require("../../auth/api/current-actor.decorator");
const current_player_utils_1 = require("../../auth/api/current-player.utils");
const hospital_service_1 = require("../application/hospital.service");
const hospital_presenter_1 = require("./hospital.presenter");
let HospitalController = class HospitalController {
    hospitalService;
    constructor(hospitalService) {
        this.hospitalService = hospitalService;
    }
    async getStatus(playerId) {
        const status = await this.hospitalService.getStatus(playerId);
        return (0, hospital_presenter_1.toHospitalStatusResponseBody)(status);
    }
    async getCurrentPlayerStatus(actor) {
        const quote = await this.hospitalService.getBuyoutQuote((0, current_player_utils_1.requireCurrentPlayerId)(actor));
        return (0, hospital_presenter_1.toHospitalBuyoutStatusResponseBody)(quote);
    }
    async buyOutCurrentPlayer(actor) {
        const result = await this.hospitalService.buyOut((0, current_player_utils_1.requireCurrentPlayerId)(actor));
        return (0, hospital_presenter_1.toHospitalBuyoutResponseBody)(result);
    }
};
exports.HospitalController = HospitalController;
__decorate([
    (0, common_1.Get)("players/:playerId/hospital/status"),
    __param(0, (0, common_1.Param)("playerId", common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HospitalController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Get)("me/hospital/status"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, current_actor_decorator_1.CurrentActor)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HospitalController.prototype, "getCurrentPlayerStatus", null);
__decorate([
    (0, common_1.Post)("me/hospital/buyout"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, current_actor_decorator_1.CurrentActor)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HospitalController.prototype, "buyOutCurrentPlayer", null);
exports.HospitalController = HospitalController = __decorate([
    (0, common_1.Controller)(),
    __param(0, (0, common_1.Inject)(hospital_service_1.HospitalService)),
    __metadata("design:paramtypes", [hospital_service_1.HospitalService])
], HospitalController);
