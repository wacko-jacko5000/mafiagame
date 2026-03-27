"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MissionsModule = void 0;
const common_1 = require("@nestjs/common");
const auth_module_1 = require("../auth/auth.module");
const gangs_module_1 = require("../gangs/gangs.module");
const inventory_module_1 = require("../inventory/inventory.module");
const player_module_1 = require("../player/player.module");
const territory_module_1 = require("../territory/territory.module");
const domain_events_module_1 = require("../../platform/domain-events/domain-events.module");
const missions_progress_events_1 = require("./application/missions-progress.events");
const missions_service_1 = require("./application/missions.service");
const missions_repository_1 = require("./application/missions.repository");
const missions_controller_1 = require("./api/missions.controller");
const prisma_missions_repository_1 = require("./infrastructure/prisma-missions.repository");
let MissionsModule = class MissionsModule {
};
exports.MissionsModule = MissionsModule;
exports.MissionsModule = MissionsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            auth_module_1.AuthModule,
            player_module_1.PlayerModule,
            inventory_module_1.InventoryModule,
            gangs_module_1.GangsModule,
            territory_module_1.TerritoryModule,
            domain_events_module_1.DomainEventsModule
        ],
        controllers: [missions_controller_1.MissionsController],
        providers: [
            missions_service_1.MissionsService,
            missions_progress_events_1.MissionsProgressEventsHandler,
            {
                provide: missions_repository_1.MISSIONS_REPOSITORY,
                useClass: prisma_missions_repository_1.PrismaMissionsRepository
            }
        ],
        exports: [missions_service_1.MissionsService]
    })
], MissionsModule);
