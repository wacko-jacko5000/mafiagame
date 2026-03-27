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
exports.StickyMenuService = void 0;
const common_1 = require("@nestjs/common");
const zod_1 = require("zod");
const sticky_menu_repository_1 = require("./sticky-menu.repository");
const sticky_menu_types_1 = require("../domain/sticky-menu.types");
const stickyMenuUpdateSchema = zod_1.z
    .object({
    header: zod_1.z.object({
        enabled: zod_1.z.boolean(),
        resourceKeys: zod_1.z.array(zod_1.z.enum(sticky_menu_types_1.stickyHeaderResourceKeys)).max(sticky_menu_types_1.stickyHeaderResourceKeys.length)
    }),
    primaryItems: zod_1.z
        .array(zod_1.z.enum(sticky_menu_types_1.stickyMenuDestinationKeys))
        .min(1)
        .max(sticky_menu_types_1.stickyMenuPrimaryMaxItems),
    moreItems: zod_1.z.array(zod_1.z.enum(sticky_menu_types_1.stickyMenuDestinationKeys.filter((item) => item !== "more")))
})
    .superRefine((value, context) => {
    if (new Set(value.header.resourceKeys).size !== value.header.resourceKeys.length) {
        context.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            path: ["header", "resourceKeys"],
            message: "Header resource keys must be unique."
        });
    }
    if (new Set(value.primaryItems).size !== value.primaryItems.length) {
        context.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            path: ["primaryItems"],
            message: "Primary menu items must be unique."
        });
    }
    if (new Set(value.moreItems).size !== value.moreItems.length) {
        context.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            path: ["moreItems"],
            message: "More menu items must be unique."
        });
    }
    const primaryWithoutMore = value.primaryItems.filter((item) => item !== "more");
    const duplicateAcrossGroups = value.moreItems.find((item) => primaryWithoutMore.includes(item));
    if (duplicateAcrossGroups) {
        context.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            path: ["moreItems"],
            message: `Menu item "${duplicateAcrossGroups}" cannot appear in both primary and More sections.`
        });
    }
    const hasMoreShortcut = value.primaryItems.includes("more");
    const hasMoreItems = value.moreItems.length > 0;
    if (hasMoreShortcut !== hasMoreItems) {
        context.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            path: hasMoreShortcut ? ["moreItems"] : ["primaryItems"],
            message: hasMoreItems
                ? 'Primary items must include "more" when the More panel has destinations.'
                : 'Primary items may include "more" only when the More panel has destinations.'
        });
    }
});
let StickyMenuService = class StickyMenuService {
    stickyMenuRepository;
    constructor(stickyMenuRepository) {
        this.stickyMenuRepository = stickyMenuRepository;
    }
    async getConfig() {
        const record = await this.stickyMenuRepository.getConfig();
        if (!record) {
            return this.toConfigView(sticky_menu_types_1.defaultStickyMenuConfig);
        }
        return this.toConfigView({
            header: {
                enabled: record.headerEnabled,
                resourceKeys: record.headerResourceKeys
            },
            primaryItems: record.primaryItems,
            moreItems: record.moreItems
        });
    }
    async updateConfig(payload) {
        const parsed = stickyMenuUpdateSchema.safeParse(payload);
        if (!parsed.success) {
            throw new common_1.BadRequestException(parsed.error.issues[0]?.message ?? "Invalid sticky menu payload.");
        }
        const saved = await this.stickyMenuRepository.upsertConfig({
            headerEnabled: parsed.data.header.enabled,
            headerResourceKeys: parsed.data.header.resourceKeys,
            primaryItems: parsed.data.primaryItems,
            moreItems: parsed.data.moreItems
        });
        return this.toConfigView({
            header: {
                enabled: saved.headerEnabled,
                resourceKeys: saved.headerResourceKeys
            },
            primaryItems: saved.primaryItems,
            moreItems: saved.moreItems
        });
    }
    toConfigView(config) {
        return {
            header: {
                enabled: config.header.enabled,
                resourceKeys: [...config.header.resourceKeys]
            },
            primaryItems: [...config.primaryItems],
            moreItems: [...config.moreItems],
            availableDestinationKeys: [...sticky_menu_types_1.stickyMenuDestinationKeys],
            availableHeaderResourceKeys: [...sticky_menu_types_1.stickyHeaderResourceKeys],
            maxPrimaryItems: sticky_menu_types_1.stickyMenuPrimaryMaxItems
        };
    }
};
exports.StickyMenuService = StickyMenuService;
exports.StickyMenuService = StickyMenuService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(sticky_menu_repository_1.STICKY_MENU_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], StickyMenuService);
