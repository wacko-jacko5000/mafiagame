import { Inject, Injectable } from "@nestjs/common";

import { PrismaService } from "../../../platform/database/prisma.service";
import type { TerritoryRepository } from "../application/territory.repository";
import type {
  ClaimDistrictCommand,
  DistrictControlSnapshot,
  DistrictWarSnapshot,
  DistrictWithControlSnapshot
} from "../domain/territory.types";

interface DistrictControlRecord {
  id: string;
  districtId: string;
  gangId: string;
  capturedAt: Date;
  lastPayoutClaimedAt: Date | null;
}

interface DistrictRecord {
  id: string;
  name: string;
  payoutAmount: number;
  payoutCooldownMinutes: number;
  createdAt: Date;
  control: DistrictControlRecord | null;
  wars?: DistrictWarRecord[];
}

interface DistrictWarRecord {
  id: string;
  districtId: string;
  attackerGangId: string;
  defenderGangId: string;
  startedByPlayerId: string;
  status: "pending" | "resolved";
  createdAt: Date;
  resolvedAt: Date | null;
  winningGangId: string | null;
}

interface TerritoryPrismaTransaction {
  district: {
    findUnique(args: {
      where: { id: string };
      include: { control: true; wars: { where: { status: "pending" }; orderBy: { createdAt: "desc" } } };
    }): Promise<DistrictRecord | null>;
  };
  districtControl: {
    upsert(args: {
      where: { districtId: string };
      create: {
        districtId: string;
        gangId: string;
        capturedAt: Date;
        lastPayoutClaimedAt?: Date | null;
      };
      update: {
        gangId: string;
        capturedAt: Date;
        lastPayoutClaimedAt?: Date | null;
      };
    }): Promise<DistrictControlRecord>;
    updateMany(args: {
      where: {
        districtId: string;
        gangId: string;
        OR: Array<
          | { lastPayoutClaimedAt: null }
          | { lastPayoutClaimedAt: { lte: Date } }
        >;
      };
      data: { lastPayoutClaimedAt: Date };
    }): Promise<{ count: number }>;
  };
  districtWar: {
    create(args: {
      data: {
        districtId: string;
        attackerGangId: string;
        defenderGangId: string;
        startedByPlayerId: string;
        status: "pending";
      };
    }): Promise<DistrictWarRecord>;
    findUnique(args: { where: { id: string } }): Promise<DistrictWarRecord | null>;
    update(args: {
      where: { id: string };
      data: {
        status: "resolved";
        resolvedAt: Date;
        winningGangId: string;
      };
    }): Promise<DistrictWarRecord>;
    findFirst(args: {
      where: { districtId: string; status: "pending" };
      orderBy: { createdAt: "asc" | "desc" };
    }): Promise<DistrictWarRecord | null>;
  };
}

interface TerritoryPrismaClient {
  district: {
    findMany(args: {
      include: {
        control: true;
        wars: { where: { status: "pending" }; orderBy: { createdAt: "desc" } };
      };
      orderBy: { createdAt: "asc" | "desc" };
    }): Promise<DistrictRecord[]>;
    findUnique(args: {
      where: { id: string };
      include: {
        control: true;
        wars: { where: { status: "pending" }; orderBy: { createdAt: "desc" } };
      };
    }): Promise<DistrictRecord | null>;
    update(args: {
      where: { id: string };
      data: {
        payoutAmount: number;
        payoutCooldownMinutes: number;
      };
      include: {
        control: true;
        wars: { where: { status: "pending" }; orderBy: { createdAt: "desc" } };
      };
    }): Promise<DistrictRecord>;
  };
  districtWar: {
    findUnique(args: { where: { id: string } }): Promise<DistrictWarRecord | null>;
    findFirst(args: {
      where: { districtId: string; status: "pending" };
      orderBy: { createdAt: "asc" | "desc" };
    }): Promise<DistrictWarRecord | null>;
  };
  $transaction<T>(callback: (tx: TerritoryPrismaTransaction) => Promise<T>): Promise<T>;
}

