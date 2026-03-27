"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moduleCatalog = void 0;
exports.moduleCatalog = [
    {
        key: "auth",
        name: "Authentication",
        purpose: "Identity, sessions, and access control.",
        dependsOn: [],
        emits: ["auth.session.started", "auth.session.ended"],
        consumes: []
    },
    {
        key: "player",
        name: "Player",
        purpose: "Player profile and long-term progression spine.",
        dependsOn: ["auth"],
        emits: ["player.created", "player.renamed"],
        consumes: ["auth.session.started"]
    },
    {
        key: "stats",
        name: "Stats",
        purpose: "Derived player stats and recovery-facing values.",
        dependsOn: ["player"],
        emits: ["stats.changed"],
        consumes: ["player.created"]
    },
    {
        key: "crime",
        name: "Crime",
        purpose: "Primary solo action loop with risk and reward.",
        dependsOn: ["player"],
        emits: ["crime.completed"],
        consumes: ["player.created"]
    },
    {
        key: "jail",
        name: "Jail",
        purpose: "Arrest restrictions, release logic, and jail timers.",
        dependsOn: ["player", "stats"],
        emits: ["jail.entered", "jail.released"],
        consumes: ["crime.resolved", "combat.resolved"]
    },
    {
        key: "hospital",
        name: "Hospital",
        purpose: "Injury restrictions, healing, and recovery timers.",
        dependsOn: ["player", "stats"],
        emits: ["hospital.entered", "hospital.released"],
        consumes: ["combat.resolved"]
    },
    {
        key: "combat",
        name: "Combat",
        purpose: "PvP and PvE conflict resolution.",
        dependsOn: ["player", "stats", "inventory", "economy"],
        emits: ["combat.started", "combat.won"],
        consumes: ["inventory.item.used"]
    },
    {
        key: "inventory",
        name: "Inventory",
        purpose: "Player-owned items, equipment, and consumables.",
        dependsOn: ["player", "economy"],
        emits: ["inventory.item_purchased", "inventory.item.added", "inventory.item.used"],
        consumes: ["market.item_sold"]
    },
    {
        key: "economy",
        name: "Economy",
        purpose: "Wallets, transfers, faucets, and sinks.",
        dependsOn: ["player"],
        emits: ["economy.balance.changed", "economy.transfer.completed"],
        consumes: ["crime.resolved", "businesses.payout.completed", "territory.payout.completed"]
    },
    {
        key: "businesses",
        name: "Businesses",
        purpose: "Passive income assets and upgrade loops.",
        dependsOn: ["player", "economy"],
        emits: ["businesses.payout.completed"],
        consumes: ["economy.transfer.completed"]
    },
    {
        key: "gangs",
        name: "Gangs",
        purpose: "Gang creation, membership, invites, and basic social coordination.",
        dependsOn: ["player"],
        emits: [
            "gangs.created",
            "gangs.member.joined",
            "gangs.member.left",
            "gangs.invite.created",
            "gangs.invite.accepted",
            "gangs.invite.declined"
        ],
        consumes: ["player.created"]
    },
    {
        key: "territory",
        name: "Territory",
        purpose: "District ownership, current gang control state, and minimal district wars.",
        dependsOn: ["gangs"],
        emits: [
            "territory.district_claimed",
            "territory.payout_claimed",
            "territory.war.started",
            "territory.war_won"
        ],
        consumes: []
    },
    {
        key: "missions",
        name: "Missions",
        purpose: "Directed goals, reward tracks, and progression milestones.",
        dependsOn: ["player", "crime", "inventory", "combat", "territory"],
        emits: ["missions.completed"],
        consumes: [
            "crime.completed",
            "inventory.item_purchased",
            "combat.won",
            "territory.district_claimed"
        ]
    },
    {
        key: "market",
        name: "Market",
        purpose: "Item and resource trading surfaces.",
        dependsOn: ["inventory", "economy"],
        emits: ["market.order.created", "market.item_sold"],
        consumes: ["inventory.item.added"]
    },
    {
        key: "notifications",
        name: "Notifications",
        purpose: "Inbox, alerts, and delivery fan-out.",
        dependsOn: ["player"],
        emits: ["notifications.sent"],
        consumes: ["crime.resolved", "combat.resolved", "gangs.member.joined"]
    },
    {
        key: "live-events",
        name: "Live Events",
        purpose: "Scheduled and operator-controlled global events.",
        dependsOn: ["admin-tools", "notifications"],
        emits: ["live-events.started", "live-events.ended"],
        consumes: ["admin-tools.event.published"]
    },
    {
        key: "leaderboard",
        name: "Leaderboard",
        purpose: "Ranked competition and public prestige surfaces.",
        dependsOn: ["player", "stats"],
        emits: ["leaderboard.updated"],
        consumes: ["crime.resolved", "combat.resolved", "missions.completed"]
    },
    {
        key: "admin-tools",
        name: "Admin Tools",
        purpose: "Operational control, moderation, and balance management.",
        dependsOn: ["auth", "notifications"],
        emits: ["admin-tools.event.published", "admin-tools.balance.updated"],
        consumes: ["auth.session.started"]
    }
];
