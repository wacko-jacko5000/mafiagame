import { armorCatalog } from "./inventory-armor.catalog";
import { consumableCatalog } from "./inventory-consumable.catalog";
import { weaponUnlockCatalog } from "./inventory-weapon-unlock.catalog";
import type {
  ConsumableItemDefinition,
  EquipmentItemDefinition,
  ItemDefinition,
  OwnedShopItemDefinition,
  ShopItemDefinition,
  ShopItemType,
  ShopItemCategory,
  ConsumableEffectResource
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

  return item?.delivery === "inventory" && item.equipSlot !== null ? item : undefined;
}

export function getOwnedShopItemById(
  itemId: string
): OwnedShopItemDefinition | undefined {
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
    item.respectBonus = defaultItem.respectBonus;
    item.parkingSlots = defaultItem.parkingSlots;
    item.weaponStats = defaultItem.weaponStats
      ? { ...defaultItem.weaponStats }
      : null;
    item.armorStats = defaultItem.armorStats ? { ...defaultItem.armorStats } : null;
    item.consumableEffects =
      defaultItem.consumableEffects?.map((effect) => ({ ...effect })) ?? null;
  });
}

export function buildShopItemDefinition(input: {
  id: string;
  name: string;
  type: ShopItemType;
  category: ShopItemCategory;
  price: number;
  unlockLevel: number;
  respectBonus?: number;
  parkingSlots?: number;
  damageBonus?: number;
  damageReduction?: number;
  effectResource?: ConsumableEffectResource;
  effectAmount?: number;
}): ShopItemDefinition {
  if (input.type === "weapon") {
    return {
      id: input.id,
      name: input.name,
      type: "weapon",
      category: input.category as ItemDefinition["category"],
      price: input.price,
      unlockLevel: input.unlockLevel,
      respectBonus: null,
      parkingSlots: null,
      delivery: "inventory",
      equipSlot: "weapon",
      weaponStats: {
        damageBonus: input.damageBonus ?? 0
      },
      armorStats: null,
      consumableEffects: null
    };
  }

  if (input.type === "armor") {
    return {
      id: input.id,
      name: input.name,
      type: "armor",
      category: input.category as ItemDefinition["category"],
      price: input.price,
      unlockLevel: input.unlockLevel,
      respectBonus: null,
      parkingSlots: null,
      delivery: "inventory",
      equipSlot: "armor",
      weaponStats: null,
      armorStats: {
        damageReduction: input.damageReduction ?? 0
      },
      consumableEffects: null
    };
  }

  if (input.type === "vehicle") {
    return {
      id: input.id,
      name: input.name,
      type: "vehicle",
      category: "garage",
      price: input.price,
      unlockLevel: input.unlockLevel,
      respectBonus: input.respectBonus ?? 0,
      parkingSlots: null,
      delivery: "inventory",
      equipSlot: null,
      weaponStats: null,
      armorStats: null,
      consumableEffects: null
    };
  }

  if (input.type === "property") {
    return {
      id: input.id,
      name: input.name,
      type: "property",
      category: "realestate",
      price: input.price,
      unlockLevel: input.unlockLevel,
      respectBonus: input.respectBonus ?? 0,
      parkingSlots: input.parkingSlots ?? 0,
      delivery: "inventory",
      equipSlot: null,
      weaponStats: null,
      armorStats: null,
      consumableEffects: null
    };
  }

  return {
    id: input.id,
    name: input.name,
    type: "consumable",
    category: "drugs",
    price: input.price,
    unlockLevel: input.unlockLevel,
    respectBonus: null,
    parkingSlots: null,
    delivery: "instant",
    equipSlot: null,
    weaponStats: null,
    armorStats: null,
    consumableEffects: [
      {
        type: "resource",
        resource: input.effectResource ?? "energy",
        amount: input.effectAmount ?? 0
      }
    ]
  };
}

function cloneShopItemDefinition(item: ShopItemDefinition): ShopItemDefinition {
  if (item.delivery === "inventory" && item.equipSlot !== null) {
    return {
      ...item,
      delivery: "inventory",
      consumableEffects: null,
      weaponStats: item.weaponStats ? { ...item.weaponStats } : null,
      armorStats: item.armorStats ? { ...item.armorStats } : null
    };
  }

  if (item.delivery === "inventory") {
    return {
      ...item,
      delivery: "inventory",
      consumableEffects: null,
      weaponStats: null,
      armorStats: null
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
