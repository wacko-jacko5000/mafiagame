import type { ConsumableItemDefinition } from "./inventory.types";

const defaultConsumableCatalog: readonly ConsumableItemDefinition[] = [
  {
    id: "energy-drink",
    name: "Energy Drink",
    type: "consumable",
    category: "drugs",
    price: 50,
    delivery: "instant",
    equipSlot: null,
    unlockLevel: 1,
    weaponStats: null,
    armorStats: null,
    consumableEffects: [
      {
        type: "resource",
        resource: "energy",
        amount: 10
      }
    ]
  },
  {
    id: "first-aid-kit",
    name: "First Aid Kit",
    type: "consumable",
    category: "drugs",
    price: 200,
    delivery: "instant",
    equipSlot: null,
    unlockLevel: 1,
    weaponStats: null,
    armorStats: null,
    consumableEffects: [
      {
        type: "resource",
        resource: "health",
        amount: 25
      }
    ]
  },
  {
    id: "cocaine",
    name: "Cocaine",
    type: "consumable",
    category: "drugs",
    price: 500,
    delivery: "instant",
    equipSlot: null,
    unlockLevel: 1,
    weaponStats: null,
    armorStats: null,
    consumableEffects: [
      {
        type: "resource",
        resource: "energy",
        amount: 40
      }
    ]
  },
  {
    id: "painkillers",
    name: "Painkillers",
    type: "consumable",
    category: "drugs",
    price: 400,
    delivery: "instant",
    equipSlot: null,
    unlockLevel: 3,
    weaponStats: null,
    armorStats: null,
    consumableEffects: [
      {
        type: "resource",
        resource: "health",
        amount: 50
      }
    ]
  },
  {
    id: "amphetamine",
    name: "Amphetamine",
    type: "consumable",
    category: "drugs",
    price: 1200,
    delivery: "instant",
    equipSlot: null,
    unlockLevel: 5,
    weaponStats: null,
    armorStats: null,
    consumableEffects: [
      {
        type: "resource",
        resource: "energy",
        amount: 70
      }
    ]
  },
  {
    id: "medical-kit",
    name: "Medical Kit",
    type: "consumable",
    category: "drugs",
    price: 900,
    delivery: "instant",
    equipSlot: null,
    unlockLevel: 6,
    weaponStats: null,
    armorStats: null,
    consumableEffects: [
      {
        type: "resource",
        resource: "health",
        amount: 75
      }
    ]
  },
  {
    id: "heroin",
    name: "Heroin",
    type: "consumable",
    category: "drugs",
    price: 2500,
    delivery: "instant",
    equipSlot: null,
    unlockLevel: 8,
    weaponStats: null,
    armorStats: null,
    consumableEffects: [
      {
        type: "resource",
        resource: "energy",
        amount: 100
      }
    ]
  },
  {
    id: "hospital-grade-meds",
    name: "Hospital-Grade Meds",
    type: "consumable",
    category: "drugs",
    price: 2000,
    delivery: "instant",
    equipSlot: null,
    unlockLevel: 10,
    weaponStats: null,
    armorStats: null,
    consumableEffects: [
      {
        type: "resource",
        resource: "health",
        amount: 100
      }
    ]
  }
] as const;

export const consumableCatalog: readonly ConsumableItemDefinition[] =
  defaultConsumableCatalog.map((item) => ({
    ...item,
    consumableEffects: item.consumableEffects.map((effect) => ({ ...effect }))
  }));
