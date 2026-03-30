import { Inject, Injectable } from "@nestjs/common";
import type { Player } from "@prisma/client";

import { PrismaService } from "../../../platform/database/prisma.service";
import { InvalidPlayerResourceDeltaError } from "../domain/player.errors";
import { playerEnergyRecoveryRules, playerHeatDecayRules } from "../domain/player.constants";
import {
  derivePlayerProgression,
  regeneratePlayerEnergy,
  decayPlayerHeat
} from "../domain/player.policy";
import type {
  PlayerCustodyBuyoutInput,
  PlayerCustodyEntryInput,
  PlayerCreationValues,
  PlayerCustodyStatusUpdate,
  PlayerResourceDelta,
  PlayerSnapshot
} from "../domain/player.types";
import type { PlayerRepository } from "../application/player.repository";

interface PlayerPersistenceClient {
  player: {
    findUnique: PrismaService["player"]["findUnique"];
    update: PrismaService["player"]["update"];
    updateMany: PrismaService["player"]["updateMany"];
  };
}

function toPlayerSnapshot(player: Player): PlayerSnapshot {
  return {
    id: player.id,
    accountId: player.accountId,
    displayName: player.displayName,
    cash: player.cash,
    respect: player.respect,
    energy: player.energy,
    energyUpdatedAt: player.energyUpdatedAt,
    heat: player.heat,
    heatUpdatedAt: player.heatUpdatedAt,
    health: player.health,
    jailedUntil: player.jailedUntil,
    hospitalizedUntil: player.hospitalizedUntil,
    jailEntryCount: player.jailEntryCount ?? 0,
    hospitalEntryCount: player.hospitalEntryCount ?? 0,
    jailReason: player.jailReason ?? null,
    hospitalReason: player.hospitalReason ?? null,
    createdAt: player.createdAt,
    updatedAt: player.updatedAt
  };
}

@Injectable()
export class PrismaPlayerRepository implements PlayerRepository {
  constructor(
    @Inject(PrismaService)
    private readonly prismaService: PrismaService
  ) {}

  async create(values: PlayerCreationValues): Promise<PlayerSnapshot> {
    const player = await this.prismaService.player.create({
      data: values
    });

    return toPlayerSnapshot(player);
  }

  async findById(playerId: string, now = new Date()): Promise<PlayerSnapshot | null> {
    return this.prismaService.$transaction(async (tx) => {
      const player = await tx.player.findUnique({
        where: {
          id: playerId
        }
      });

      if (!player) {
        return null;
      }

      const syncedPlayer = await this.synchronizeCustody(
        tx,
        await this.synchronizeHeat(tx, await this.synchronizeEnergy(tx, player, now), now),
        now
      );
      return toPlayerSnapshot(syncedPlayer);
    });
  }

  async findByAccountId(accountId: string): Promise<PlayerSnapshot | null> {
    const player = await this.prismaService.player.findUnique({
      where: {
        accountId
      }
    });

    return player ? toPlayerSnapshot(player) : null;
  }

  async findByDisplayName(displayName: string): Promise<PlayerSnapshot | null> {
    const player = await this.prismaService.player.findUnique({
      where: {
        displayName
      }
    });

    return player ? toPlayerSnapshot(player) : null;
  }

  async applyResourceDelta(
    playerId: string,
    delta: PlayerResourceDelta,
    now = new Date()
  ): Promise<PlayerSnapshot | null> {
    return this.prismaService.$transaction(async (tx) => {
      const player = await tx.player.findUnique({
        where: {
          id: playerId
        }
      });

      if (!player) {
        return null;
      }

      const syncedPlayer = await this.synchronizeCustody(
        tx,
        await this.synchronizeHeat(tx, await this.synchronizeEnergy(tx, player, now), now),
        now
      );
      const previousLevel = derivePlayerProgression(syncedPlayer.respect).level;
      const nextState = {
        cash: syncedPlayer.cash + (delta.cash ?? 0),
        respect: syncedPlayer.respect + (delta.respect ?? 0),
        energy: Math.min(
          playerEnergyRecoveryRules.maxEnergy,
          syncedPlayer.energy + (delta.energy ?? 0)
        ),
        heat: Math.min(
          playerHeatDecayRules.maxHeat,
          Math.max(0, (syncedPlayer.heat ?? 0) + (delta.heat ?? 0))
        ),
        health: syncedPlayer.health + (delta.health ?? 0)
      };
      const nextLevel = derivePlayerProgression(nextState.respect).level;
      const resetCustodyEscalation = nextLevel > previousLevel;

      if (
        nextState.cash < 0 ||
        nextState.respect < 0 ||
        nextState.energy < 0 ||
        nextState.health < 0
      ) {
        throw new InvalidPlayerResourceDeltaError(
          "Player resource changes cannot make cash, respect, energy, or health negative."
        );
      }

      const updatedPlayer = await tx.player.update({
        where: {
          id: playerId
        },
        data: {
          ...nextState,
          ...(resetCustodyEscalation
            ? {
                jailEntryCount: 0,
                hospitalEntryCount: 0
              }
            : {}),
          energyUpdatedAt:
            delta.energy === undefined ? syncedPlayer.energyUpdatedAt : now,
          heatUpdatedAt:
            delta.heat === undefined ? syncedPlayer.heatUpdatedAt : now
        }
      });

      return toPlayerSnapshot(updatedPlayer);
    });
  }

