"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsModule = void 0;
const common_1 = require("@nestjs/common");
const domain_events_module_1 = require("../../platform/domain-events/domain-events.module");
const auth_module_1 = require("../auth/auth.module");
const gangs_module_1 = require("../gangs/gangs.module");
const player_module_1 = require("../player/player.module");
const player_activity_events_1 = require("./application/player-activity.events");
const player_activity_repository_1 = require("./application/player-activity.repository");
const player_activity_service_1 = require("./application/player-activity.service");
const player_activity_controller_1 = require("./api/player-activity.controller");
const prisma_player_activity_repository_1 = require("./infrastructure/prisma-player-activity.repository");
let NotificationsModule = class NotificationsModule {
};
exports.NotificationsModule = NotificationsModule;
exports.NotificationsModule = NotificationsModule = __decorate([
    (0, common_1.Module)({
        imports: [auth_module_1.AuthModule, player_module_1.PlayerModule, gangs_module_1.GangsModule, domain_events_module_1.DomainEventsModule],
        controllers: [player_activity_controller_1.PlayerActivityController],
        providers: [
            player_activity_service_1.PlayerActivityService,
            player_activity_events_1.PlayerActivityEventsHandler,
            {
                provide: player_activity_repository_1.PLAYER_ACTIVITY_REPOSITORY,
                useClass: prisma_player_activity_repository_1.PrismaPlayerActivityRepository
            }
        ],
        exports: [player_activity_service_1.PlayerActivityService]
    })
], NotificationsModule);
