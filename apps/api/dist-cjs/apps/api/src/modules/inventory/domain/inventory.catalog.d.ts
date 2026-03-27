import type { ItemDefinition } from "./inventory.types";
export declare const starterItemCatalog: readonly ItemDefinition[];
export declare function getItemById(itemId: string): ItemDefinition | undefined;
export declare function applyShopItemBalanceOverride(itemId: string, values: Pick<ItemDefinition, "price">): ItemDefinition | undefined;
export declare function resetStarterItemCatalog(): void;
