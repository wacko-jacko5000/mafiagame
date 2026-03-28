import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { z } from "zod";

import {
  STICKY_MENU_REPOSITORY,
  type StickyMenuRepository
} from "./sticky-menu.repository";
import {
  defaultStickyMenuConfig,
  stickyHeaderResourceKeys,
  stickyMenuDestinationKeys,
  stickyMenuPrimaryMaxItems,
  type StickyHeaderResourceKey,
  type StickyMenuConfig,
  type StickyMenuDestinationKey,
  type StickyMenuLeafDestinationKey
} from "../domain/sticky-menu.types";

const stickyMenuUpdateSchema = z
  .object({
    header: z.object({
      enabled: z.boolean(),
      resourceKeys: z.array(z.enum(stickyHeaderResourceKeys)).max(stickyHeaderResourceKeys.length)
    }),
    primaryItems: z
      .array(z.enum(stickyMenuDestinationKeys))
      .min(1)
      .max(stickyMenuPrimaryMaxItems),
    shopItems: z.array(
      z.enum(
        stickyMenuDestinationKeys.filter(
          (item): item is StickyMenuLeafDestinationKey =>
            item !== "more" && item.startsWith("shop-")
        ) as [StickyMenuLeafDestinationKey, ...StickyMenuLeafDestinationKey[]]
      )
    ),
    moreItems: z.array(
      z.enum(
        stickyMenuDestinationKeys.filter(
          (item): item is StickyMenuLeafDestinationKey =>
            item !== "more" && !item.startsWith("shop-")
        ) as [StickyMenuLeafDestinationKey, ...StickyMenuLeafDestinationKey[]]
      )
    )
  })
  .superRefine((value, context) => {
    if (new Set(value.header.resourceKeys).size !== value.header.resourceKeys.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["header", "resourceKeys"],
        message: "Header resource keys must be unique."
      });
    }

    if (new Set(value.primaryItems).size !== value.primaryItems.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["primaryItems"],
        message: "Primary menu items must be unique."
      });
    }

    if (new Set(value.moreItems).size !== value.moreItems.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["moreItems"],
        message: "More menu items must be unique."
      });
    }

    if (new Set(value.shopItems).size !== value.shopItems.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["shopItems"],
        message: "Shop menu items must be unique."
      });
    }

    const primaryWithoutMore = value.primaryItems.filter(
      (item): item is StickyMenuLeafDestinationKey => item !== "more"
    );
    const duplicateAcrossGroups = value.moreItems.find((item) => primaryWithoutMore.includes(item));
    const duplicateAcrossShopAndPrimary = value.shopItems.find((item) =>
      primaryWithoutMore.includes(item)
    );
    const duplicateAcrossShopAndMore = value.shopItems.find((item) =>
      value.moreItems.includes(item)
    );

    if (duplicateAcrossGroups) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["moreItems"],
        message: `Menu item "${duplicateAcrossGroups}" cannot appear in both primary and More sections.`
      });
    }

    if (duplicateAcrossShopAndPrimary) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["shopItems"],
        message: `Menu item "${duplicateAcrossShopAndPrimary}" cannot appear in both primary and Shop sections.`
      });
    }

    if (duplicateAcrossShopAndMore) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["shopItems"],
        message: `Menu item "${duplicateAcrossShopAndMore}" cannot appear in both Shop and More sections.`
      });
    }

    const hasMoreShortcut = value.primaryItems.includes("more");
    const hasMoreItems = value.moreItems.length > 0;
    const hasShopShortcut = value.primaryItems.includes("shop");
    const hasShopItems = value.shopItems.length > 0;

    if (hasMoreShortcut !== hasMoreItems) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: hasMoreShortcut ? ["moreItems"] : ["primaryItems"],
        message: hasMoreItems
          ? 'Primary items must include "more" when the More panel has destinations.'
          : 'Primary items may include "more" only when the More panel has destinations.'
      });
    }

    if (hasShopShortcut !== hasShopItems) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: hasShopShortcut ? ["shopItems"] : ["primaryItems"],
        message: hasShopItems
          ? 'Primary items must include "shop" when the Shop panel has destinations.'
          : 'Primary items may include "shop" only when the Shop panel has destinations.'
      });
    }
  });

@Injectable()
export class StickyMenuService {
  constructor(
    @Inject(STICKY_MENU_REPOSITORY)
    private readonly stickyMenuRepository: StickyMenuRepository
  ) {}

  async getConfig(): Promise<StickyMenuConfig> {
    const record = await this.stickyMenuRepository.getConfig();

    if (!record) {
      return this.toConfigView(defaultStickyMenuConfig);
    }

    return this.toConfigView({
      header: {
        enabled: record.headerEnabled,
        resourceKeys: record.headerResourceKeys
      },
      primaryItems: record.primaryItems,
      shopItems: record.shopItems,
      moreItems: record.moreItems
    });
  }

  async updateConfig(payload: unknown): Promise<StickyMenuConfig> {
    const parsed = stickyMenuUpdateSchema.safeParse(payload);

    if (!parsed.success) {
      throw new BadRequestException(
        parsed.error.issues[0]?.message ?? "Invalid sticky menu payload."
      );
    }

    const saved = await this.stickyMenuRepository.upsertConfig({
      headerEnabled: parsed.data.header.enabled,
      headerResourceKeys: parsed.data.header.resourceKeys,
      primaryItems: parsed.data.primaryItems,
      shopItems: parsed.data.shopItems,
      moreItems: parsed.data.moreItems
    });

    return this.toConfigView({
      header: {
        enabled: saved.headerEnabled,
        resourceKeys: saved.headerResourceKeys
      },
      primaryItems: saved.primaryItems,
      shopItems: saved.shopItems,
      moreItems: saved.moreItems
    });
  }

  private toConfigView(config: {
    header: {
      enabled: boolean;
      resourceKeys: StickyHeaderResourceKey[];
    };
    primaryItems: StickyMenuDestinationKey[];
    shopItems: StickyMenuLeafDestinationKey[];
    moreItems: StickyMenuLeafDestinationKey[];
  }): StickyMenuConfig {
    return {
      header: {
        enabled: config.header.enabled,
        resourceKeys: [...config.header.resourceKeys]
      },
      primaryItems: [...config.primaryItems],
      shopItems: [...config.shopItems],
      moreItems: [...config.moreItems],
      availableDestinationKeys: [...stickyMenuDestinationKeys],
      availableHeaderResourceKeys: [...stickyHeaderResourceKeys],
      maxPrimaryItems: stickyMenuPrimaryMaxItems
    };
  }
}
