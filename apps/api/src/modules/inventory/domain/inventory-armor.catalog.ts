import type { ItemDefinition } from "./inventory.types";

const defaultArmorCatalog: readonly ItemDefinition[] = [
  {
    id: "leather-jacket",
    name: "Leather Jacket",
    type: "armor",
    category: "armor",
    price: 950,
    equipSlot: "armor",
    unlockLevel: 1,
    weaponStats: null,
    armorStats: { damageReduction: 3 }
  },
  {
    id: "reinforced-leather-jacket",
    name: "Reinforced Leather Jacket",
    type: "armor",
    category: "armor",
    price: 1500,
    equipSlot: "armor",
    unlockLevel: 2,
    weaponStats: null,
    armorStats: { damageReduction: 4 }
  },
  {
    id: "street-vest",
    name: "Street Vest",
    type: "armor",
    category: "armor",
    price: 2100,
    equipSlot: "armor",
    unlockLevel: 3,
    weaponStats: null,
    armorStats: { damageReduction: 5 }
  },
  {
    id: "light-kevlar-vest",
    name: "Light Kevlar Vest",
    type: "armor",
    category: "armor",
    price: 2800,
    equipSlot: "armor",
    unlockLevel: 4,
    weaponStats: null,
    armorStats: { damageReduction: 6 }
  },
  {
    id: "kevlar-vest",
    name: "Kevlar Vest",
    type: "armor",
    category: "armor",
    price: 3600,
    equipSlot: "armor",
    unlockLevel: 5,
    weaponStats: null,
    armorStats: { damageReduction: 7 }
  },
  {
    id: "kevlar-vest-mk-ii",
    name: "Kevlar Vest MK II",
    type: "armor",
    category: "armor",
    price: 4500,
    equipSlot: "armor",
    unlockLevel: 6,
    weaponStats: null,
    armorStats: { damageReduction: 8 }
  },
  {
    id: "tactical-vest",
    name: "Tactical Vest",
    type: "armor",
    category: "armor",
    price: 5500,
    equipSlot: "armor",
    unlockLevel: 7,
    weaponStats: null,
    armorStats: { damageReduction: 9 }
  },
  {
    id: "tactical-vest-mk-ii",
    name: "Tactical Vest MK II",
    type: "armor",
    category: "armor",
    price: 6700,
    equipSlot: "armor",
    unlockLevel: 8,
    weaponStats: null,
    armorStats: { damageReduction: 10 }
  },
  {
    id: "heavy-tactical-vest",
    name: "Heavy Tactical Vest",
    type: "armor",
    category: "armor",
    price: 8000,
    equipSlot: "armor",
    unlockLevel: 9,
    weaponStats: null,
    armorStats: { damageReduction: 11 }
  },
  {
    id: "bulletproof-vest",
    name: "Bulletproof Vest",
    type: "armor",
    category: "armor",
    price: 9500,
    equipSlot: "armor",
    unlockLevel: 10,
    weaponStats: null,
    armorStats: { damageReduction: 12 }
  },
  {
    id: "bulletproof-vest-mk-ii",
    name: "Bulletproof Vest MK II",
    type: "armor",
    category: "armor",
    price: 11100,
    equipSlot: "armor",
    unlockLevel: 11,
    weaponStats: null,
    armorStats: { damageReduction: 13 }
  },
  {
    id: "military-vest",
    name: "Military Vest",
    type: "armor",
    category: "armor",
    price: 12800,
    equipSlot: "armor",
    unlockLevel: 12,
    weaponStats: null,
    armorStats: { damageReduction: 14 }
  },
  {
    id: "military-armor",
    name: "Military Armor",
    type: "armor",
    category: "armor",
    price: 14600,
    equipSlot: "armor",
    unlockLevel: 13,
    weaponStats: null,
    armorStats: { damageReduction: 15 }
  },
  {
    id: "military-armor-mk-ii",
    name: "Military Armor MK II",
    type: "armor",
    category: "armor",
    price: 16500,
    equipSlot: "armor",
    unlockLevel: 14,
    weaponStats: null,
    armorStats: { damageReduction: 16 }
  },
  {
    id: "combat-armor",
    name: "Combat Armor",
    type: "armor",
    category: "armor",
    price: 18500,
    equipSlot: "armor",
    unlockLevel: 15,
    weaponStats: null,
    armorStats: { damageReduction: 17 }
  },
  {
    id: "advanced-combat-armor",
    name: "Advanced Combat Armor",
    type: "armor",
    category: "armor",
    price: 20600,
    equipSlot: "armor",
    unlockLevel: 16,
    weaponStats: null,
    armorStats: { damageReduction: 18 }
  },
  {
    id: "heavy-combat-armor",
    name: "Heavy Combat Armor",
    type: "armor",
    category: "armor",
    price: 22800,
    equipSlot: "armor",
    unlockLevel: 17,
    weaponStats: null,
    armorStats: { damageReduction: 19 }
  },
  {
    id: "elite-tactical-armor",
    name: "Elite Tactical Armor",
    type: "armor",
    category: "armor",
    price: 25100,
    equipSlot: "armor",
    unlockLevel: 18,
    weaponStats: null,
    armorStats: { damageReduction: 20 }
  },
  {
    id: "elite-combat-armor",
    name: "Elite Combat Armor",
    type: "armor",
    category: "armor",
    price: 27500,
    equipSlot: "armor",
    unlockLevel: 19,
    weaponStats: null,
    armorStats: { damageReduction: 21 }
  },
  {
    id: "reinforced-exo-armor",
    name: "Reinforced Exo Armor",
    type: "armor",
    category: "armor",
    price: 30000,
    equipSlot: "armor",
    unlockLevel: 20,
    weaponStats: null,
    armorStats: { damageReduction: 22 }
  },
  {
    id: "prototype-exo-suit",
    name: "Prototype Exo Suit",
    type: "armor",
    category: "armor",
    price: 32600,
    equipSlot: "armor",
    unlockLevel: 21,
    weaponStats: null,
    armorStats: { damageReduction: 23 }
  }
] as const;

export const armorCatalog: readonly ItemDefinition[] = defaultArmorCatalog;
