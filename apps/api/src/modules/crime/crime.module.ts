import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module";
import { HospitalModule } from "../hospital/hospital.module";
import { JailModule } from "../jail/jail.module";
import { PlayerModule } from "../player/player.module";
import { DomainEventsModule } from "../../platform/domain-events/domain-events.module";
import { CrimeBalanceService } from "./application/crime-balance.service";
import { CRIME_BALANCE_REPOSITORY } from "./application/crime-balance.repository";
import { CRIME_RANDOM_PROVIDER } from "./application/crime.constants";
import { CrimeService } from "./application/crime.service";
import { CrimeController } from "./api/crime.controller";
import { PrismaCrimeBalanceRepository } from "./infrastructure/prisma-crime-balance.repository";

@Module({
  imports: [AuthModule, PlayerModule, JailModule, HospitalModule, DomainEventsModule],
  controllers: [CrimeController],
  providers: [
    CrimeBalanceService,
    CrimeService,
    {
      provide: CRIME_BALANCE_REPOSITORY,
      useClass: PrismaCrimeBalanceRepository
    },
    {
      provide: CRIME_RANDOM_PROVIDER,
      useValue: () => Math.random()
    }
  ],
  exports: [CrimeBalanceService]
})
export class CrimeModule {}
