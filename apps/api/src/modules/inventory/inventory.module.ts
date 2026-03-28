import { forwardRef, Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module";
import { PlayerModule } from "../player/player.module";
import { DomainEventsModule } from "../../platform/domain-events/domain-events.module";
import { InventoryBalanceService } from "./application/inventory-balance.service";
import { INVENTORY_BALANCE_REPOSITORY } from "./application/inventory-balance.repository";
import { InventoryService } from "./application/inventory.service";
import { INVENTORY_REPOSITORY } from "./application/inventory.repository";
import { InventoryController } from "./api/inventory.controller";
import { PrismaInventoryBalanceRepository } from "./infrastructure/prisma-inventory-balance.repository";
import { PrismaInventoryRepository } from "./infrastructure/prisma-inventory.repository";

@Module({
  imports: [AuthModule, forwardRef(() => PlayerModule), DomainEventsModule],
  controllers: [InventoryController],
  providers: [
    InventoryBalanceService,
    InventoryService,
    {
      provide: INVENTORY_BALANCE_REPOSITORY,
      useClass: PrismaInventoryBalanceRepository
    },
    {
      provide: INVENTORY_REPOSITORY,
      useClass: PrismaInventoryRepository
    }
  ],
  exports: [InventoryService, InventoryBalanceService]
})
export class InventoryModule {}