function toDistrictWithControlSnapshot(
  district: DistrictRecord
): DistrictWithControlSnapshot {
  return {
    id: district.id,
    name: district.name,
    payoutAmount: district.payoutAmount,
    payoutCooldownMinutes: district.payoutCooldownMinutes,
    createdAt: district.createdAt,
    control: district.control
      ? {
          id: district.control.id,
          districtId: district.control.districtId,
          gangId: district.control.gangId,
          capturedAt: district.control.capturedAt,
          lastPayoutClaimedAt: district.control.lastPayoutClaimedAt
        }
      : null,
    activeWar: district.wars?.[0] ? toDistrictWarSnapshot(district.wars[0]) : null
  };
}

function toDistrictControlSnapshot(
  control: DistrictControlRecord
): DistrictControlSnapshot {
  return {
    id: control.id,
    districtId: control.districtId,
    gangId: control.gangId,
    capturedAt: control.capturedAt,
    lastPayoutClaimedAt: control.lastPayoutClaimedAt
  };
}

function toDistrictWarSnapshot(war: DistrictWarRecord): DistrictWarSnapshot {
  return {
    id: war.id,
    districtId: war.districtId,
    attackerGangId: war.attackerGangId,
    defenderGangId: war.defenderGangId,
    startedByPlayerId: war.startedByPlayerId,
    status: war.status,
    createdAt: war.createdAt,
    resolvedAt: war.resolvedAt,
    winningGangId: war.winningGangId
  };
}

@Injectable()
export class PrismaTerritoryRepository implements TerritoryRepository {
  constructor(
    @Inject(PrismaService)
    private readonly prismaService: PrismaService
  ) {}

  async listDistricts(): Promise<DistrictWithControlSnapshot[]> {
    const prismaClient = this.prismaService as unknown as TerritoryPrismaClient;
    const districts = await prismaClient.district.findMany({
      include: {
        control: true,
        wars: {
          where: {
            status: "pending"
          },
          orderBy: {
            createdAt: "desc"
          }
        }
      },
      orderBy: {
        createdAt: "asc"
      }
    });

    return districts.map(toDistrictWithControlSnapshot);
  }

  async findDistrictById(districtId: string): Promise<DistrictWithControlSnapshot | null> {
    const prismaClient = this.prismaService as unknown as TerritoryPrismaClient;
    const district = await prismaClient.district.findUnique({
      where: {
        id: districtId
      },
      include: {
        control: true,
        wars: {
          where: {
            status: "pending"
          },
          orderBy: {
            createdAt: "desc"
          }
        }
      }
    });

    return district ? toDistrictWithControlSnapshot(district) : null;
  }

  async updateDistrictBalance(command: {
    districtId: string;
    payoutAmount: number;
    payoutCooldownMinutes: number;
  }): Promise<DistrictWithControlSnapshot | null> {
    const prismaClient = this.prismaService as unknown as TerritoryPrismaClient;

    try {
      const district = await prismaClient.district.update({
        where: {
          id: command.districtId
        },
        data: {
          payoutAmount: command.payoutAmount,
          payoutCooldownMinutes: command.payoutCooldownMinutes
        },
        include: {
          control: true,
          wars: {
            where: {
              status: "pending"
            },
            orderBy: {
              createdAt: "desc"
            }
          }
        }
      });

      return toDistrictWithControlSnapshot(district);
    } catch {
      return null;
    }
  }

  async claimDistrict(command: ClaimDistrictCommand): Promise<DistrictControlSnapshot | null> {
    const prismaClient = this.prismaService as unknown as TerritoryPrismaClient;

    return prismaClient.$transaction(async (tx: TerritoryPrismaTransaction) => {
      const district = await tx.district.findUnique({
        where: {
          id: command.districtId
        },
        include: {
          control: true,
          wars: {
            where: {
              status: "pending"
            },
            orderBy: {
              createdAt: "desc"
            }
          }
        }
      });

      if (!district) {
        return null;
      }

      const control = await tx.districtControl.upsert({
        where: {
          districtId: command.districtId
        },
        create: {
          districtId: command.districtId,
          gangId: command.gangId,
          capturedAt: new Date(),
          lastPayoutClaimedAt: null
        },
        update: {
          gangId: command.gangId,
          capturedAt: new Date(),
          lastPayoutClaimedAt: null
        }
      });

      return toDistrictControlSnapshot(control);
    });
  }

