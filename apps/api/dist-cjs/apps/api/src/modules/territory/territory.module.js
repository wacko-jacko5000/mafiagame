"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TerritoryModule = void 0;
const common_1 = require("@nestjs/common");
const gangs_module_1 = require("../gangs/gangs.module");
const player_module_1 = require("../player/player.module");
const domain_events_module_1 = require("../../platform/domain-events/domain-events.module");
const territory_controller_1 = require("./api/territory.controller");
const territory_repository_1 = require("./application/territory.repository");
const territory_balance_service_1 = require("./application/territory-balance.service");
const territory_service_1 = require("./application/territory.service");
const prisma_territory_repository_1 = require("./infrastructure/prisma-territory.repository");
let TerritoryModule = class TerritoryModule {
};
exports.TerritoryModule = TerritoryModule;
exports.TerritoryModule = TerritoryModule = __decorate([
    (0, common_1.Module)({
        imports: [player_module_1.PlayerModule, gangs_module_1.GangsModule, domain_events_module_1.DomainEventsModule],
        controllers: [territory_controller_1.TerritoryController, territory_controller_1.DistrictWarsController],
        providers: [
            territory_balance_service_1.TerritoryBalanceService,
            territory_service_1.TerritoryService,
            {
                provide: territory_repository_1.TERRITORY_REPOSITORY,
                useClass: prisma_territory_repository_1.PrismaTerritoryRepository
            }
        ],
        exports: [territory_service_1.TerritoryService, territory_balance_service_1.TerritoryBalanceService]
    })
], TerritoryModule);
