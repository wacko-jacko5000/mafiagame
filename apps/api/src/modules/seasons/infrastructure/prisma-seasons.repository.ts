import { Inject, Injectable } from "@nestjs/common";

import { PrismaService } from "../../../platform/database/prisma.service";
import type { SeasonsRepository } from "../application/seasons.repository";
import type { CreateSeasonInput, SeasonSnapshot } from "../domain/season.types";

interface SeasonRecord {
  id: string;
  name: string;
  status: "draft" | "active" | "inactive";
  startsAt: Date | null;
  endsAt: Date | null;
  activatedAt: Date | null;
  deactivatedAt: Date | null;
  createdAt: Date;
}

interface SeasonsPrismaDelegate {
  findMany(args: {
    orderBy: {
      createdAt: "asc" | "desc";
    };
  }): Promise<SeasonRecord[]>;
  findUnique(args: { where: { id: string } }): Promise<SeasonRecord | null>;
  findFirst(args: {
    where: { status: "active" };
    orderBy: { createdAt: "asc" | "desc" };
  }): Promise<SeasonRecord | null>;
  create(args: {
    data: {
      name: string;
      status: "draft";
      startsAt: Date | null;
      endsAt: Date | null;
    };
  }): Promise<SeasonRecord>;
  update(args: {
    where: { id: string };
    data: {
      status?: "active" | "inactive";
      activatedAt?: Date;
      deactivatedAt?: Date | null;
    };
  }): Promise<SeasonRecord>;
  updateMany(args: {
    where: { status?: "active" };
    data: {
      status?: "inactive";
      deactivatedAt?: Date;
    };
  }): Promise<{ count: number }>;
}

interface SeasonsPrismaTransaction {
  season: SeasonsPrismaDelegate;
}

interface SeasonsPrismaClient {
  season: SeasonsPrismaDelegate;
  $transaction<T>(callback: (tx: SeasonsPrismaTransaction) => Promise<T>): Promise<T>;
}

function toSeasonSnapshot(record: SeasonRecord): SeasonSnapshot {
  return {
    id: record.id,
    name: record.name,
    status: record.status,
    startsAt: record.startsAt,
    endsAt: record.endsAt,
    activatedAt: record.activatedAt,
    deactivatedAt: record.deactivatedAt,
    createdAt: record.createdAt
  };
}

@Injectable()
export class PrismaSeasonsRepository implements SeasonsRepository {
  constructor(
    @Inject(PrismaService)
    private readonly prismaService: PrismaService
  ) {}

  async listSeasons(): Promise<SeasonSnapshot[]> {
    const prismaClient = this.prismaService as unknown as SeasonsPrismaClient;
    const seasons = await prismaClient.season.findMany({
      orderBy: {
        createdAt: "desc"
      }
    });

    return seasons.map(toSeasonSnapshot);
  }

  async findSeasonById(seasonId: string): Promise<SeasonSnapshot | null> {
    const prismaClient = this.prismaService as unknown as SeasonsPrismaClient;
    const season = await prismaClient.season.findUnique({
      where: {
        id: seasonId
      }
    });

    return season ? toSeasonSnapshot(season) : null;
  }

  async findCurrentSeason(): Promise<SeasonSnapshot | null> {
    const prismaClient = this.prismaService as unknown as SeasonsPrismaClient;
    const season = await prismaClient.season.findFirst({
      where: {
        status: "active"
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return season ? toSeasonSnapshot(season) : null;
  }

  async createSeason(input: CreateSeasonInput): Promise<SeasonSnapshot> {
    const prismaClient = this.prismaService as unknown as SeasonsPrismaClient;
    const season = await prismaClient.season.create({
      data: {
        name: input.name,
        status: "draft",
        startsAt: input.startsAt,
        endsAt: input.endsAt
      }
    });

    return toSeasonSnapshot(season);
  }

  async activateSeason(seasonId: string, activatedAt: Date): Promise<SeasonSnapshot | null> {
    const prismaClient = this.prismaService as unknown as SeasonsPrismaClient;

    return prismaClient.$transaction(async (tx) => {
      const season = await tx.season.findUnique({
        where: {
          id: seasonId
        }
      });

      if (!season) {
        return null;
      }

      if (season.status === "active") {
        return toSeasonSnapshot(season);
      }

      await tx.season.updateMany({
        where: {
          status: "active"
        },
        data: {
          status: "inactive",
          deactivatedAt: activatedAt
        }
      });

      const activatedSeason = await tx.season.update({
        where: {
          id: seasonId
        },
        data: {
          status: "active",
          activatedAt,
          deactivatedAt: null
        }
      });

      return toSeasonSnapshot(activatedSeason);
    });
  }

  async deactivateSeason(
    seasonId: string,
    deactivatedAt: Date
  ): Promise<SeasonSnapshot | null> {
    const prismaClient = this.prismaService as unknown as SeasonsPrismaClient;

    return prismaClient.$transaction(async (tx) => {
      const season = await tx.season.findUnique({
        where: {
          id: seasonId
        }
      });

      if (!season) {
        return null;
      }

      const deactivatedSeason = await tx.season.update({
        where: {
          id: seasonId
        },
        data: {
          status: "inactive",
          deactivatedAt
        }
      });

      return toSeasonSnapshot(deactivatedSeason);
    });
  }
}
