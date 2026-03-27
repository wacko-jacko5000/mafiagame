"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryModule = void 0;
const common_1 = require("@nestjs/common");
const auth_module_1 = require("../auth/auth.module");
const player_module_1 = require("../player/player.module");
const domain_events_module_1 = require("../../platform/domain-events/domain-events.module");
const inventory_balance_service_1 = require("./application/inventory-balance.service");
const inventory_balance_repository_1 = require("./application/inventory-balance.repository");
const inventory_service_1 = require("./application/inventory.service");
const inventory_repository_1 = require("./application/inventory.repository");
const inventory_controller_1 = require("./api/inventory.controller");
const prisma_inventory_balance_repository_1 = require("./infrastructure/prisma-inventory-balance.repository");
const prisma_inventory_repository_1 = require("./infrastructure/prisma-inventory.repository");
let InventoryModule = class InventoryModule {
};
exports.InventoryModule = InventoryModule;
exports.InventoryModule = InventoryModule = __decorate([
    (0, common_1.Module)({
        imports: [auth_module_1.AuthModule, player_module_1.PlayerModule, domain_events_module_1.DomainEventsModule],
        controllers: [inventory_controller_1.InventoryController],
        providers: [
            inventory_balance_service_1.InventoryBalanceService,
            inventory_service_1.InventoryService,
            {
                provide: inventory_balance_repository_1.INVENTORY_BALANCE_REPOSITORY,
                useClass: prisma_inventory_balance_repository_1.PrismaInventoryBalanceRepository
            },
            {
                provide: inventory_repository_1.INVENTORY_REPOSITORY,
                useClass: prisma_inventory_repository_1.PrismaInventoryRepository
            }
        ],
        exports: [inventory_service_1.InventoryService, inventory_balance_service_1.InventoryBalanceService]
    })
], InventoryModule);
