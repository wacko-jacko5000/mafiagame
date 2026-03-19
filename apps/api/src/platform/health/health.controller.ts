import { Controller, Get, Inject } from "@nestjs/common";

import type { ApiHealthResponse } from "@mafia-game/types";

import { HealthService } from "./health.service";

@Controller("health")
export class HealthController {
  constructor(
    @Inject(HealthService)
    private readonly healthService: HealthService
  ) {}

  @Get()
  getHealth(): Promise<ApiHealthResponse> {
    return this.healthService.getHealth();
  }
}
