import { Module } from "@nestjs/common";

import { DatabaseModule } from "../../platform/database/database.module";
import { CustodyBalanceService } from "./application/custody-balance.service";
import { CUSTODY_BALANCE_REPOSITORY } from "./application/custody-balance.repository";
import { PrismaCustodyBalanceRepository } from "./infrastructure/prisma-custody-balance.repository";

@Module({
  imports: [DatabaseModule],
  providers: [
    CustodyBalanceService,
    {
      provide: CUSTODY_BALANCE_REPOSITORY,
      useClass: PrismaCustodyBalanceRepository
    }
  ],
  exports: [CustodyBalanceService]
})
export class CustodyModule {}
