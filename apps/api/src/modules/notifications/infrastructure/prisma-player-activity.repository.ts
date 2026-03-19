import { Inject, Injectable } from "@nestjs/common";

import { PrismaService } from "../../../platform/database/prisma.service";
import type { CreatePlayerActivity, PlayerActivitySnapshot } from "../domain/player-activity.types";
import type { PlayerActivityRepository } from "../application/player-activity.repository";

interface PlayerActivityRecord {
  id: string;
  playerId: string;
  type: PlayerActivitySnapshot["type"];
  title: string;
  body: string;
  createdAt: Date;
  readAt: Date | null;
}

interface PlayerActivityPrismaClient {
  playerActivity: {
    create(args: {
      data: {
        playerId: string;
        type: PlayerActivitySnapshot["type"];
        title: string;
        body: string;
        createdAt: Date;
      };
    }): Promise<PlayerActivityRecord>;
    findMany(args: {
      where: {
        playerId: string;
      };
      orderBy: Array<{
        createdAt?: "desc";
        id?: "desc";
      }>;
      take: number;
    }): Promise<PlayerActivityRecord[]>;
    findFirst(args: {
      where: {
        id: string;
        playerId: string;
      };
    }): Promise<PlayerActivityRecord | null>;
    update(args: {
      where: {
        id: string;
      };
      data: {
        readAt: Date;
      };
    }): Promise<PlayerActivityRecord>;
  };
}

function toSnapshot(activity: PlayerActivityRecord): PlayerActivitySnapshot {
  return {
    id: activity.id,
    playerId: activity.playerId,
    type: activity.type,
    title: activity.title,
    body: activity.body,
    createdAt: activity.createdAt,
    readAt: activity.readAt
  };
}

@Injectable()
export class PrismaPlayerActivityRepository implements PlayerActivityRepository {
  constructor(
    @Inject(PrismaService)
    private readonly prismaService: PrismaService
  ) {}

  async createActivity(activity: CreatePlayerActivity): Promise<PlayerActivitySnapshot> {
    const prismaClient = this.prismaService as unknown as PlayerActivityPrismaClient;
    const created = await prismaClient.playerActivity.create({
      data: {
        playerId: activity.playerId,
        type: activity.type,
        title: activity.title,
        body: activity.body,
        createdAt: activity.createdAt
      }
    });

    return toSnapshot(created);
  }

  async listByPlayerId(playerId: string, limit: number): Promise<PlayerActivitySnapshot[]> {
    const prismaClient = this.prismaService as unknown as PlayerActivityPrismaClient;
    const activities = await prismaClient.playerActivity.findMany({
      where: {
        playerId
      },
      orderBy: [
        {
          createdAt: "desc"
        },
        {
          id: "desc"
        }
      ],
      take: limit
    });

    return activities.map(toSnapshot);
  }

  async markAsRead(
    playerId: string,
    activityId: string,
    readAt: Date
  ): Promise<PlayerActivitySnapshot | null> {
    const prismaClient = this.prismaService as unknown as PlayerActivityPrismaClient;
    const existing = await prismaClient.playerActivity.findFirst({
      where: {
        id: activityId,
        playerId
      }
    });

    if (!existing) {
      return null;
    }

    if (existing.readAt) {
      return toSnapshot(existing);
    }

    const updated = await prismaClient.playerActivity.update({
      where: {
        id: activityId
      },
      data: {
        readAt
      }
    });

    return toSnapshot(updated);
  }
}
