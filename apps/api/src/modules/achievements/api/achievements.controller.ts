import { Controller, Get, Inject, Param, ParseUUIDPipe } from "@nestjs/common";

import { AchievementsService } from "../application/achievements.service";
import type {
  AchievementDefinitionResponseBody,
  PlayerAchievementResponseBody
} from "./achievements.contracts";
import {
  toAchievementDefinitionResponseBody,
  toPlayerAchievementResponseBody
} from "./achievements.presenter";

@Controller()
export class AchievementsController {
  constructor(
    @Inject(AchievementsService)
    private readonly achievementsService: AchievementsService
  ) {}

  @Get("achievements")
  getAchievements(): AchievementDefinitionResponseBody[] {
    return this.achievementsService
      .listAchievements()
      .map(toAchievementDefinitionResponseBody);
  }

  @Get("players/:playerId/achievements")
  async getPlayerAchievements(
    @Param("playerId", ParseUUIDPipe) playerId: string
  ): Promise<PlayerAchievementResponseBody[]> {
    const achievements = await this.achievementsService.listPlayerAchievements(playerId);
    return achievements.map(toPlayerAchievementResponseBody);
  }
}
