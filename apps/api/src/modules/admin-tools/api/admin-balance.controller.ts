import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Query,
  UseGuards
} from "@nestjs/common";

import { OptionalAuthGuard } from "../../auth/api/auth.guard";
import { CurrentActor } from "../../auth/api/current-actor.decorator";
import type { AuthActor } from "../../auth/domain/auth.types";
import { AdminBalanceService } from "../application/admin-balance.service";
import type {
  AdminBalanceAuditResponseBody,
  AdminBalanceIndexResponseBody,
  AdminBalanceSectionResponseBody
} from "./admin-balance.contracts";
import { AdminApiKeyGuard } from "./admin-api-key.guard";

@Controller("admin/balance")
@UseGuards(AdminApiKeyGuard)
export class AdminBalanceController {
  constructor(
    @Inject(AdminBalanceService)
    private readonly adminBalanceService: AdminBalanceService
  ) {}

  @Get()
  async getAllSections(): Promise<AdminBalanceIndexResponseBody> {
    return {
      sections: await this.adminBalanceService.getAllSections()
    };
  }

  @Get("audit")
  async getAuditLog(
    @Query("section") section?: string,
    @Query("targetId") targetId?: string,
    @Query("limit") limit?: string
  ): Promise<AdminBalanceAuditResponseBody> {
    return {
      entries: await this.adminBalanceService.getAuditLog({
        section,
        targetId,
        limit
      })
    };
  }

  @Get(":section")
  async getSection(
    @Param("section") section: string
  ): Promise<AdminBalanceSectionResponseBody> {
    return this.adminBalanceService.getSection(section);
  }

  @Patch(":section")
  @UseGuards(OptionalAuthGuard)
  async updateSection(
    @Param("section") section: string,
    @Body() body: unknown,
    @CurrentActor() actor?: AuthActor
  ): Promise<AdminBalanceSectionResponseBody> {
    return this.adminBalanceService.updateSection(section, body, actor?.accountId ?? null);
  }
}
