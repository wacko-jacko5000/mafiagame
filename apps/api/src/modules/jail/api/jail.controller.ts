import {
  Controller,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards
} from "@nestjs/common";

import { AuthGuard } from "../../auth/api/auth.guard";
import { CurrentActor } from "../../auth/api/current-actor.decorator";
import { requireCurrentPlayerId } from "../../auth/api/current-player.utils";
import type { AuthActor } from "../../auth/domain/auth.types";
import { JailService } from "../application/jail.service";
import type {
  JailBuyoutResponseBody,
  JailBuyoutStatusResponseBody,
  JailStatusResponseBody
} from "./jail.contracts";
import {
  toJailBuyoutResponseBody,
  toJailBuyoutStatusResponseBody,
  toJailStatusResponseBody
} from "./jail.presenter";

@Controller()
export class JailController {
  constructor(
    @Inject(JailService)
    private readonly jailService: JailService
  ) {}

  @Get("players/:playerId/jail/status")
  async getStatus(
    @Param("playerId", ParseUUIDPipe) playerId: string
  ): Promise<JailStatusResponseBody> {
    const status = await this.jailService.getStatus(playerId);
    return toJailStatusResponseBody(status);
  }

  @Get("me/jail/status")
  @UseGuards(AuthGuard)
  async getCurrentPlayerStatus(
    @CurrentActor() actor: AuthActor | undefined
  ): Promise<JailBuyoutStatusResponseBody> {
    const quote = await this.jailService.getBuyoutQuote(requireCurrentPlayerId(actor));
    return toJailBuyoutStatusResponseBody(quote);
  }

  @Post("me/jail/buyout")
  @UseGuards(AuthGuard)
  async buyOutCurrentPlayer(
    @CurrentActor() actor: AuthActor | undefined
  ): Promise<JailBuyoutResponseBody> {
    const result = await this.jailService.buyOut(requireCurrentPlayerId(actor));
    return toJailBuyoutResponseBody(result);
  }
}
