import { Inject, Injectable } from "@nestjs/common";

import type { ApiHealthResponse } from "@mafia-game/types";

import { PrismaService } from "../database/prisma.service";

@Injectable()
export class HealthService {
  constructor(
    @Inject(PrismaService)
    private readonly prismaService: PrismaService
  ) {}

  async getHealth(): Promise<ApiHealthResponse> {
    let databaseConnected = false;

    try {
      databaseConnected = await this.prismaService.checkConnection();
    } catch {
      databaseConnected = false;
    }

    return {
      service: "api",
      status: databaseConnected ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      database: {
        status: databaseConnected ? "up" : "down"
      }
    };
  }
}