  async claimDistrictPayout(command: {
    districtId: string;
    gangId: string;
    claimedAt: Date;
    latestEligibleClaimedAt: Date;
  }): Promise<
    | "claimed"
    | "district_not_found"
    | "district_uncontrolled"
    | "gang_not_controller"
    | "cooldown_not_elapsed"
  > {
    const prismaClient = this.prismaService as unknown as TerritoryPrismaClient;

    return prismaClient.$transaction(async (tx: TerritoryPrismaTransaction) => {
      const district = await tx.district.findUnique({
        where: {
          id: command.districtId
        },
        include: {
          control: true,
          wars: {
            where: {
              status: "pending"
            },
            orderBy: {
              createdAt: "desc"
            }
          }
        }
      });

      if (!district) {
        return "district_not_found";
      }

      if (!district.control) {
        return "district_uncontrolled";
      }

      if (district.control.gangId !== command.gangId) {
        return "gang_not_controller";
      }

      const result = await tx.districtControl.updateMany({
        where: {
          districtId: command.districtId,
          gangId: command.gangId,
          OR: [
            {
              lastPayoutClaimedAt: null
            },
            {
              lastPayoutClaimedAt: {
                lte: command.latestEligibleClaimedAt
              }
            }
          ]
        },
        data: {
          lastPayoutClaimedAt: command.claimedAt
        }
      });

      return result.count === 1 ? "claimed" : "cooldown_not_elapsed";
    });
  }

  async findActiveWarByDistrictId(districtId: string): Promise<DistrictWarSnapshot | null> {
    const prismaClient = this.prismaService as unknown as TerritoryPrismaClient;
    const war = await prismaClient.districtWar.findFirst({
      where: {
        districtId,
        status: "pending"
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return war ? toDistrictWarSnapshot(war) : null;
  }

  async findWarById(warId: string): Promise<DistrictWarSnapshot | null> {
    const prismaClient = this.prismaService as unknown as TerritoryPrismaClient;
    const war = await prismaClient.districtWar.findUnique({
      where: {
        id: warId
      }
    });

    return war ? toDistrictWarSnapshot(war) : null;
  }

  async startWar(command: {
    districtId: string;
    attackerGangId: string;
    defenderGangId: string;
    startedByPlayerId: string;
  }): Promise<DistrictWarSnapshot | null> {
    const prismaClient = this.prismaService as unknown as TerritoryPrismaClient;

    return prismaClient.$transaction(async (tx: TerritoryPrismaTransaction) => {
      const district = await tx.district.findUnique({
        where: {
          id: command.districtId
        },
        include: {
          control: true,
          wars: {
            where: {
              status: "pending"
            },
            orderBy: {
              createdAt: "desc"
            }
          }
        }
      });

      if (!district) {
        return null;
      }

      const war = await tx.districtWar.create({
        data: {
          districtId: command.districtId,
          attackerGangId: command.attackerGangId,
          defenderGangId: command.defenderGangId,
          startedByPlayerId: command.startedByPlayerId,
          status: "pending"
        }
      });

      return toDistrictWarSnapshot(war);
    });
  }

  async resolveWar(command: {
    warId: string;
    winningGangId: string;
  }): Promise<DistrictWarSnapshot | null> {
    const prismaClient = this.prismaService as unknown as TerritoryPrismaClient;

    return prismaClient.$transaction(async (tx: TerritoryPrismaTransaction) => {
      const war = await tx.districtWar.findUnique({
        where: {
          id: command.warId
        }
      });

      if (!war) {
        return null;
      }

      await tx.districtControl.upsert({
        where: {
          districtId: war.districtId
        },
        create: {
          districtId: war.districtId,
          gangId: command.winningGangId,
          capturedAt: new Date(),
          lastPayoutClaimedAt: null
        },
        update: {
          gangId: command.winningGangId,
          capturedAt: new Date(),
          lastPayoutClaimedAt: null
        }
      });

      const resolvedWar = await tx.districtWar.update({
        where: {
          id: command.warId
        },
        data: {
          status: "resolved",
          resolvedAt: new Date(),
          winningGangId: command.winningGangId
        }
      });

      return toDistrictWarSnapshot(resolvedWar);
    });
  }
}
