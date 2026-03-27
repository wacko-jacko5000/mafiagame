"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminToolsModule = void 0;
const common_1 = require("@nestjs/common");
const auth_module_1 = require("../auth/auth.module");
const crime_module_1 = require("../crime/crime.module");
const custody_module_1 = require("../custody/custody.module");
const inventory_module_1 = require("../inventory/inventory.module");
const territory_module_1 = require("../territory/territory.module");
const admin_balance_audit_repository_1 = require("./application/admin-balance-audit.repository");
const admin_balance_service_1 = require("./application/admin-balance.service");
const sticky_menu_repository_1 = require("./application/sticky-menu.repository");
const sticky_menu_service_1 = require("./application/sticky-menu.service");
const admin_balance_controller_1 = require("./api/admin-balance.controller");
const admin_api_key_guard_1 = require("./api/admin-api-key.guard");
const sticky_menu_controller_1 = require("./api/sticky-menu.controller");
const prisma_admin_balance_audit_repository_1 = require("./infrastructure/prisma-admin-balance-audit.repository");
const prisma_sticky_menu_repository_1 = require("./infrastructure/prisma-sticky-menu.repository");
let AdminToolsModule = class AdminToolsModule {
};
exports.AdminToolsModule = AdminToolsModule;
exports.AdminToolsModule = AdminToolsModule = __decorate([
    (0, common_1.Module)({
        imports: [auth_module_1.AuthModule, crime_module_1.CrimeModule, territory_module_1.TerritoryModule, inventory_module_1.InventoryModule, custody_module_1.CustodyModule],
        controllers: [admin_balance_controller_1.AdminBalanceController, sticky_menu_controller_1.StickyMenuController, sticky_menu_controller_1.AdminStickyMenuController],
        providers: [
            admin_balance_service_1.AdminBalanceService,
            sticky_menu_service_1.StickyMenuService,
            admin_api_key_guard_1.AdminApiKeyGuard,
            {
                provide: admin_balance_audit_repository_1.ADMIN_BALANCE_AUDIT_REPOSITORY,
                useClass: prisma_admin_balance_audit_repository_1.PrismaAdminBalanceAuditRepository
            },
            {
                provide: sticky_menu_repository_1.STICKY_MENU_REPOSITORY,
                useClass: prisma_sticky_menu_repository_1.PrismaStickyMenuRepository
            }
        ],
        exports: [admin_api_key_guard_1.AdminApiKeyGuard]
    })
], AdminToolsModule);
