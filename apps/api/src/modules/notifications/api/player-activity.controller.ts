import {
  BadRequestException,
  Controller,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards
} from "@nestjs/common";

import { AuthGuard } from "../../auth/api/auth.guard";
import { CurrentActor } from "../../auth/api/current-actor.decorator";
import { requireCurrentPlayerId } from "../../auth/api/current-player.utils";
import type { AuthActor } from "../../auth/domain/auth.types";
import { PlayerActivityService } from "../application/player-activity.service";
import type { PlayerActivityResponseBody } from "./player-activity.contracts";
import { toPlayerActivityResponseBody } from "./player-activity.presenter";

@Controller()
export class PlayerActivityController {
  constructor(
    @Inject(PlayerActivityService)
    private readonly playerActivityService: PlayerActivityService
  ) {}

  @Get("players/:playerId/activity")
  async listPlayerActivity(
    @Param("playerId", ParseUUIDPipe) playerId: string,
    @Query("limit") limit?: string
  ): Promise<PlayerActivityResponseBody[]> {
    const activities = await this.playerActivityService.listPlayerActivity(
      playerId,
      parseOptionalPositiveInteger(limit)
    );

    return activities.map(toPlayerActivityResponseBody);
  }

  @Get("me/activity")
  @UseGuards(AuthGuard)
  async listCurrentPlayerActivity(
    @CurrentActor() actor: AuthActor | undefined,
    @Query("limit") limit?: string
  ): Promise<PlayerActivityResponseBody[]> {
    const activities = await this.playerActivityService.listPlayerActivity(
      requireCurrentPlayerId(actor),
      parseOptionalPositiveInteger(limit)
    );

    return activities.map(toPlayerActivityResponseBody);
  }

  @Post("players/:playerId/activity/:activityId/read")
  async markActivityRead(
    @Param("playerId", ParseUUIDPipe) playerId: string,
    @Param("activityId", ParseUUIDPipe) activityId: string
  ): Promise<PlayerActivityResponseBody> {
    const activity = await this.playerActivityService.markActivityRead(
      playerId,
      activityId
    );

    return toPlayerActivityResponseBody(activity);
  }

  @Post("me/activity/:activityId/read")
  @UseGuards(AuthGuard)
  async markCurrentPlayerActivityRead(
    @Param("activityId", ParseUUIDPipe) activityId: string,
    @CurrentActor() actor: AuthActor | undefined
  ): Promise<PlayerActivityResponseBody> {
    const activity = await this.playerActivityService.markActivityRead(
      requireCurrentPlayerId(actor),
      activityId
    );

    return toPlayerActivityResponseBody(activity);
  }
}

function parseOptionalPositiveInteger(value: string | undefined): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw new BadRequestException("Activity limit must be a positive integer.");
  }

  return parsedValue;
}
