import { Body, Controller, Get, Inject, Patch, UseGuards } from "@nestjs/common";

import { StickyMenuService } from "../application/sticky-menu.service";
import type { StickyMenuResponseBody } from "./sticky-menu.contracts";
import { AdminApiKeyGuard } from "./admin-api-key.guard";

@Controller("sticky-menu")
export class StickyMenuController {
  constructor(
    @Inject(StickyMenuService)
    private readonly stickyMenuService: StickyMenuService
  ) {}

  @Get()
  getConfig(): Promise<StickyMenuResponseBody> {
    return this.stickyMenuService.getConfig();
  }
}

@Controller("admin/sticky-menu")
@UseGuards(AdminApiKeyGuard)
export class AdminStickyMenuController {
  constructor(
    @Inject(StickyMenuService)
    private readonly stickyMenuService: StickyMenuService
  ) {}

  @Get()
  getConfig(): Promise<StickyMenuResponseBody> {
    return this.stickyMenuService.getConfig();
  }

  @Patch()
  updateConfig(@Body() body: unknown): Promise<StickyMenuResponseBody> {
    return this.stickyMenuService.updateConfig(body);
  }
}
