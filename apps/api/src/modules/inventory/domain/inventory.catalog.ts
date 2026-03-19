import type { ItemDefinition } from "./inventory.types";

const defaultStarterItemCatalog: readonly ItemDefinition[] = [
  {
    id: "rusty-knife",
    name: "Rusty Knife",
    type: "weapon",
    price: 400,
    equipSlot: "weapon",
    combatAttackBonus: 4,
    combatDefenseBonus: 0
  },
  {
    id: "cheap-pistol",
    name: "Cheap Pistol",
    type: "weapon",
    price: 1800,
    equipSlot: "weapon",
    combatAttackBonus: 8,
    combatDefenseBonus: 0
  },
  {
    id: "leather-jacket",
    name: "Leather Jacket",
    type: "armor",
    price: 950,
    equipSlot: "armor",
    combatAttackBonus: 0,
    combatDefenseBonus: 3
  }
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
    item.price = defaultItem.price;
    item.equipSlot = defaultItem.equipSlot;
    item.combatAttackBonus = defaultItem.combatAttackBonus;
    item.combatDefenseBonus = defaultItem.combatDefenseBonus;
  });
}
