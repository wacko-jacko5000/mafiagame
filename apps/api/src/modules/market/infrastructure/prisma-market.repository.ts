import { Inject, Injectable } from "@nestjs/common";

import { PrismaService } from "../../../platform/database/prisma.service";
import type { MarketRepository } from "../application/market.repository";
import type {
  BuyMarketListingCommand,
  BuyMarketListingResult,
  CancelMarketListingCommand,
  CancelMarketListingResult,
  CreateMarketListingCommand,
  CreateMarketListingResult,
  MarketListingSnapshot
} from "../domain/market.types";

interface PlayerRecord {
  id: string;
  cash: number;
}

interface PlayerInventoryItemRecord {
  id: string;
  playerId: string;
  itemId: string;
  equippedSlot: "weapon" | "armor" | null;
  marketListingId: string | null;
}

interface MarketListingRecord {
  id: string;
  inventoryItemId: string;
  sellerPlayerId: string;
  buyerPlayerId: string | null;
  price: number;
  status: "active" | "sold" | "cancelled";
  createdAt: Date;
  soldAt: Date | null;
  inventoryItem?: PlayerInventoryItemRecord;
}

interface MarketPrismaTransaction {
  player: {
    findUnique(args: { where: { id: string } }): Promise<PlayerRecord | null>;
    update(args: {
      where: { id: string };
      data: { cash: { increment: number } | { decrement: number } };
    }): Promise<PlayerRecord>;
    updateMany(args: {
      where: { id: string; cash?: { gte: number } };
      data: { cash: { decrement: number } };
    }): Promise<{ count: number }>;
  };
  playerInventoryItem: {
    findUnique(args: { where: { id: string } }): Promise<PlayerInventoryItemRecord | null>;
    updateMany(args: {
      where: {
        id: string;
        playerId?: string;
        marketListingId?: string | null;
        equippedSlot?: null;
      };
      data: {
        marketListingId?: string | null;
        playerId?: string;
        equippedSlot?: null;
      };
    }): Promise<{ count: number }>;
  };
  marketListing: {
    create(args: {
      data: {
        id?: string;
        inventoryItemId: string;
        sellerPlayerId: string;
        price: number;
        status: "active";
      };
      include: { inventoryItem: true };
    }): Promise<MarketListingRecord>;
    findUnique(args: {
      where: { id: string };
      include: { inventoryItem: true };
    }): Promise<MarketListingRecord | null>;
    update(args: {
      where: { id: string };
      data: {
        status: "cancelled" | "sold";
        soldAt?: Date;
        buyerPlayerId?: string;
      };
      include: { inventoryItem: true };
    }): Promise<MarketListingRecord>;
    updateMany(args: {
      where: {
        id: string;
        sellerPlayerId?: string;
        status: "active";
      };
      data: {
        status: "cancelled" | "sold";
        soldAt?: Date;
        buyerPlayerId?: string;
      };
    }): Promise<{ count: number }>;
  };
}

class CreateListingRollbackError extends Error {
  constructor(readonly status: "item_already_listed") {
    super(status);
    this.name = "CreateListingRollbackError";
  }
}

class BuyListingRollbackError extends Error {
  constructor(readonly status: "listing_not_active" | "inventory_lock_missing") {
    super(status);
    this.name = "BuyListingRollbackError";
  }
}

interface MarketPrismaClient {
  marketListing: {
    findMany(args: {
      include: { inventoryItem: true };
      orderBy: { createdAt: "asc" | "desc" };
    }): Promise<MarketListingRecord[]>;
    findUnique(args: {
      where: { id: string };
      include: { inventoryItem: true };
    }): Promise<MarketListingRecord | null>;
  };
  $transaction<T>(callback: (tx: MarketPrismaTransaction) => Promise<T>): Promise<T>;
}

function toMarketListingSnapshot(listing: MarketListingRecord): MarketListingSnapshot {
  return {
    id: listing.id,
    inventoryItemId: listing.inventoryItemId,
    sellerPlayerId: listing.sellerPlayerId,
    buyerPlayerId: listing.buyerPlayerId,
    itemId: listing.inventoryItem?.itemId ?? "",
    price: listing.price,
    status: listing.status,
    createdAt: listing.createdAt,
    soldAt: listing.soldAt
  };
}

