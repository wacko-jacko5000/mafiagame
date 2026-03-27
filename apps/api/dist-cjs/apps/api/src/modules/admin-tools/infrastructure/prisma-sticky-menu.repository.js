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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaStickyMenuRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../platform/database/prisma.service");
const sticky_menu_types_1 = require("../domain/sticky-menu.types");
function toStringArray(value) {
    return Array.isArray(value) ? value.filter((entry) => typeof entry === "string") : [];
}
function toStickyMenuConfigRecord(row) {
    return {
        id: row.id,
        headerEnabled: row.headerEnabled,
        headerResourceKeys: toStringArray(row.headerResourceKeys),
        primaryItems: toStringArray(row.primaryItems),
        moreItems: toStringArray(row.moreItems),
        createdAt: row.createdAt,
        updatedAt: row.updatedAt
    };
}
let PrismaStickyMenuRepository = class PrismaStickyMenuRepository {
    prismaService;
    constructor(prismaService) {
        this.prismaService = prismaService;
    }
    async getConfig() {
        const prismaClient = this.prismaService;
        const row = await prismaClient.stickyMenuConfig.findUnique({
            where: {
                id: sticky_menu_types_1.stickyMenuConfigId
            }
        });
        return row ? toStickyMenuConfigRecord(row) : null;
    }
    async upsertConfig(input) {
        const prismaClient = this.prismaService;
        const row = await prismaClient.stickyMenuConfig.upsert({
            where: {
                id: sticky_menu_types_1.stickyMenuConfigId
            },
            create: {
                id: sticky_menu_types_1.stickyMenuConfigId,
                headerEnabled: input.headerEnabled,
                headerResourceKeys: input.headerResourceKeys,
                primaryItems: input.primaryItems,
                moreItems: input.moreItems
            },
            update: {
                headerEnabled: input.headerEnabled,
                headerResourceKeys: input.headerResourceKeys,
                primaryItems: input.primaryItems,
                moreItems: input.moreItems
            }
        });
        return toStickyMenuConfigRecord(row);
    }
};
exports.PrismaStickyMenuRepository = PrismaStickyMenuRepository;
exports.PrismaStickyMenuRepository = PrismaStickyMenuRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaStickyMenuRepository);
