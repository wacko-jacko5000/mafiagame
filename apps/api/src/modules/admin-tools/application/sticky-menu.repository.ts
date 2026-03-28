import type {
  StickyHeaderResourceKey,
  StickyMenuDestinationKey,
  StickyMenuLeafDestinationKey
} from "../domain/sticky-menu.types";

export interface StickyMenuConfigRecord {
  id: string;
  headerEnabled: boolean;
  headerResourceKeys: StickyHeaderResourceKey[];
  primaryItems: StickyMenuDestinationKey[];
  shopItems: StickyMenuLeafDestinationKey[];
  moreItems: StickyMenuLeafDestinationKey[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UpsertStickyMenuConfigInput {
  headerEnabled: boolean;
  headerResourceKeys: StickyHeaderResourceKey[];
  primaryItems: StickyMenuDestinationKey[];
  shopItems: StickyMenuLeafDestinationKey[];
  moreItems: StickyMenuLeafDestinationKey[];
}

export interface StickyMenuRepository {
  getConfig(): Promise<StickyMenuConfigRecord | null>;
  upsertConfig(input: UpsertStickyMenuConfigInput): Promise<StickyMenuConfigRecord>;
}

export const STICKY_MENU_REPOSITORY = Symbol("STICKY_MENU_REPOSITORY");
