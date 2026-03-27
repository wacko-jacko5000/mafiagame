"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaMarketRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../platform/database/prisma.service");
class CreateListingRollbackError extends Error {
    status;
    constructor(status) {
        super(status);
        this.status = status;
        this.name = "CreateListingRollbackError";
    }
}
class BuyListingRollbackError extends Error {
    status;
    constructor(status) {
        super(status);
        this.status = status;
        this.name = "BuyListingRollbackError";
    }
}
function toMarketListingSnapshot(listing) {
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
let PrismaMarketRepository = class PrismaMarketRepository {
    prismaService;
    constructor(prismaService) {
        this.prismaService = prismaService;
    }
    async listListings() {
        const prismaClient = this.prismaService;
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
    async findListingById(listingId) {
        const prismaClient = this.prismaService;
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
    async createListing(command) {
        const prismaClient = this.prismaService;
        try {
            return await prismaClient.$transaction(async (tx) => {
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
        }
        catch (error) {
            if (error instanceof CreateListingRollbackError) {
                return {
                    status: error.status,
                    listing: null
                };
            }
            throw error;
        }
    }
    async cancelListing(command) {
        const prismaClient = this.prismaService;
        return prismaClient.$transaction(async (tx) => {
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
                    ...cancelledListing,
                    inventoryItem: {
                        ...cancelledListing.inventoryItem,
                        marketListingId: null
                    }
                })
            };
        });
    }
    async buyListing(command) {
        const prismaClient = this.prismaService;
        try {
            return await prismaClient.$transaction(async (tx) => {
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
        }
        catch (error) {
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
};
exports.PrismaMarketRepository = PrismaMarketRepository;
exports.PrismaMarketRepository = PrismaMarketRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_service_1.PrismaService)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaMarketRepository);
