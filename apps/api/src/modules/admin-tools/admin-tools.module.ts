import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module";
import { CrimeModule } from "../crime/crime.module";
import { CustodyModule } from "../custody/custody.module";
import { InventoryModule } from "../inventory/inventory.module";
import { TerritoryModule } from "../territory/territory.module";
import { ADMIN_BALANCE_AUDIT_REPOSITORY } from "./application/admin-balance-audit.repository";
import { AdminBalanceService } from "./application/admin-balance.service";
import { STICKY_MENU_REPOSITORY } from "./application/sticky-menu.repository";
import { StickyMenuService } from "./application/sticky-menu.service";
import { AdminBalanceController } from "./api/admin-balance.controller";
import { AdminApiKeyGuard } from "./api/admin-api-key.guard";
import {
  AdminStickyMenuController,
  StickyMenuController
} from "./api/sticky-menu.controller";
import { PrismaAdminBalanceAuditRepository } from "./infrastructure/prisma-admin-balance-audit.repository";
import { PrismaStickyMenuRepository } from "./infrastructure/prisma-sticky-menu.repository";

@Module({
  imports: [AuthModule, CrimeModule, TerritoryModule, InventoryModule, CustodyModule],
  controllers: [AdminBalanceController, StickyMenuController, AdminStickyMenuController],
  providers: [
    AdminBalanceService,
    StickyMenuService,
    AdminApiKeyGuard,
    {
      provide: ADMIN_BALANCE_AUDIT_REPOSITORY,
      useClass: PrismaAdminBalanceAuditRepository
    },
    {
      provide: STICKY_MENU_REPOSITORY,
      useClass: PrismaStickyMenuRepository
    }
  ],
  exports: [AdminApiKeyGuard]
})
export class AdminToolsModule {}
