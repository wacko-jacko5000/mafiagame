import { Module } from "@nestjs/common";

import { DomainEventsModule } from "../../platform/domain-events/domain-events.module";
import { AuthModule } from "../auth/auth.module";
import { GangsModule } from "../gangs/gangs.module";
import { PlayerModule } from "../player/player.module";
import { PlayerActivityEventsHandler } from "./application/player-activity.events";
import { PLAYER_ACTIVITY_REPOSITORY } from "./application/player-activity.repository";
import { PlayerActivityService } from "./application/player-activity.service";
import { PlayerActivityController } from "./api/player-activity.controller";
import { PrismaPlayerActivityRepository } from "./infrastructure/prisma-player-activity.repository";

@Module({
  imports: [AuthModule, PlayerModule, GangsModule, DomainEventsModule],
  controllers: [PlayerActivityController],
  providers: [
    PlayerActivityService,
    PlayerActivityEventsHandler,
    {
      provide: PLAYER_ACTIVITY_REPOSITORY,
      useClass: PrismaPlayerActivityRepository
    }
  ],
  exports: [PlayerActivityService]
})
export class NotificationsModule {}
