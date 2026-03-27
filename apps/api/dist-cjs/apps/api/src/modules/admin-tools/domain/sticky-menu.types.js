"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultStickyMenuConfig = exports.stickyMenuConfigId = exports.stickyMenuPrimaryMaxItems = exports.stickyHeaderResourceKeys = exports.stickyMenuDestinationKeys = void 0;
exports.stickyMenuDestinationKeys = [
    "home",
    "crimes",
    "missions",
    "shop",
    "business",
    "inventory",
    "activity",
    "achievements",
    "gangs",
    "territory",
    "market",
    "leaderboard",
    "more"
];
exports.stickyHeaderResourceKeys = [
    "cash",
    "respect",
    "energy",
    "health",
    "rank"
];
exports.stickyMenuPrimaryMaxItems = 5;
exports.stickyMenuConfigId = "default";
exports.defaultStickyMenuConfig = {
    header: {
        enabled: true,
        resourceKeys: ["cash", "respect"]
    },
    primaryItems: ["home", "crimes", "missions", "shop", "more"],
    moreItems: [
        "business",
        "inventory",
        "activity",
        "achievements",
        "gangs",
        "territory",
        "market",
        "leaderboard"
    ]
};
