import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards
} from "@nestjs/common";

import { CurrentActor } from "../../auth/api/current-actor.decorator";
import { OptionalAuthGuard } from "../../auth/api/auth.guard";
import type { AuthActor } from "../../auth/domain/auth.types";
import { PlayerService } from "../application/player.service";
import type {
  CreatePlayerRequestBody,
  PlayerResourcesResponseBody,
  PlayerResponseBody
} from "./player.contracts";
import {
  toPlayerResourcesResponseBody,
  toPlayerResponseBody
} from "./player.presenter";

@Controller("players")
export class PlayerController {
  constructor(
    @Inject(PlayerService)
    private readonly playerService: PlayerService
  ) {}

  @Post()
  @UseGuards(OptionalAuthGuard)
  async createPlayer(
    @Body() body: CreatePlayerRequestBody,
    @CurrentActor() actor?: AuthActor
  ): Promise<PlayerResponseBody> {
    const player = await this.playerService.createPlayerForAccount(
      body,
      actor?.accountId
    );
    return toPlayerResponseBody(player);
  }

  @Get(":id")
  async getPlayerById(
    @Param("id", ParseUUIDPipe) playerId: string
  ): Promise<PlayerResponseBody> {
    const player = await this.playerService.getPlayerById(playerId);
    return toPlayerResponseBody(player);
  }

  @Get(":id/resources")
  async getPlayerResources(
    @Param("id", ParseUUIDPipe) playerId: string
  ): Promise<PlayerResourcesResponseBody> {
    const resources = await this.playerService.getPlayerResources(playerId);
    return toPlayerResourcesResponseBody(resources);
  }
}
