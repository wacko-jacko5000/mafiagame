import { armorCatalog } from "./inventory-armor.catalog";
import { consumableCatalog } from "./inventory-consumable.catalog";
import { weaponUnlockCatalog } from "./inventory-weapon-unlock.catalog";
import type {
  ConsumableItemDefinition,
  EquipmentItemDefinition,
  ItemDefinition,
  ShopItemDefinition
} from "./inventory.types";

const defaultShopItemCatalog: readonly ShopItemDefinition[] = [
  ...weaponUnlockCatalog.map(toEquipmentItemDefinition),
  ...armorCatalog.map(toEquipmentItemDefinition),
  ...consumableCatalog
] as const;

export const starterShopItemCatalog: readonly ShopItemDefinition[] =
  defaultShopItemCatalog.map(cloneShopItemDefinition);

export function getShopItemById(itemId: string): ShopItemDefinition | undefined {
  return starterShopItemCatalog.find((item) => item.id === itemId);
}

export function getEquipmentItemById(
  itemId: string
): EquipmentItemDefinition | undefined {
  const item = getShopItemById(itemId);

  return item?.delivery === "inventory" ? item : undefined;
}

export function getConsumableItemById(
  itemId: string
): ConsumableItemDefinition | undefined {
  const item = getShopItemById(itemId);

  return item?.delivery === "instant" ? item : undefined;
}

export function applyShopItemBalanceOverride(
  itemId: string,
  values: Pick<ShopItemDefinition, "price">
): ShopItemDefinition | undefined {
  const item = getShopItemById(itemId);

  if (!item) {
    return undefined;
  }

  item.price = values.price;

  return item;
}

export function resetStarterItemCatalog(): void {
  starterShopItemCatalog.forEach((item, index) => {
    const defaultItem = defaultShopItemCatalog[index]!;

    item.id = defaultItem.id;
    item.name = defaultItem.name;
    item.type = defaultItem.type;
    item.category = defaultItem.category;
    item.price = defaultItem.price;
    item.delivery = defaultItem.delivery;
    item.equipSlot = defaultItem.equipSlot;
    item.unlockLevel = defaultItem.unlockLevel;
    item.weaponStats = defaultItem.weaponStats
      ? { ...defaultItem.weaponStats }
      : null;
    item.armorStats = defaultItem.armorStats ? { ...defaultItem.armorStats } : null;
    item.consumableEffects =
      defaultItem.consumableEffects?.map((effect) => ({ ...effect })) ?? null;
  });
}

function cloneShopItemDefinition(item: ShopItemDefinition): ShopItemDefinition {
  if (item.delivery === "inventory") {
    return {
      ...item,
      delivery: "inventory",
      consumableEffects: null,
      weaponStats: item.weaponStats ? { ...item.weaponStats } : null,
      armorStats: item.armorStats ? { ...item.armorStats } : null
    };
  }

  return {
    ...item,
    weaponStats: null,
    armorStats: null,
    consumableEffects: item.consumableEffects.map((effect) => ({ ...effect }))
  };
}

function toEquipmentItemDefinition(item: ItemDefinition): EquipmentItemDefinition {
  return {
    ...item,
    delivery: "inventory",
    consumableEffects: null
  };
}