@Injectable()
export class PrismaMarketRepository implements MarketRepository {
  constructor(
    @Inject(PrismaService)
    private readonly prismaService: PrismaService
  ) {}

  async listListings(): Promise<MarketListingSnapshot[]> {
    const prismaClient = this.prismaService as unknown as MarketPrismaClient;
    const listings = await prismaClient.marketListing.findMany({
      include: {
        inventoryItem: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return listings.map(toMarketListingSnapshot);
  }

  async findListingById(listingId: string): Promise<MarketListingSnapshot | null> {
    const prismaClient = this.prismaService as unknown as MarketPrismaClient;
    const listing = await prismaClient.marketListing.findUnique({
      where: {
        id: listingId
      },
      include: {
        inventoryItem: true
      }
    });

    return listing ? toMarketListingSnapshot(listing) : null;
  }

  async createListing(command: CreateMarketListingCommand): Promise<CreateMarketListingResult> {
    const prismaClient = this.prismaService as unknown as MarketPrismaClient;

    try {
      return await prismaClient.$transaction(async (tx: MarketPrismaTransaction) => {
        const inventoryItem = await tx.playerInventoryItem.findUnique({
          where: {
            id: command.inventoryItemId
          }
        });

        if (!inventoryItem) {
          return { status: "inventory_item_not_found", listing: null };
        }

        if (inventoryItem.playerId !== command.playerId) {
          return { status: "not_owner", listing: null };
        }

        if (inventoryItem.equippedSlot) {
          return { status: "item_equipped", listing: null };
        }

        if (inventoryItem.marketListingId) {
          return { status: "item_already_listed", listing: null };
        }

        const listingId = crypto.randomUUID();
        const lockResult = await tx.playerInventoryItem.updateMany({
          where: {
            id: inventoryItem.id,
            playerId: command.playerId,
            marketListingId: null,
            equippedSlot: null
          },
          data: {
            marketListingId: listingId
          }
        });

        if (lockResult.count !== 1) {
          throw new CreateListingRollbackError("item_already_listed");
        }

        const listing = await tx.marketListing.create({
          data: {
            id: listingId,
            inventoryItemId: inventoryItem.id,
            sellerPlayerId: command.playerId,
            price: command.price,
            status: "active"
          },
          include: {
            inventoryItem: true
          }
        });

        return {
          status: "created",
          listing: toMarketListingSnapshot({
            ...listing,
            inventoryItem: {
              ...inventoryItem,
              marketListingId: listing.id
            }
          })
        };
      });
    } catch (error) {
      if (error instanceof CreateListingRollbackError) {
        return {
          status: error.status,
          listing: null
        };
      }

      throw error;
    }
  }

  async cancelListing(command: CancelMarketListingCommand): Promise<CancelMarketListingResult> {
    const prismaClient = this.prismaService as unknown as MarketPrismaClient;

    return prismaClient.$transaction(async (tx: MarketPrismaTransaction) => {
      const listing = await tx.marketListing.findUnique({
        where: {
          id: command.listingId
        },
        include: {
          inventoryItem: true
        }
      });

      if (!listing) {
        return { status: "listing_not_found", listing: null };
      }

      if (listing.sellerPlayerId !== command.playerId) {
        return { status: "not_seller", listing: null };
      }

      if (listing.status !== "active") {
        return { status: "listing_not_active", listing: null };
      }

      const updateListingResult = await tx.marketListing.updateMany({
        where: {
          id: command.listingId,
          sellerPlayerId: command.playerId,
          status: "active"
        },
        data: {
          status: "cancelled"
        }
      });

      if (updateListingResult.count !== 1) {
        return { status: "listing_not_active", listing: null };
      }

      await tx.playerInventoryItem.updateMany({
        where: {
          id: listing.inventoryItemId,
          marketListingId: listing.id
        },
        data: {
          marketListingId: null
        }
      });

      const cancelledListing = await tx.marketListing.findUnique({
        where: {
          id: listing.id
        },
        include: {
          inventoryItem: true
        }
      });

      return {
        status: "cancelled",
        listing: toMarketListingSnapshot({
          ...(cancelledListing as MarketListingRecord),
          inventoryItem: {
            ...((cancelledListing as MarketListingRecord).inventoryItem as PlayerInventoryItemRecord),
            marketListingId: null
          }
        })
      };
    });
  }

  async buyListing(command: BuyMarketListingCommand): Promise<BuyMarketListingResult> {
    const prismaClient = this.prismaService as unknown as MarketPrismaClient;

    try {
      return await prismaClient.$transaction(async (tx: MarketPrismaTransaction) => {
        const listing = await tx.marketListing.findUnique({
          where: {
            id: command.listingId
          },
          include: {
            inventoryItem: true
          }
        });

        if (!listing) {
          return {
            status: "listing_not_found",
            listing: null,
            buyerCashAfterPurchase: null,
            sellerCashAfterSale: null
          };
        }

        if (listing.status !== "active") {
          return {
            status: "listing_not_active",
            listing: null,
            buyerCashAfterPurchase: null,
            sellerCashAfterSale: null
          };
        }

        if (listing.sellerPlayerId === command.buyerPlayerId) {
          return {
            status: "cannot_buy_own_listing",
            listing: null,
            buyerCashAfterPurchase: null,
            sellerCashAfterSale: null
          };
        }

        const [seller, buyer] = await Promise.all([
          tx.player.findUnique({ where: { id: listing.sellerPlayerId } }),
          tx.player.findUnique({ where: { id: command.buyerPlayerId } })
        ]);

        if (!seller) {
          return {
            status: "seller_missing",
            listing: null,
            buyerCashAfterPurchase: null,
            sellerCashAfterSale: null
          };
        }

        if (!buyer) {
          return {
            status: "buyer_missing",
            listing: null,
            buyerCashAfterPurchase: null,
            sellerCashAfterSale: null
          };
        }

        const buyerDebitResult = await tx.player.updateMany({
          where: {
            id: command.buyerPlayerId,
            cash: {
              gte: listing.price
            }
          },
          data: {
            cash: {
              decrement: listing.price
            }
          }
        });

        if (buyerDebitResult.count !== 1) {
          return {
            status: "insufficient_cash",
            listing: null,
            buyerCashAfterPurchase: null,
            sellerCashAfterSale: null
          };
        }

        const transferResult = await tx.playerInventoryItem.updateMany({
          where: {
            id: listing.inventoryItemId,
            playerId: listing.sellerPlayerId,
            marketListingId: listing.id
          },
          data: {
            playerId: command.buyerPlayerId,
            equippedSlot: null,
            marketListingId: null
          }
        });

        if (transferResult.count !== 1) {
          throw new BuyListingRollbackError("inventory_lock_missing");
        }

        const soldAt = new Date();
        const listingUpdateResult = await tx.marketListing.updateMany({
          where: {
            id: listing.id,
            status: "active"
          },
          data: {
            status: "sold",
            soldAt,
            buyerPlayerId: command.buyerPlayerId
          }
        });

        if (listingUpdateResult.count !== 1) {
          throw new BuyListingRollbackError("listing_not_active");
        }

        const [updatedBuyer, updatedSeller, soldListing] = await Promise.all([
          tx.player.findUnique({ where: { id: command.buyerPlayerId } }),
          tx.player.update({
            where: {
              id: listing.sellerPlayerId
            },
            data: {
              cash: {
                increment: listing.price
              }
            }
          }),
          tx.marketListing.update({
            where: {
              id: listing.id
            },
            data: {
              status: "sold",
              soldAt,
              buyerPlayerId: command.buyerPlayerId
            },
            include: {
              inventoryItem: true
            }
          })
        ]);

        if (!updatedBuyer) {
          throw new BuyListingRollbackError("inventory_lock_missing");
        }

        return {
          status: "purchased",
          listing: toMarketListingSnapshot({
            ...soldListing,
            inventoryItem: listing.inventoryItem
          }),
          buyerCashAfterPurchase: updatedBuyer.cash,
          sellerCashAfterSale: updatedSeller.cash
        };
      });
    } catch (error) {
      if (error instanceof BuyListingRollbackError) {
        return {
          status: error.status,
          listing: null,
          buyerCashAfterPurchase: null,
          sellerCashAfterSale: null
        };
      }

      throw error;
    }
  }
}
