import { Controller, Get, Inject, Param, ParseUUIDPipe } from "@nestjs/common";

import { JailService } from "../application/jail.service";
import type { JailStatusResponseBody } from "./jail.contracts";
import { toJailStatusResponseBody } from "./jail.presenter";

@Controller("players/:playerId/jail")
export class JailController {
  constructor(
    @Inject(JailService)
    private readonly jailService: JailService
  ) {}

  @Get("status")
  async getStatus(
    @Param("playerId", ParseUUIDPipe) playerId: string
  ): Promise<JailStatusResponseBody> {
    const status = await this.jailService.getStatus(playerId);
    return toJailStatusResponseBody(status);
  }
}
