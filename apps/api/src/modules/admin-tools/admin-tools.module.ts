import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module";
import { CrimeModule } from "../crime/crime.module";
import { InventoryModule } from "../inventory/inventory.module";
import { TerritoryModule } from "../territory/territory.module";
import { ADMIN_BALANCE_AUDIT_REPOSITORY } from "./application/admin-balance-audit.repository";
import { AdminBalanceService } from "./application/admin-balance.service";
import { AdminBalanceController } from "./api/admin-balance.controller";
import { AdminApiKeyGuard } from "./api/admin-api-key.guard";
import { PrismaAdminBalanceAuditRepository } from "./infrastructure/prisma-admin-balance-audit.repository";

@Module({
  imports: [AuthModule, CrimeModule, TerritoryModule, InventoryModule],
  controllers: [AdminBalanceController],
  providers: [
    AdminBalanceService,
    AdminApiKeyGuard,
    {
      provide: ADMIN_BALANCE_AUDIT_REPOSITORY,
      useClass: PrismaAdminBalanceAuditRepository
    }
  ],
  exports: [AdminApiKeyGuard]
})
export class AdminToolsModule {}
