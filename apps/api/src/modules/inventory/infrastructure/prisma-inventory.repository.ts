import { Inject, Injectable } from "@nestjs/common";

import { PrismaService } from "../../../platform/database/prisma.service";
import { InsufficientCashForItemError } from "../domain/inventory.errors";
import { toInventoryListItem } from "../domain/inventory.policy";
import type {
  EquipInventoryItemCommand,
  PlayerInventoryItemSnapshot,
  PurchaseInventoryItemCommand,
  PurchaseInventoryItemResult
} from "../domain/inventory.types";
import type { InventoryRepository } from "../application/inventory.repository";

interface PlayerInventoryItemRecord {
  id: string;
  playerId: string;
  itemId: string;
  equippedSlot: "weapon" | "armor" | null;
  marketListingId: string | null;
  acquiredAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface InventoryPrismaTransaction {
  player: {
    findUnique(args: { where: { id: string } }): Promise<{ id: string; cash: number } | null>;
    update(args: {
      where: { id: string };
      data: { cash: number };
    }): Promise<{ id: string; cash: number }>;
  };
  playerInventoryItem: {
    findUnique(args: {
      where: { id: string };
    }): Promise<PlayerInventoryItemRecord | null>;
    findMany(args: {
      where: { playerId: string };
      orderBy: { acquiredAt: "asc" | "desc" };
    }): Promise<PlayerInventoryItemRecord[]>;
    update(args: {
      where: { id: string };
      data: { equippedSlot: "weapon" | "armor" | null };
    }): Promise<PlayerInventoryItemRecord>;
    updateMany(args: {
      where: { playerId: string; equippedSlot: "weapon" | "armor" };
      data: { equippedSlot: null };
    }): Promise<{ count: number }>;
    create(args: {
      data: { playerId: string; itemId: string };
    }): Promise<PlayerInventoryItemRecord>;
  };
}

interface InventoryPrismaClient {
  playerInventoryItem: {
    findUnique(args: {
      where: { id: string };
    }): Promise<PlayerInventoryItemRecord | null>;
    findMany(args: {
      where: { playerId: string };
      orderBy: { acquiredAt: "asc" | "desc" };
    }): Promise<PlayerInventoryItemRecord[]>;
  };
  $transaction<T>(callback: (tx: InventoryPrismaTransaction) => Promise<T>): Promise<T>;
}

function toPlayerInventoryItemSnapshot(
  ownedItem: PlayerInventoryItemRecord
): PlayerInventoryItemSnapshot {
  return {
    id: ownedItem.id,
    playerId: ownedItem.playerId,
    itemId: ownedItem.itemId,
    equippedSlot: ownedItem.equippedSlot,
    marketListingId: ownedItem.marketListingId,
    acquiredAt: ownedItem.acquiredAt,
    createdAt: ownedItem.createdAt,
    updatedAt: ownedItem.updatedAt
  };
}

@Injectable()
export class PrismaInventoryRepository implements InventoryRepository {
  constructor(
    @Inject(PrismaService)
    private readonly prismaService: PrismaService
  ) {}

  async listPlayerItems(playerId: string): Promise<PlayerInventoryItemSnapshot[]> {
    const prismaClient = this.prismaService as unknown as InventoryPrismaClient;
    const ownedItems = await prismaClient.playerInventoryItem.findMany({
      where: {
        playerId
      },
      orderBy: {
        acquiredAt: "asc"
      }
    });

    return ownedItems.map(toPlayerInventoryItemSnapshot);
  }

  async findPlayerItemById(
    playerId: string,
    inventoryItemId: string
  ): Promise<PlayerInventoryItemSnapshot | null> {
    const prismaClient = this.prismaService as unknown as InventoryPrismaClient;
    const ownedItem = await prismaClient.playerInventoryItem.findUnique({
      where: {
        id: inventoryItemId
      }
    });

    if (!ownedItem || ownedItem.playerId !== playerId) {
      return null;
    }

    return toPlayerInventoryItemSnapshot(ownedItem);
  }

  async purchaseItem(
    command: PurchaseInventoryItemCommand
  ): Promise<PurchaseInventoryItemResult | null> {
    const prismaClient = this.prismaService as unknown as InventoryPrismaClient;

    return prismaClient.$transaction(async (tx: InventoryPrismaTransaction) => {
      const player = await tx.player.findUnique({
        where: {
          id: command.playerId
        }
      });

      if (!player) {
        return null;
      }

      if (player.cash < command.item.price) {
        throw new InsufficientCashForItemError(command.item.id);
      }

      const updatedPlayer = await tx.player.update({
        where: {
          id: command.playerId
        },
        data: {
          cash: player.cash - command.item.price
        }
      });

      const ownedItem = await tx.playerInventoryItem.create({
        data: {
          playerId: command.playerId,
          itemId: command.item.id
        }
      });

      return {
        playerCashAfterPurchase: updatedPlayer.cash,
        ownedItem: toInventoryListItem(
          toPlayerInventoryItemSnapshot(ownedItem),
          command.item
        )
      };
    });
  }

  async equipItem(command: EquipInventoryItemCommand): Promise<PlayerInventoryItemSnapshot | null> {
    const prismaClient = this.prismaService as unknown as InventoryPrismaClient;

    return prismaClient.$transaction(async (tx: InventoryPrismaTransaction) => {
      const ownedItem = await tx.playerInventoryItem.findUnique({
        where: {
          id: command.inventoryItemId
        }
      });

      if (!ownedItem || ownedItem.playerId !== command.playerId) {
        return null;
      }

      await tx.playerInventoryItem.updateMany({
        where: {
          playerId: command.playerId,
          equippedSlot: command.slot
        },
        data: {
          equippedSlot: null
        }
      });

      const equippedItem = await tx.playerInventoryItem.update({
        where: {
          id: command.inventoryItemId
        },
        data: {
          equippedSlot: command.slot
        }
      });

      return toPlayerInventoryItemSnapshot(equippedItem);
    });
  }

  async unequipSlot(
    playerId: string,
    slot: "weapon" | "armor"
  ): Promise<PlayerInventoryItemSnapshot | null> {
    const prismaClient = this.prismaService as unknown as InventoryPrismaClient;

    return prismaClient.$transaction(async (tx: InventoryPrismaTransaction) => {
      const equippedItem = await tx.playerInventoryItem.findMany({
        where: {
          playerId
        },
        orderBy: {
          acquiredAt: "asc"
        }
      });

      const matchingItem = equippedItem.find(
        (item: PlayerInventoryItemRecord) => item.equippedSlot === slot
      );

      if (!matchingItem) {
        return null;
      }

      const updatedItem = await tx.playerInventoryItem.update({
        where: {
          id: matchingItem.id
        },
        data: {
          equippedSlot: null
        }
      });

      return toPlayerInventoryItemSnapshot(updatedItem);
    });
  }
}
