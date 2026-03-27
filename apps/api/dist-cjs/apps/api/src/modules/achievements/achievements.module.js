"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AchievementsModule = void 0;
const common_1 = require("@nestjs/common");
const domain_events_module_1 = require("../../platform/domain-events/domain-events.module");
const player_module_1 = require("../player/player.module");
const achievements_progress_events_1 = require("./application/achievements-progress.events");
const achievements_repository_1 = require("./application/achievements.repository");
const achievements_service_1 = require("./application/achievements.service");
const achievements_controller_1 = require("./api/achievements.controller");
const prisma_achievements_repository_1 = require("./infrastructure/prisma-achievements.repository");
let AchievementsModule = class AchievementsModule {
};
exports.AchievementsModule = AchievementsModule;
exports.AchievementsModule = AchievementsModule = __decorate([
    (0, common_1.Module)({
        imports: [player_module_1.PlayerModule, domain_events_module_1.DomainEventsModule],
        controllers: [achievements_controller_1.AchievementsController],
        providers: [
            achievements_service_1.AchievementsService,
            achievements_progress_events_1.AchievementsProgressEventsHandler,
            {
                provide: achievements_repository_1.ACHIEVEMENTS_REPOSITORY,
                useClass: prisma_achievements_repository_1.PrismaAchievementsRepository
            }
        ],
        exports: [achievements_service_1.AchievementsService]
    })
], AchievementsModule);
