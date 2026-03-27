import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { AdminToolsModule } from "./modules/admin-tools/admin-tools.module";
import { AchievementsModule } from "./modules/achievements/achievements.module";
import { AuthModule } from "./modules/auth/auth.module";
import { CombatModule } from "./modules/combat/combat.module";
import { CustodyModule } from "./modules/custody/custody.module";
import { DatabaseModule } from "./platform/database/database.module";
import { DomainEventsModule } from "./platform/domain-events/domain-events.module";
import { CrimeModule } from "./modules/crime/crime.module";
import { GangsModule } from "./modules/gangs/gangs.module";
import { HospitalModule } from "./modules/hospital/hospital.module";
import { InventoryModule } from "./modules/inventory/inventory.module";
import { JailModule } from "./modules/jail/jail.module";
import { LeaderboardModule } from "./modules/leaderboard/leaderboard.module";
import { MarketModule } from "./modules/market/market.module";
import { MissionsModule } from "./modules/missions/missions.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { PlayerModule } from "./modules/player/player.module";
import { SeasonsModule } from "./modules/seasons/seasons.module";
import { TerritoryModule } from "./modules/territory/territory.module";
import { validateEnv } from "./platform/config/env";
import { HealthModule } from "./platform/health/health.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      expandVariables: true,
      isGlobal: true,
      validate: validateEnv
    }),
    DatabaseModule,
    DomainEventsModule,
    HealthModule,
    AuthModule,
    PlayerModule,
    CustodyModule,
    AchievementsModule,
    AdminToolsModule,
    JailModule,
    HospitalModule,
    InventoryModule,
    MissionsModule,
    NotificationsModule,
    SeasonsModule,
    LeaderboardModule,
    MarketModule,
    GangsModule,
    TerritoryModule,
    CombatModule,
    CrimeModule
  ]
})
export class AppModule {}
