import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException
} from "@nestjs/common";

import {
  getLeaderboardDefinition,
  leaderboardDefinitions
} from "../domain/leaderboard.catalog";
import type {
  LeaderboardDefinition,
  LeaderboardEntry,
  LeaderboardView
} from "../domain/leaderboard.types";
import {
  LEADERBOARD_REPOSITORY,
  type LeaderboardRepository
} from "./leaderboard.repository";

@Injectable()
export class LeaderboardService {
  constructor(
    @Inject(LEADERBOARD_REPOSITORY)
    private readonly leaderboardRepository: LeaderboardRepository
  ) {}

  listLeaderboards(): readonly LeaderboardDefinition[] {
    return leaderboardDefinitions;
  }

  async getLeaderboard(
    leaderboardId: string,
    requestedLimit?: number
  ): Promise<LeaderboardView> {
    const definition = getLeaderboardDefinition(leaderboardId);

    if (!definition) {
      throw new NotFoundException(`Leaderboard "${leaderboardId}" was not found.`);
    }

    const limit = this.normalizeLimit(requestedLimit, definition);
    const records = await this.leaderboardRepository.listLeaderboardRecords(
      definition.id,
      limit
    );

    return {
      definition,
      limit,
      entries: records.map<LeaderboardEntry>((record, index) => ({
        rank: index + 1,
        playerId: record.playerId,
        displayName: record.displayName,
        metricValue: record.metricValue
      }))
    };
  }

  private normalizeLimit(
    requestedLimit: number | undefined,
    definition: LeaderboardDefinition
  ): number {
    if (requestedLimit === undefined) {
      return definition.defaultLimit;
    }

    if (!Number.isInteger(requestedLimit) || requestedLimit <= 0) {
      throw new BadRequestException("Leaderboard limit must be a positive integer.");
    }

    return Math.min(requestedLimit, definition.maxLimit);
  }
}
