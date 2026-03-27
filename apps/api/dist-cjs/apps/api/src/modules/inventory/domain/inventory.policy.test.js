"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const inventory_policy_1 = require("./inventory.policy");
(0, vitest_1.describe)("inventory policy", () => {
    (0, vitest_1.it)("builds inventory view items from owned item snapshots", () => {
        const result = (0, inventory_policy_1.buildInventoryList)([
            {
                id: "owned-1",
                playerId: "player-1",
                itemId: "rusty-knife",
                equippedSlot: "weapon",
                marketListingId: null,
                acquiredAt: new Date("2026-03-16T20:00:00.000Z"),
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);
        (0, vitest_1.expect)(result).toEqual([
            {
                id: "owned-1",
                playerId: "player-1",
                itemId: "rusty-knife",
                name: "Glock 17",
                type: "weapon",
                category: "handguns",
                price: 400,
                equipSlot: "weapon",
                unlockLevel: 1,
                equippedSlot: "weapon",
                marketListingId: null,
                weaponStats: {
                    damageBonus: 4
                },
                armorStats: null,
                acquiredAt: new Date("2026-03-16T20:00:00.000Z")
            }
        ]);
    });
    (0, vitest_1.it)("skips owned items that are missing from the starter catalog", () => {
        (0, vitest_1.expect)((0, inventory_policy_1.buildInventoryList)([
            {
                id: "owned-1",
                playerId: "player-1",
                itemId: "missing-item",
                equippedSlot: null,
                marketListingId: null,
                acquiredAt: new Date(),
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ])).toEqual([]);
    });
    (0, vitest_1.it)("builds equipped slot views from inventory items", () => {
        const equippedItems = (0, inventory_policy_1.buildEquippedInventory)([
            {
                id: "owned-1",
                playerId: "player-1",
                itemId: "rusty-knife",
                name: "Glock 17",
                type: "weapon",
                category: "handguns",
                price: 400,
                equipSlot: "weapon",
                unlockLevel: 1,
                equippedSlot: "weapon",
                marketListingId: null,
                weaponStats: {
                    damageBonus: 4
                },
                armorStats: null,
                acquiredAt: new Date("2026-03-16T20:00:00.000Z")
            },
            {
                id: "owned-2",
                playerId: "player-1",
                itemId: "leather-jacket",
                name: "Leather Jacket",
                type: "armor",
                category: "armor",
                price: 950,
                equipSlot: "armor",
                unlockLevel: 1,
                equippedSlot: "armor",
                marketListingId: null,
                weaponStats: null,
                armorStats: {
                    damageReduction: 3
                },
                acquiredAt: new Date("2026-03-16T20:01:00.000Z")
            }
        ]);
        (0, vitest_1.expect)(equippedItems.weapon?.itemId).toBe("rusty-knife");
        (0, vitest_1.expect)(equippedItems.armor?.itemId).toBe("leather-jacket");
    });
});
