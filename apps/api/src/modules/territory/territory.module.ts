import { Module } from "@nestjs/common";

import { GangsModule } from "../gangs/gangs.module";
import { PlayerModule } from "../player/player.module";
import { DomainEventsModule } from "../../platform/domain-events/domain-events.module";
import { DistrictWarsController, TerritoryController } from "./api/territory.controller";
import { TERRITORY_REPOSITORY } from "./application/territory.repository";
import { TerritoryBalanceService } from "./application/territory-balance.service";
import { TerritoryService } from "./application/territory.service";
import { PrismaTerritoryRepository } from "./infrastructure/prisma-territory.repository";

@Module({
  imports: [PlayerModule, GangsModule, DomainEventsModule],
  controllers: [TerritoryController, DistrictWarsController],
  providers: [
    TerritoryBalanceService,
    TerritoryService,
    {
      provide: TERRITORY_REPOSITORY,
      useClass: PrismaTerritoryRepository
    }
  ],
  exports: [TerritoryService, TerritoryBalanceService]
})
export class TerritoryModule {}
