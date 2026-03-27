"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.consumableCatalog = void 0;
const defaultConsumableCatalog = [
    {
        id: "energy-drink",
        name: "Energy drink",
        type: "consumable",
        category: "drugs",
        price: 10,
        delivery: "instant",
        equipSlot: null,
        unlockLevel: 1,
        weaponStats: null,
        armorStats: null,
        consumableEffects: [
            {
                type: "resource",
                resource: "energy",
                amount: 1
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
    }
];
exports.consumableCatalog = defaultConsumableCatalog.map((item) => ({
    ...item,
    consumableEffects: item.consumableEffects.map((effect) => ({ ...effect }))
}));
