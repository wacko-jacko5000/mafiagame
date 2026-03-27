"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GangsModule = void 0;
const common_1 = require("@nestjs/common");
const domain_events_module_1 = require("../../platform/domain-events/domain-events.module");
const player_module_1 = require("../player/player.module");
const gangs_repository_1 = require("./application/gangs.repository");
const gangs_service_1 = require("./application/gangs.service");
const gangs_controller_1 = require("./api/gangs.controller");
const prisma_gangs_repository_1 = require("./infrastructure/prisma-gangs.repository");
let GangsModule = class GangsModule {
};
exports.GangsModule = GangsModule;
exports.GangsModule = GangsModule = __decorate([
    (0, common_1.Module)({
        imports: [player_module_1.PlayerModule, domain_events_module_1.DomainEventsModule],
        controllers: [
            gangs_controller_1.GangsController,
            gangs_controller_1.GangInvitesController,
            gangs_controller_1.PlayerGangInvitesController,
            gangs_controller_1.PlayerGangMembershipController
        ],
        providers: [
            gangs_service_1.GangsService,
            {
                provide: gangs_repository_1.GANGS_REPOSITORY,
                useClass: prisma_gangs_repository_1.PrismaGangsRepository
            }
        ],
        exports: [gangs_service_1.GangsService]
    })
], GangsModule);
