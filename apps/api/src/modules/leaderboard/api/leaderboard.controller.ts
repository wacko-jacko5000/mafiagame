import {
  BadRequestException,
  Controller,
  Get,
  Inject,
  Param,
  Query
} from "@nestjs/common";

import { LeaderboardService } from "../application/leaderboard.service";
import type {
  LeaderboardDefinitionResponseBody,
  LeaderboardResponseBody
} from "./leaderboard.contracts";
import {
  toLeaderboardDefinitionResponseBody,
  toLeaderboardResponseBody
} from "./leaderboard.presenter";

@Controller("leaderboards")
export class LeaderboardController {
  constructor(
    @Inject(LeaderboardService)
    private readonly leaderboardService: LeaderboardService
  ) {}

  @Get()
  getLeaderboards(): LeaderboardDefinitionResponseBody[] {
    return this.leaderboardService
      .listLeaderboards()
      .map(toLeaderboardDefinitionResponseBody);
  }

  @Get(":leaderboardId")
  async getLeaderboard(
    @Param("leaderboardId") leaderboardId: string,
    @Query("limit") limit?: string
  ): Promise<LeaderboardResponseBody> {
    const parsedLimit = parseOptionalPositiveInteger(limit);
    const leaderboard = await this.leaderboardService.getLeaderboard(
      leaderboardId,
      parsedLimit
    );

    return toLeaderboardResponseBody(leaderboard);
  }
}

function parseOptionalPositiveInteger(value: string | undefined): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw new BadRequestException("Leaderboard limit must be a positive integer.");
  }

  return parsedValue;
}
