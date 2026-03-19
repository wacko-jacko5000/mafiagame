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
import { CrimeService } from "../application/crime.service";
import type {
  CrimeExecutionResponseBody,
  CrimeListItemResponseBody
} from "./crime.contracts";
import {
  toCrimeExecutionResponseBody,
  toCrimeListItemResponseBody
} from "./crime.presenter";

@Controller()
export class CrimeController {
  constructor(
    @Inject(CrimeService)
    private readonly crimeService: CrimeService
  ) {}

  @Get("crimes")
  getCrimes(): CrimeListItemResponseBody[] {
    return this.crimeService.listCrimes().map(toCrimeListItemResponseBody);
  }

  @Post("players/:playerId/crimes/:crimeId/execute")
  async executeCrime(
    @Param("playerId", ParseUUIDPipe) playerId: string,
    @Param("crimeId") crimeId: string
  ): Promise<CrimeExecutionResponseBody> {
    const outcome = await this.crimeService.executeCrime(playerId, crimeId);
    return toCrimeExecutionResponseBody(outcome);
  }

  @Post("me/crimes/:crimeId/execute")
  @UseGuards(AuthGuard)
  async executeCurrentPlayerCrime(
    @Param("crimeId") crimeId: string,
    @CurrentActor() actor: AuthActor | undefined
  ): Promise<CrimeExecutionResponseBody> {
    const outcome = await this.crimeService.executeCrime(
      requireCurrentPlayerId(actor),
      crimeId
    );

    return toCrimeExecutionResponseBody(outcome);
  }
}
