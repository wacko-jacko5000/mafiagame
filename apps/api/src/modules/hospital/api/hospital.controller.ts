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
import { HospitalService } from "../application/hospital.service";
import type {
  HospitalBuyoutResponseBody,
  HospitalBuyoutStatusResponseBody,
  HospitalStatusResponseBody
} from "./hospital.contracts";
import {
  toHospitalBuyoutResponseBody,
  toHospitalBuyoutStatusResponseBody,
  toHospitalStatusResponseBody
} from "./hospital.presenter";

@Controller()
export class HospitalController {
  constructor(
    @Inject(HospitalService)
    private readonly hospitalService: HospitalService
  ) {}

  @Get("players/:playerId/hospital/status")
  async getStatus(
    @Param("playerId", ParseUUIDPipe) playerId: string
  ): Promise<HospitalStatusResponseBody> {
    const status = await this.hospitalService.getStatus(playerId);
    return toHospitalStatusResponseBody(status);
  }

  @Get("me/hospital/status")
  @UseGuards(AuthGuard)
  async getCurrentPlayerStatus(
    @CurrentActor() actor: AuthActor | undefined
  ): Promise<HospitalBuyoutStatusResponseBody> {
    const quote = await this.hospitalService.getBuyoutQuote(
      requireCurrentPlayerId(actor)
    );
    return toHospitalBuyoutStatusResponseBody(quote);
  }

  @Post("me/hospital/buyout")
  @UseGuards(AuthGuard)
  async buyOutCurrentPlayer(
    @CurrentActor() actor: AuthActor | undefined
  ): Promise<HospitalBuyoutResponseBody> {
    const result = await this.hospitalService.buyOut(requireCurrentPlayerId(actor));
    return toHospitalBuyoutResponseBody(result);
  }
}
