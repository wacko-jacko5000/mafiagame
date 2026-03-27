export declare const stickyMenuDestinationKeys: readonly ["home", "crimes", "missions", "shop", "business", "inventory", "activity", "achievements", "gangs", "territory", "market", "leaderboard", "more"];
export declare const stickyHeaderResourceKeys: readonly ["cash", "respect", "energy", "health", "rank"];
export declare const stickyMenuPrimaryMaxItems = 5;
export declare const stickyMenuConfigId = "default";
export type StickyMenuDestinationKey = (typeof stickyMenuDestinationKeys)[number];
export type StickyHeaderResourceKey = (typeof stickyHeaderResourceKeys)[number];
export type StickyMenuLeafDestinationKey = Exclude<StickyMenuDestinationKey, "more">;
export interface StickyMenuConfig {
    header: {
        enabled: boolean;
        resourceKeys: StickyHeaderResourceKey[];
    };
    primaryItems: StickyMenuDestinationKey[];
    moreItems: StickyMenuLeafDestinationKey[];
    availableDestinationKeys: StickyMenuDestinationKey[];
    availableHeaderResourceKeys: StickyHeaderResourceKey[];
    maxPrimaryItems: number;
}
export declare const defaultStickyMenuConfig: {
    header: {
        enabled: true;
        resourceKeys: ("cash" | "respect")[];
    };
    primaryItems: ("missions" | "crimes" | "home" | "shop" | "more")[];
    moreItems: ("achievements" | "gangs" | "business" | "inventory" | "activity" | "territory" | "market" | "leaderboard")[];
};
