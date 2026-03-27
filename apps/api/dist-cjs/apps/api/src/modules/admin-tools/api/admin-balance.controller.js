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
exports.AdminBalanceController = void 0;
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("../../auth/api/auth.guard");
const current_actor_decorator_1 = require("../../auth/api/current-actor.decorator");
const admin_balance_service_1 = require("../application/admin-balance.service");
const admin_api_key_guard_1 = require("./admin-api-key.guard");
let AdminBalanceController = class AdminBalanceController {
    adminBalanceService;
    constructor(adminBalanceService) {
        this.adminBalanceService = adminBalanceService;
    }
    async getAllSections() {
        return {
            sections: await this.adminBalanceService.getAllSections()
        };
    }
    async getAuditLog(section, targetId, limit) {
        return {
            entries: await this.adminBalanceService.getAuditLog({
                section,
                targetId,
                limit
            })
        };
    }
    async getSection(section) {
        return this.adminBalanceService.getSection(section);
    }
    async updateSection(section, body, actor) {
        return this.adminBalanceService.updateSection(section, body, actor?.accountId ?? null);
    }
};
exports.AdminBalanceController = AdminBalanceController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminBalanceController.prototype, "getAllSections", null);
__decorate([
    (0, common_1.Get)("audit"),
    __param(0, (0, common_1.Query)("section")),
    __param(1, (0, common_1.Query)("targetId")),
    __param(2, (0, common_1.Query)("limit")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AdminBalanceController.prototype, "getAuditLog", null);
__decorate([
    (0, common_1.Get)(":section"),
    __param(0, (0, common_1.Param)("section")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminBalanceController.prototype, "getSection", null);
__decorate([
    (0, common_1.Patch)(":section"),
    (0, common_1.UseGuards)(auth_guard_1.OptionalAuthGuard),
    __param(0, (0, common_1.Param)("section")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_actor_decorator_1.CurrentActor)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AdminBalanceController.prototype, "updateSection", null);
exports.AdminBalanceController = AdminBalanceController = __decorate([
    (0, common_1.Controller)("admin/balance"),
    (0, common_1.UseGuards)(admin_api_key_guard_1.AdminApiKeyGuard),
    __param(0, (0, common_1.Inject)(admin_balance_service_1.AdminBalanceService)),
    __metadata("design:paramtypes", [admin_balance_service_1.AdminBalanceService])
], AdminBalanceController);
