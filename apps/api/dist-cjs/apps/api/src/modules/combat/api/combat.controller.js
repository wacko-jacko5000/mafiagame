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
exports.CombatController = void 0;
const common_1 = require("@nestjs/common");
const combat_service_1 = require("../application/combat.service");
const combat_presenter_1 = require("./combat.presenter");
let CombatController = class CombatController {
    combatService;
    constructor(combatService) {
        this.combatService = combatService;
    }
    async attack(attackerId, targetId) {
        const result = await this.combatService.attack(attackerId, targetId);
        return (0, combat_presenter_1.toCombatAttackResponseBody)(result);
    }
};
exports.CombatController = CombatController;
__decorate([
    (0, common_1.Post)("players/:attackerId/attack/:targetId"),
    __param(0, (0, common_1.Param)("attackerId", common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)("targetId", common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CombatController.prototype, "attack", null);
exports.CombatController = CombatController = __decorate([
    (0, common_1.Controller)("combat"),
    __param(0, (0, common_1.Inject)(combat_service_1.CombatService)),
    __metadata("design:paramtypes", [combat_service_1.CombatService])
], CombatController);
