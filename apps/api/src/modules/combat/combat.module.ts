import { Module } from "@nestjs/common";

import { HospitalModule } from "../hospital/hospital.module";
import { InventoryModule } from "../inventory/inventory.module";
import { JailModule } from "../jail/jail.module";
import { PlayerModule } from "../player/player.module";
import { DomainEventsModule } from "../../platform/domain-events/domain-events.module";
import { COMBAT_REPOSITORY } from "./application/combat.repository";
import { CombatService } from "./application/combat.service";
import { CombatController } from "./api/combat.controller";
import { PrismaCombatRepository } from "./infrastructure/prisma-combat.repository";

@Module({
  imports: [PlayerModule, JailModule, HospitalModule, InventoryModule, DomainEventsModule],
  controllers: [CombatController],
  providers: [
    CombatService,
    {
      provide: COMBAT_REPOSITORY,
      useClass: PrismaCombatRepository
    }
  ],
  exports: [CombatService]
})
export class CombatModule {}
