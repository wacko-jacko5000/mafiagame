"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const admin_tools_module_1 = require("./modules/admin-tools/admin-tools.module");
const achievements_module_1 = require("./modules/achievements/achievements.module");
const auth_module_1 = require("./modules/auth/auth.module");
const combat_module_1 = require("./modules/combat/combat.module");
const custody_module_1 = require("./modules/custody/custody.module");
const database_module_1 = require("./platform/database/database.module");
const domain_events_module_1 = require("./platform/domain-events/domain-events.module");
const crime_module_1 = require("./modules/crime/crime.module");
const gangs_module_1 = require("./modules/gangs/gangs.module");
const hospital_module_1 = require("./modules/hospital/hospital.module");
const inventory_module_1 = require("./modules/inventory/inventory.module");
const jail_module_1 = require("./modules/jail/jail.module");
const leaderboard_module_1 = require("./modules/leaderboard/leaderboard.module");
const market_module_1 = require("./modules/market/market.module");
const missions_module_1 = require("./modules/missions/missions.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const player_module_1 = require("./modules/player/player.module");
const seasons_module_1 = require("./modules/seasons/seasons.module");
const territory_module_1 = require("./modules/territory/territory.module");
const env_1 = require("./platform/config/env");
const health_module_1 = require("./platform/health/health.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                cache: true,
                expandVariables: true,
                isGlobal: true,
                validate: env_1.validateEnv
            }),
            database_module_1.DatabaseModule,
            domain_events_module_1.DomainEventsModule,
            health_module_1.HealthModule,
            auth_module_1.AuthModule,
            player_module_1.PlayerModule,
            custody_module_1.CustodyModule,
            achievements_module_1.AchievementsModule,
            admin_tools_module_1.AdminToolsModule,
            jail_module_1.JailModule,
            hospital_module_1.HospitalModule,
            inventory_module_1.InventoryModule,
            missions_module_1.MissionsModule,
            notifications_module_1.NotificationsModule,
            seasons_module_1.SeasonsModule,
            leaderboard_module_1.LeaderboardModule,
            market_module_1.MarketModule,
            gangs_module_1.GangsModule,
            territory_module_1.TerritoryModule,
            combat_module_1.CombatModule,
            crime_module_1.CrimeModule
        ]
    })
], AppModule);
