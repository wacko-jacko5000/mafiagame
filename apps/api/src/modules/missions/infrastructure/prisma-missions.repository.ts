import { Inject, Injectable } from "@nestjs/common";

import { PrismaService } from "../../../platform/database/prisma.service";
import type { PlayerMissionSnapshot } from "../domain/missions.types";
import type {
  CreatePlayerMissionRecord,
  MissionsRepository,
  ResetPlayerMissionRecord
} from "../application/missions.repository";

interface PlayerMissionRecord {
  id: string;
  playerId: string;
  missionId: string;
  status: "active" | "completed";
  progress: number;
  targetProgress: number;
  acceptedAt: Date;
  completedAt: Date | null;
}

interface MissionsPrismaClient {
  playerMission: {
    findUnique(args: {
      where: {
        playerId_missionId: {
          playerId: string;
          missionId: string;
        };
      };
    }): Promise<PlayerMissionRecord | null>;
    findMany(args: {
      where: {
        playerId: string;
        status?: "active";
      };
      orderBy?: Array<{
        acceptedAt: "desc";
      }>;
    }): Promise<PlayerMissionRecord[]>;
    create(args: {
      data: {
        playerId: string;
        missionId: string;
        status: "active";
        progress: number;
        targetProgress: number;
        acceptedAt: Date;
        completedAt: null;
      };
    }): Promise<PlayerMissionRecord>;
    update(args: {
      where:
        | {
            id: string;
          }
        | {
            playerId_missionId: {
              playerId: string;
              missionId: string;
            };
          };
      data: {
        status?: "active" | "completed";
        progress?: number;
        targetProgress?: number;
        acceptedAt?: Date;
        completedAt?: Date | null;
      };
    }): Promise<PlayerMissionRecord>;
  };
}

function toPlayerMissionSnapshot(mission: PlayerMissionRecord): PlayerMissionSnapshot {
  return {
    id: mission.id,
    playerId: mission.playerId,
    missionId: mission.missionId,
    status: mission.status,
    progress: mission.progress,
    targetProgress: mission.targetProgress,
    acceptedAt: mission.acceptedAt,
    completedAt: mission.completedAt
  };
}

@Injectable()
export class PrismaMissionsRepository implements MissionsRepository {
  constructor(
    @Inject(PrismaService)
    private readonly prismaService: PrismaService
  ) {}

  async findByPlayerAndMissionId(
    playerId: string,
    missionId: string
  ): Promise<PlayerMissionSnapshot | null> {
    const prismaClient = this.prismaService as unknown as MissionsPrismaClient;
    const mission = await prismaClient.playerMission.findUnique({
      where: {
        playerId_missionId: {
          playerId,
          missionId
        }
      }
    });

    return mission ? toPlayerMissionSnapshot(mission) : null;
  }

  async listByPlayerId(playerId: string): Promise<PlayerMissionSnapshot[]> {
    const prismaClient = this.prismaService as unknown as MissionsPrismaClient;
    const missions = await prismaClient.playerMission.findMany({
      where: {
        playerId
      },
      orderBy: [
        {
          acceptedAt: "desc"
        }
      ]
    });

    return missions.map(toPlayerMissionSnapshot);
  }

  async listActiveByPlayerId(playerId: string): Promise<PlayerMissionSnapshot[]> {
    const prismaClient = this.prismaService as unknown as MissionsPrismaClient;
    const missions = await prismaClient.playerMission.findMany({
      where: {
        playerId,
        status: "active"
      }
    });

    return missions.map(toPlayerMissionSnapshot);
  }

  async createMission(
    record: CreatePlayerMissionRecord
  ): Promise<PlayerMissionSnapshot> {
    const prismaClient = this.prismaService as unknown as MissionsPrismaClient;
    const mission = await prismaClient.playerMission.create({
      data: {
        playerId: record.playerId,
        missionId: record.missionId,
        status: "active",
        progress: 0,
        targetProgress: record.targetProgress,
        acceptedAt: record.acceptedAt,
        completedAt: null
      }
    });

    return toPlayerMissionSnapshot(mission);
  }

  async resetMission(record: ResetPlayerMissionRecord): Promise<PlayerMissionSnapshot> {
    const prismaClient = this.prismaService as unknown as MissionsPrismaClient;
    const mission = await prismaClient.playerMission.update({
      where: {
        playerId_missionId: {
          playerId: record.playerId,
          missionId: record.missionId
        }
      },
      data: {
        status: "active",
        progress: 0,
        targetProgress: record.targetProgress,
        acceptedAt: record.acceptedAt,
        completedAt: null
      }
    });

    return toPlayerMissionSnapshot(mission);
  }

  async updateProgress(
    playerMissionId: string,
    progress: number
  ): Promise<PlayerMissionSnapshot> {
    const prismaClient = this.prismaService as unknown as MissionsPrismaClient;
    const mission = await prismaClient.playerMission.update({
      where: {
        id: playerMissionId
      },
      data: {
        progress
      }
    });

    return toPlayerMissionSnapshot(mission);
  }

  async markCompleted(
    playerMissionId: string,
    completedAt: Date
  ): Promise<PlayerMissionSnapshot> {
    const prismaClient = this.prismaService as unknown as MissionsPrismaClient;
    const mission = await prismaClient.playerMission.update({
      where: {
        id: playerMissionId
      },
      data: {
        status: "completed",
        completedAt
      }
    });

    return toPlayerMissionSnapshot(mission);
  }
}
