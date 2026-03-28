export const stickyMenuDestinationKeys = [
  "home",
  "crimes",
  "missions",
  "shop",
  "shop-weapons",
  "shop-drugs",
  "shop-garage",
  "shop-realestate",
  "business",
  "inventory",
  "activity",
  "achievements",
  "gangs",
  "territory",
  "market",
  "leaderboard",
  "more"
] as const;

export const stickyHeaderResourceKeys = [
  "cash",
  "respect",
  "energy",
  "health",
  "rank"
] as const;

export const stickyMenuPrimaryMaxItems = 5;
export const stickyMenuConfigId = "default";

export type StickyMenuDestinationKey = (typeof stickyMenuDestinationKeys)[number];
export type StickyHeaderResourceKey = (typeof stickyHeaderResourceKeys)[number];
export type StickyMenuLeafDestinationKey = Exclude<StickyMenuDestinationKey, "more">;

export interface StickyMenuConfig {
  header: {
    enabled: boolean;
    resourceKeys: StickyHeaderResourceKey[];
  };
  primaryItems: StickyMenuDestinationKey[];
  shopItems: StickyMenuLeafDestinationKey[];
  moreItems: StickyMenuLeafDestinationKey[];
  availableDestinationKeys: StickyMenuDestinationKey[];
  availableHeaderResourceKeys: StickyHeaderResourceKey[];
  maxPrimaryItems: number;
}

export const defaultStickyMenuConfig = {
  header: {
    enabled: true,
    resourceKeys: ["cash", "respect"]
  },
  primaryItems: ["home", "crimes", "missions", "shop", "more"],
  shopItems: [
    "shop-weapons",
    "shop-drugs",
    "shop-garage",
    "shop-realestate"
  ],
  moreItems: [
    "business",
    "inventory",
    "activity",
    "achievements",
    "gangs",
    "territory",
    "market",
    "leaderboard"
  ]
} satisfies {
  header: {
    enabled: boolean;
    resourceKeys: StickyHeaderResourceKey[];
  };
  primaryItems: StickyMenuDestinationKey[];
  shopItems: StickyMenuLeafDestinationKey[];
  moreItems: StickyMenuLeafDestinationKey[];
};
