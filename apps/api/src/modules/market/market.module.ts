import { Module } from "@nestjs/common";

import { PlayerModule } from "../player/player.module";
import { DomainEventsModule } from "../../platform/domain-events/domain-events.module";
import { MarketController } from "./api/market.controller";
import { MARKET_REPOSITORY } from "./application/market.repository";
import { MarketService } from "./application/market.service";
import { PrismaMarketRepository } from "./infrastructure/prisma-market.repository";

@Module({
  imports: [PlayerModule, DomainEventsModule],
  controllers: [MarketController],
  providers: [
    MarketService,
    {
      provide: MARKET_REPOSITORY,
      useClass: PrismaMarketRepository
    }
  ],
  exports: [MarketService]
})
export class MarketModule {}
