import { Inject, Injectable } from "@nestjs/common";

import { PrismaService } from "../../../platform/database/prisma.service";
import type { LeaderboardRepository } from "../application/leaderboard.repository";
import { compareLeaderboardMetricRecords } from "../domain/leaderboard.policy";
import type {
  LeaderboardId,
  LeaderboardMetricRecord
} from "../domain/leaderboard.types";

interface PlayerMetricRow {
  id: string;
  displayName: string;
  cash?: number;
  respect?: number;
  createdAt: Date;
}

interface PlayerAchievementCountRow {
  id: string;
  displayName: string;
  createdAt: Date;
  achievements: Array<{
    id: string;
  }>;
}

interface LeaderboardPrismaClient {
  player: {
    findMany(args: {
      select:
        | {
            id: true;
            displayName: true;
            cash: true;
            createdAt: true;
          }
        | {
            id: true;
            displayName: true;
            respect: true;
            createdAt: true;
          }
        | {
            id: true;
            displayName: true;
            createdAt: true;
            achievements: {
              where: {
                unlockedAt: {
                  not: null;
                };
              };
              select: {
                id: true;
              };
            };
          };
      orderBy?: Array<
        | {
            cash: "desc";
          }
        | {
            respect: "desc";
          }
        | {
            createdAt: "asc";
          }
        | {
            id: "asc";
          }
      >;
      take?: number;
    }): Promise<PlayerMetricRow[] | PlayerAchievementCountRow[]>;
  };
}

@Injectable()
export class PrismaLeaderboardRepository implements LeaderboardRepository {
  constructor(
    @Inject(PrismaService)
    private readonly prismaService: PrismaService
  ) {}

  async listLeaderboardRecords(
    leaderboardId: LeaderboardId,
    limit: number
  ): Promise<LeaderboardMetricRecord[]> {
    switch (leaderboardId) {
      case "richest_players":
        return this.listRichestPlayers(limit);
      case "most_respected_players":
        return this.listMostRespectedPlayers(limit);
      case "most_achievements_unlocked":
        return this.listPlayersByAchievementCount(limit);
    }
  }

  private async listRichestPlayers(limit: number): Promise<LeaderboardMetricRecord[]> {
    const prismaClient = this.prismaService as unknown as LeaderboardPrismaClient;
    const players = (await prismaClient.player.findMany({
      select: {
        id: true,
        displayName: true,
        cash: true,
        createdAt: true
      },
      orderBy: [
        {
          cash: "desc"
        },
        {
          createdAt: "asc"
        },
        {
          id: "asc"
        }
      ],
      take: limit
    })) as PlayerMetricRow[];

    return players.map((player) => ({
      playerId: player.id,
      displayName: player.displayName,
      createdAt: player.createdAt,
      metricValue: player.cash ?? 0
    }));
  }

  private async listMostRespectedPlayers(
    limit: number
  ): Promise<LeaderboardMetricRecord[]> {
    const prismaClient = this.prismaService as unknown as LeaderboardPrismaClient;
    const players = (await prismaClient.player.findMany({
      select: {
        id: true,
        displayName: true,
        respect: true,
        createdAt: true
      },
      orderBy: [
        {
          respect: "desc"
        },
        {
          createdAt: "asc"
        },
        {
          id: "asc"
        }
      ],
      take: limit
    })) as PlayerMetricRow[];

    return players.map((player) => ({
      playerId: player.id,
      displayName: player.displayName,
      createdAt: player.createdAt,
      metricValue: player.respect ?? 0
    }));
  }

  private async listPlayersByAchievementCount(
    limit: number
  ): Promise<LeaderboardMetricRecord[]> {
    const prismaClient = this.prismaService as unknown as LeaderboardPrismaClient;
    const players = (await prismaClient.player.findMany({
      select: {
        id: true,
        displayName: true,
        createdAt: true,
        achievements: {
          where: {
            unlockedAt: {
              not: null
            }
          },
          select: {
            id: true
          }
        }
      }
    })) as PlayerAchievementCountRow[];

    return players
      .map((player) => ({
        playerId: player.id,
        displayName: player.displayName,
        createdAt: player.createdAt,
        metricValue: player.achievements.length
      }))
      .sort(compareLeaderboardMetricRecords)
      .slice(0, limit);
  }
}
