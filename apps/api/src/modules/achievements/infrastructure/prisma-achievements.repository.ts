import { Inject, Injectable } from "@nestjs/common";

import { PrismaService } from "../../../platform/database/prisma.service";
import type { PlayerAchievementSnapshot } from "../domain/achievements.types";
import type {
  AchievementsRepository,
  CreatePlayerAchievementRecord,
  UpdatePlayerAchievementProgressRecord
} from "../application/achievements.repository";

interface PlayerAchievementRecord {
  id: string;
  playerId: string;
  achievementId: string;
  progress: number;
  targetProgress: number;
  unlockedAt: Date | null;
}

interface AchievementsPrismaClient {
  playerAchievement: {
    findMany(args: {
      where: {
        playerId: string;
      };
      orderBy?: Array<{
        achievementId: "asc";
      }>;
    }): Promise<PlayerAchievementRecord[]>;
    create(args: {
      data: {
        playerId: string;
        achievementId: string;
        progress: number;
        targetProgress: number;
        unlockedAt: Date | null;
      };
    }): Promise<PlayerAchievementRecord>;
    update(args: {
      where: {
        id: string;
      };
      data: {
        progress: number;
        targetProgress: number;
        unlockedAt: Date | null;
      };
    }): Promise<PlayerAchievementRecord>;
  };
}

function toPlayerAchievementSnapshot(
  achievement: PlayerAchievementRecord
): PlayerAchievementSnapshot {
  return {
    id: achievement.id,
    playerId: achievement.playerId,
    achievementId: achievement.achievementId,
    progress: achievement.progress,
    targetProgress: achievement.targetProgress,
    unlockedAt: achievement.unlockedAt
  };
}

@Injectable()
export class PrismaAchievementsRepository implements AchievementsRepository {
  constructor(
    @Inject(PrismaService)
    private readonly prismaService: PrismaService
  ) {}

  async listByPlayerId(playerId: string): Promise<PlayerAchievementSnapshot[]> {
    const prismaClient = this.prismaService as unknown as AchievementsPrismaClient;
    const achievements = await prismaClient.playerAchievement.findMany({
      where: {
        playerId
      },
      orderBy: [
        {
          achievementId: "asc"
        }
      ]
    });

    return achievements.map(toPlayerAchievementSnapshot);
  }

  async createAchievement(
    record: CreatePlayerAchievementRecord
  ): Promise<PlayerAchievementSnapshot> {
    const prismaClient = this.prismaService as unknown as AchievementsPrismaClient;
    const achievement = await prismaClient.playerAchievement.create({
      data: {
        playerId: record.playerId,
        achievementId: record.achievementId,
        progress: record.progress,
        targetProgress: record.targetProgress,
        unlockedAt: record.unlockedAt
      }
    });

    return toPlayerAchievementSnapshot(achievement);
  }

  async updateProgress(
    record: UpdatePlayerAchievementProgressRecord
  ): Promise<PlayerAchievementSnapshot> {
    const prismaClient = this.prismaService as unknown as AchievementsPrismaClient;
    const achievement = await prismaClient.playerAchievement.update({
      where: {
        id: record.playerAchievementId
      },
      data: {
        progress: record.progress,
        targetProgress: record.targetProgress,
        unlockedAt: record.unlockedAt
      }
    });

    return toPlayerAchievementSnapshot(achievement);
  }
}
