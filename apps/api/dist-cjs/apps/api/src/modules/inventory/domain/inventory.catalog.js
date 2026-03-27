"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.starterShopItemCatalog = void 0;
exports.getShopItemById = getShopItemById;
exports.getEquipmentItemById = getEquipmentItemById;
exports.getConsumableItemById = getConsumableItemById;
exports.applyShopItemBalanceOverride = applyShopItemBalanceOverride;
exports.resetStarterItemCatalog = resetStarterItemCatalog;
const inventory_armor_catalog_1 = require("./inventory-armor.catalog");
const inventory_consumable_catalog_1 = require("./inventory-consumable.catalog");
const inventory_weapon_unlock_catalog_1 = require("./inventory-weapon-unlock.catalog");
const defaultShopItemCatalog = [
    ...inventory_weapon_unlock_catalog_1.weaponUnlockCatalog.map(toEquipmentItemDefinition),
    ...inventory_armor_catalog_1.armorCatalog.map(toEquipmentItemDefinition),
    ...inventory_consumable_catalog_1.consumableCatalog
];
exports.starterShopItemCatalog = defaultShopItemCatalog.map(cloneShopItemDefinition);
function getShopItemById(itemId) {
    return exports.starterShopItemCatalog.find((item) => item.id === itemId);
}
function getEquipmentItemById(itemId) {
    const item = getShopItemById(itemId);
    return item?.delivery === "inventory" ? item : undefined;
}
function getConsumableItemById(itemId) {
    const item = getShopItemById(itemId);
    return item?.delivery === "instant" ? item : undefined;
}
function applyShopItemBalanceOverride(itemId, values) {
    const item = getShopItemById(itemId);
    if (!item) {
        return undefined;
    }
    item.price = values.price;
    return item;
}
function resetStarterItemCatalog() {
    exports.starterShopItemCatalog.forEach((item, index) => {
        const defaultItem = defaultShopItemCatalog[index];
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
function cloneShopItemDefinition(item) {
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
function toEquipmentItemDefinition(item) {
    return {
        ...item,
        delivery: "inventory",
        consumableEffects: null
    };
}
