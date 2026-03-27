"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CombatModule = void 0;
const common_1 = require("@nestjs/common");
const hospital_module_1 = require("../hospital/hospital.module");
const inventory_module_1 = require("../inventory/inventory.module");
const jail_module_1 = require("../jail/jail.module");
const notifications_module_1 = require("../notifications/notifications.module");
const player_module_1 = require("../player/player.module");
const domain_events_module_1 = require("../../platform/domain-events/domain-events.module");
const combat_repository_1 = require("./application/combat.repository");
const combat_service_1 = require("./application/combat.service");
const combat_controller_1 = require("./api/combat.controller");
const prisma_combat_repository_1 = require("./infrastructure/prisma-combat.repository");
let CombatModule = class CombatModule {
};
exports.CombatModule = CombatModule;
exports.CombatModule = CombatModule = __decorate([
    (0, common_1.Module)({
        imports: [
            player_module_1.PlayerModule,
            jail_module_1.JailModule,
            hospital_module_1.HospitalModule,
            inventory_module_1.InventoryModule,
            notifications_module_1.NotificationsModule,
            domain_events_module_1.DomainEventsModule
        ],
        controllers: [combat_controller_1.CombatController],
        providers: [
            combat_service_1.CombatService,
            {
                provide: combat_repository_1.COMBAT_REPOSITORY,
                useClass: prisma_combat_repository_1.PrismaCombatRepository
            }
        ],
        exports: [combat_service_1.CombatService]
    })
], CombatModule);
