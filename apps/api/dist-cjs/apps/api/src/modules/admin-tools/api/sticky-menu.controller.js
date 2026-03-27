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
exports.AdminStickyMenuController = exports.StickyMenuController = void 0;
const common_1 = require("@nestjs/common");
const sticky_menu_service_1 = require("../application/sticky-menu.service");
const admin_api_key_guard_1 = require("./admin-api-key.guard");
let StickyMenuController = class StickyMenuController {
    stickyMenuService;
    constructor(stickyMenuService) {
        this.stickyMenuService = stickyMenuService;
    }
    getConfig() {
        return this.stickyMenuService.getConfig();
    }
};
exports.StickyMenuController = StickyMenuController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StickyMenuController.prototype, "getConfig", null);
exports.StickyMenuController = StickyMenuController = __decorate([
    (0, common_1.Controller)("sticky-menu"),
    __param(0, (0, common_1.Inject)(sticky_menu_service_1.StickyMenuService)),
    __metadata("design:paramtypes", [sticky_menu_service_1.StickyMenuService])
], StickyMenuController);
let AdminStickyMenuController = class AdminStickyMenuController {
    stickyMenuService;
    constructor(stickyMenuService) {
        this.stickyMenuService = stickyMenuService;
    }
    getConfig() {
        return this.stickyMenuService.getConfig();
    }
    updateConfig(body) {
        return this.stickyMenuService.updateConfig(body);
    }
};
exports.AdminStickyMenuController = AdminStickyMenuController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminStickyMenuController.prototype, "getConfig", null);
__decorate([
    (0, common_1.Patch)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminStickyMenuController.prototype, "updateConfig", null);
exports.AdminStickyMenuController = AdminStickyMenuController = __decorate([
    (0, common_1.Controller)("admin/sticky-menu"),
    (0, common_1.UseGuards)(admin_api_key_guard_1.AdminApiKeyGuard),
    __param(0, (0, common_1.Inject)(sticky_menu_service_1.StickyMenuService)),
    __metadata("design:paramtypes", [sticky_menu_service_1.StickyMenuService])
], AdminStickyMenuController);