  async updateCustodyStatus(
    playerId: string,
    status: PlayerCustodyStatusUpdate
  ): Promise<PlayerSnapshot | null> {
    try {
      const updatedPlayer = await this.prismaService.player.update({
        where: {
          id: playerId
        },
        data: status
      });

      return toPlayerSnapshot(updatedPlayer);
    } catch {
      return null;
    }
  }

  async applyCustodyEntry(
    playerId: string,
    input: PlayerCustodyEntryInput
  ): Promise<PlayerSnapshot | null> {
    try {
      const updatedPlayer = await this.prismaService.player.update({
        where: {
          id: playerId
        },
        data:
          input.statusType === "jail"
            ? {
                jailedUntil: input.until,
                jailReason: input.reason,
                jailEntryCount: {
                  increment: 1
                }
              }
            : {
                hospitalizedUntil: input.until,
                hospitalReason: input.reason,
                hospitalEntryCount: {
                  increment: 1
                }
              }
      });

      return toPlayerSnapshot(updatedPlayer);
    } catch {
      return null;
    }
  }

  async buyOutCustodyStatus(
    playerId: string,
    input: PlayerCustodyBuyoutInput
  ): Promise<PlayerSnapshot | null> {
    return this.prismaService.$transaction(async (tx) => {
      const updateResult = await tx.player.updateMany({
        where:
          input.statusType === "jail"
            ? {
                id: playerId,
                cash: {
                  gte: input.buyoutPrice
                },
                jailedUntil: {
                  gt: input.now
                }
              }
            : {
                id: playerId,
                cash: {
                  gte: input.buyoutPrice
                },
                hospitalizedUntil: {
                  gt: input.now
                }
              },
        data:
          input.statusType === "jail"
            ? {
                cash: {
                  decrement: input.buyoutPrice
                },
                jailedUntil: null,
                jailReason: null
              }
            : {
                cash: {
                  decrement: input.buyoutPrice
                },
                hospitalizedUntil: null,
                hospitalReason: null
              }
      });

      if (updateResult.count === 0) {
        return null;
      }

      const updatedPlayer = await tx.player.findUnique({
        where: {
          id: playerId
        }
      });

      return updatedPlayer ? toPlayerSnapshot(updatedPlayer) : null;
    });
  }

  private async synchronizeEnergy(
    tx: PlayerPersistenceClient,
    player: Player,
    now: Date
  ): Promise<Player> {
    const regeneratedEnergy = regeneratePlayerEnergy(player, now);
    const needsEnergySync =
      regeneratedEnergy.energy !== player.energy ||
      regeneratedEnergy.energyUpdatedAt.getTime() !== player.energyUpdatedAt.getTime();

    if (!needsEnergySync) {
      return player;
    }

    return tx.player.update({
      where: {
        id: player.id
      },
      data: {
        energy: regeneratedEnergy.energy,
        energyUpdatedAt: regeneratedEnergy.energyUpdatedAt
      }
    });
  }

  private async synchronizeHeat(
    tx: PlayerPersistenceClient,
    player: Player,
    now: Date
  ): Promise<Player> {
    const decayed = decayPlayerHeat(player, now);
    const needsHeatSync =
      decayed.heat !== player.heat ||
      decayed.heatUpdatedAt.getTime() !== player.heatUpdatedAt.getTime();

    if (!needsHeatSync) {
      return player;
    }

    return tx.player.update({
      where: {
        id: player.id
      },
      data: {
        heat: decayed.heat,
        heatUpdatedAt: decayed.heatUpdatedAt
      }
    });
  }

  private async synchronizeCustody(
    tx: PlayerPersistenceClient,
    player: Player,
    now: Date
  ): Promise<Player> {
    const jailExpired =
      player.jailedUntil !== null && player.jailedUntil.getTime() <= now.getTime();
    const hospitalExpired =
      player.hospitalizedUntil !== null &&
      player.hospitalizedUntil.getTime() <= now.getTime();

    if (!jailExpired && !hospitalExpired) {
      return player;
    }

    return tx.player.update({
      where: {
        id: player.id
      },
      data: {
        ...(jailExpired
          ? {
              jailedUntil: null,
              jailReason: null
            }
          : {}),
        ...(hospitalExpired
          ? {
              hospitalizedUntil: null,
              hospitalReason: null
            }
          : {})
      }
    });
  }
}
