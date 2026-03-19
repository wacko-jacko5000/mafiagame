import { Module } from "@nestjs/common";

import { DomainEventsModule } from "../../platform/domain-events/domain-events.module";
import { PlayerModule } from "../player/player.module";
import { AchievementsProgressEventsHandler } from "./application/achievements-progress.events";
import { ACHIEVEMENTS_REPOSITORY } from "./application/achievements.repository";
import { AchievementsService } from "./application/achievements.service";
import { AchievementsController } from "./api/achievements.controller";
import { PrismaAchievementsRepository } from "./infrastructure/prisma-achievements.repository";

@Module({
  imports: [PlayerModule, DomainEventsModule],
  controllers: [AchievementsController],
  providers: [
    AchievementsService,
    AchievementsProgressEventsHandler,
    {
      provide: ACHIEVEMENTS_REPOSITORY,
      useClass: PrismaAchievementsRepository
    }
  ],
  exports: [AchievementsService]
})
export class AchievementsModule {}
