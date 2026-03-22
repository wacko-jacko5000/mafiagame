import { Module } from "@nestjs/common";

import { AdminToolsModule } from "../admin-tools/admin-tools.module";
import { AuthModule } from "../auth/auth.module";
import { SEASONS_REPOSITORY } from "./application/seasons.repository";
import { SeasonsService } from "./application/seasons.service";
import {
  AdminSeasonsController,
  SeasonsController
} from "./api/seasons.controller";
import { PrismaSeasonsRepository } from "./infrastructure/prisma-seasons.repository";

@Module({
  imports: [AuthModule, AdminToolsModule],
  controllers: [SeasonsController, AdminSeasonsController],
  providers: [
    SeasonsService,
    {
      provide: SEASONS_REPOSITORY,
      useClass: PrismaSeasonsRepository
    }
  ],
  exports: [SeasonsService]
})
export class SeasonsModule {}
