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
import { MissionsService } from "../application/missions.service";
import type {
  MissionCompletionResponseBody,
  MissionDefinitionResponseBody,
  PlayerMissionResponseBody
} from "./missions.contracts";
import {
  toMissionCompletionResponseBody,
  toMissionDefinitionResponseBody,
  toPlayerMissionResponseBody
} from "./missions.presenter";

@Controller()
export class MissionsController {
  constructor(
    @Inject(MissionsService)
    private readonly missionsService: MissionsService
  ) {}

  @Get("missions")
  getMissions(): MissionDefinitionResponseBody[] {
    return this.missionsService.listMissions().map(toMissionDefinitionResponseBody);
  }

  @Get("players/:playerId/missions")
  async getPlayerMissions(
    @Param("playerId", ParseUUIDPipe) playerId: string
  ): Promise<PlayerMissionResponseBody[]> {
    const missions = await this.missionsService.listPlayerMissions(playerId);
    return missions.map(toPlayerMissionResponseBody);
  }

  @Get("me/missions")
  @UseGuards(AuthGuard)
  async getCurrentPlayerMissions(
    @CurrentActor() actor: AuthActor | undefined
  ): Promise<PlayerMissionResponseBody[]> {
    const missions = await this.missionsService.listPlayerMissions(
      requireCurrentPlayerId(actor)
    );

    return missions.map(toPlayerMissionResponseBody);
  }

  @Post("players/:playerId/missions/:missionId/accept")
  async acceptMission(
    @Param("playerId", ParseUUIDPipe) playerId: string,
    @Param("missionId") missionId: string
  ): Promise<PlayerMissionResponseBody> {
    const mission = await this.missionsService.acceptMission(playerId, missionId);
    return toPlayerMissionResponseBody(mission);
  }

  @Post("me/missions/:missionId/accept")
  @UseGuards(AuthGuard)
  async acceptCurrentPlayerMission(
    @Param("missionId") missionId: string,
    @CurrentActor() actor: AuthActor | undefined
  ): Promise<PlayerMissionResponseBody> {
    const mission = await this.missionsService.acceptMission(
      requireCurrentPlayerId(actor),
      missionId
    );

    return toPlayerMissionResponseBody(mission);
  }

  @Post("players/:playerId/missions/:missionId/complete")
  async completeMission(
    @Param("playerId", ParseUUIDPipe) playerId: string,
    @Param("missionId") missionId: string
  ): Promise<MissionCompletionResponseBody> {
    const result = await this.missionsService.completeMission(playerId, missionId);
    return toMissionCompletionResponseBody(result);
  }

  @Post("me/missions/:missionId/complete")
  @UseGuards(AuthGuard)
  async completeCurrentPlayerMission(
    @Param("missionId") missionId: string,
    @CurrentActor() actor: AuthActor | undefined
  ): Promise<MissionCompletionResponseBody> {
    const result = await this.missionsService.completeMission(
      requireCurrentPlayerId(actor),
      missionId
    );

    return toMissionCompletionResponseBody(result);
  }
}
