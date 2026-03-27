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
exports.CrimeController = void 0;
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("../../auth/api/auth.guard");
const current_actor_decorator_1 = require("../../auth/api/current-actor.decorator");
const current_player_utils_1 = require("../../auth/api/current-player.utils");
const crime_service_1 = require("../application/crime.service");
const crime_presenter_1 = require("./crime.presenter");
let CrimeController = class CrimeController {
    crimeService;
    constructor(crimeService) {
        this.crimeService = crimeService;
    }
    getCrimes() {
        return this.crimeService.listCrimes().map(crime_presenter_1.toCrimeListItemResponseBody);
    }
    async executeCrime(playerId, crimeId) {
        const outcome = await this.crimeService.executeCrime(playerId, crimeId);
        return (0, crime_presenter_1.toCrimeExecutionResponseBody)(outcome);
    }
    async executeCurrentPlayerCrime(crimeId, actor) {
        const outcome = await this.crimeService.executeCrime((0, current_player_utils_1.requireCurrentPlayerId)(actor), crimeId);
        return (0, crime_presenter_1.toCrimeExecutionResponseBody)(outcome);
    }
};
exports.CrimeController = CrimeController;
__decorate([
    (0, common_1.Get)("crimes"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Array)
], CrimeController.prototype, "getCrimes", null);
__decorate([
    (0, common_1.Post)("players/:playerId/crimes/:crimeId/execute"),
    __param(0, (0, common_1.Param)("playerId", common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)("crimeId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CrimeController.prototype, "executeCrime", null);
__decorate([
    (0, common_1.Post)("me/crimes/:crimeId/execute"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Param)("crimeId")),
    __param(1, (0, current_actor_decorator_1.CurrentActor)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CrimeController.prototype, "executeCurrentPlayerCrime", null);
exports.CrimeController = CrimeController = __decorate([
    (0, common_1.Controller)(),
    __param(0, (0, common_1.Inject)(crime_service_1.CrimeService)),
    __metadata("design:paramtypes", [crime_service_1.CrimeService])
], CrimeController);
