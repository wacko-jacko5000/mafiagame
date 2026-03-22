import { armorCatalog } from "./inventory-armor.catalog";
import { weaponUnlockCatalog } from "./inventory-weapon-unlock.catalog";
import type { ItemDefinition } from "./inventory.types";

const defaultStarterItemCatalog: readonly ItemDefinition[] = [
  ...weaponUnlockCatalog,
  ...armorCatalog
] as const;

export const starterItemCatalog: readonly ItemDefinition[] =
  defaultStarterItemCatalog.map((item) => ({ ...item }));

export function getItemById(itemId: string): ItemDefinition | undefined {
  return starterItemCatalog.find((item) => item.id === itemId);
}

export function applyShopItemBalanceOverride(
  itemId: string,
  values: Pick<ItemDefinition, "price">
): ItemDefinition | undefined {
  const item = getItemById(itemId);

  if (!item) {
    return undefined;
  }

  item.price = values.price;

  return item;
}

export function resetStarterItemCatalog(): void {
  starterItemCatalog.forEach((item, index) => {
    const defaultItem = defaultStarterItemCatalog[index]!;

    item.id = defaultItem.id;
    item.name = defaultItem.name;
    item.type = defaultItem.type;
    item.category = defaultItem.category;
    item.price = defaultItem.price;
    item.equipSlot = defaultItem.equipSlot;
    item.unlockLevel = defaultItem.unlockLevel;
    item.weaponStats = defaultItem.weaponStats
      ? { ...defaultItem.weaponStats }
      : null;
    item.armorStats = defaultItem.armorStats ? { ...defaultItem.armorStats } : null;
  });
}
