import { Inject, Injectable } from "@nestjs/common";
import type { Player } from "@prisma/client";

import { PrismaService } from "../../../platform/database/prisma.service";
import { InvalidPlayerResourceDeltaError } from "../domain/player.errors";
import { playerEnergyRecoveryRules } from "../domain/player.constants";
import { regeneratePlayerEnergy } from "../domain/player.policy";
import type {
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
    health: player.health,
    jailedUntil: player.jailedUntil,
    hospitalizedUntil: player.hospitalizedUntil,
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

      const syncedPlayer = await this.synchronizeEnergy(tx, player, now);
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

      const syncedPlayer = await this.synchronizeEnergy(tx, player, now);
      const nextState = {
        cash: syncedPlayer.cash + (delta.cash ?? 0),
        respect: syncedPlayer.respect + (delta.respect ?? 0),
        energy: Math.min(
          playerEnergyRecoveryRules.maxEnergy,
          syncedPlayer.energy + (delta.energy ?? 0)
        ),
        health: syncedPlayer.health + (delta.health ?? 0)
      };

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
          energyUpdatedAt:
            delta.energy === undefined ? syncedPlayer.energyUpdatedAt : now
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
}
