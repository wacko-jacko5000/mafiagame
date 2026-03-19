import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module";
import { PlayerModule } from "../player/player.module";
import { DomainEventsModule } from "../../platform/domain-events/domain-events.module";
import { MissionsProgressEventsHandler } from "./application/missions-progress.events";
import { MissionsService } from "./application/missions.service";
import { MISSIONS_REPOSITORY } from "./application/missions.repository";
import { MissionsController } from "./api/missions.controller";
import { PrismaMissionsRepository } from "./infrastructure/prisma-missions.repository";

@Module({
  imports: [AuthModule, PlayerModule, DomainEventsModule],
  controllers: [MissionsController],
  providers: [
    MissionsService,
    MissionsProgressEventsHandler,
    {
      provide: MISSIONS_REPOSITORY,
      useClass: PrismaMissionsRepository
    }
  ],
  exports: [MissionsService]
})
export class MissionsModule {}
