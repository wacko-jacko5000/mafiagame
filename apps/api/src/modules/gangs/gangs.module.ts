import { Module } from "@nestjs/common";

import { DomainEventsModule } from "../../platform/domain-events/domain-events.module";
import { PlayerModule } from "../player/player.module";
import { GANGS_REPOSITORY } from "./application/gangs.repository";
import { GangsService } from "./application/gangs.service";
import {
  GangInvitesController,
  GangsController,
  PlayerGangInvitesController
} from "./api/gangs.controller";
import { PrismaGangsRepository } from "./infrastructure/prisma-gangs.repository";

@Module({
  imports: [PlayerModule, DomainEventsModule],
  controllers: [GangsController, GangInvitesController, PlayerGangInvitesController],
  providers: [
    GangsService,
    {
      provide: GANGS_REPOSITORY,
      useClass: PrismaGangsRepository
    }
  ],
  exports: [GangsService]
})
export class GangsModule {}
