import type { AchievementDefinition, AchievementTriggerType } from "./achievements.types";

export const starterAchievementCatalog = [
  // ── Crimes ──────────────────────────────────────────────
  {
    id: "complete_first_crime",
    name: "First Crime",
    description: "Complete your first crime attempt.",
    triggerType: "crime_completed_count",
    targetCount: 1
  },
  {
    id: "complete_5_crimes",
    name: "Small-Time Crook",
    description: "Complete 5 crimes.",
    triggerType: "crime_completed_count",
    targetCount: 5
  },
  {
    id: "complete_10_crimes",
    name: "Petty Criminal",
    description: "Complete 10 crimes.",
    triggerType: "crime_completed_count",
    targetCount: 10
  },
  {
    id: "complete_25_crimes",
    name: "Street Hustler",
    description: "Complete 25 crimes.",
    triggerType: "crime_completed_count",
    targetCount: 25
  },
  {
    id: "complete_50_crimes",
    name: "Career Criminal",
    description: "Complete 50 crimes.",
    triggerType: "crime_completed_count",
    targetCount: 50
  },
  {
    id: "complete_100_crimes",
    name: "Hardened Felon",
    description: "Complete 100 crimes.",
    triggerType: "crime_completed_count",
    targetCount: 100
  },
  {
    id: "complete_250_crimes",
    name: "Made Man",
    description: "Complete 250 crimes.",
    triggerType: "crime_completed_count",
    targetCount: 250
  },
  {
    id: "complete_500_crimes",
    name: "Crime Boss",
    description: "Complete 500 crimes.",
    triggerType: "crime_completed_count",
    targetCount: 500
  },
  {
    id: "complete_1000_crimes",
    name: "Legendary Outlaw",
    description: "Complete 1,000 crimes.",
    triggerType: "crime_completed_count",
    targetCount: 1000
  },

  // ── Shop / Inventory ─────────────────────────────────────
  {
    id: "buy_first_item",
    name: "First Purchase",
    description: "Buy your first shop item.",
    triggerType: "inventory_item_purchased_count",
    targetCount: 1
  },
  {
    id: "buy_5_items",
    name: "Gear Up",
    description: "Buy 5 items from the shop.",
    triggerType: "inventory_item_purchased_count",
    targetCount: 5
  },
  {
    id: "buy_10_items",
    name: "Well Equipped",
    description: "Buy 10 items from the shop.",
    triggerType: "inventory_item_purchased_count",
    targetCount: 10
  },
  {
    id: "buy_25_items",
    name: "Armory Owner",
    description: "Buy 25 items from the shop.",
    triggerType: "inventory_item_purchased_count",
    targetCount: 25
  },
  {
    id: "buy_50_items",
    name: "Black Market Regular",
    description: "Buy 50 items from the shop.",
    triggerType: "inventory_item_purchased_count",
    targetCount: 50
  },

  // ── Combat ───────────────────────────────────────────────
  {
    id: "win_first_combat",
    name: "First Win",
    description: "Win your first combat.",
    triggerType: "combat_won_count",
    targetCount: 1
  },
  {
    id: "win_5_combats",
    name: "Street Fighter",
    description: "Win 5 combats.",
    triggerType: "combat_won_count",
    targetCount: 5
  },
  {
    id: "win_10_combats",
    name: "Brawler",
    description: "Win 10 combats.",
    triggerType: "combat_won_count",
    targetCount: 10
  },
  {
    id: "win_25_combats",
    name: "Enforcer",
    description: "Win 25 combats.",
    triggerType: "combat_won_count",
    targetCount: 25
  },
  {
    id: "win_50_combats",
    name: "Hitman",
    description: "Win 50 combats.",
    triggerType: "combat_won_count",
    targetCount: 50
  },
  {
    id: "win_100_combats",
    name: "Assassin",
    description: "Win 100 combats.",
    triggerType: "combat_won_count",
    targetCount: 100
  },

  // ── Territory ─────────────────────────────────────────────
  {
    id: "claim_first_district",
    name: "First Claim",
    description: "Claim your first district for your gang.",
    triggerType: "territory_district_claimed_count",
    targetCount: 1
  },
  {
    id: "claim_3_districts",
    name: "Neighborhood Boss",
    description: "Claim 3 districts for your gang.",
    triggerType: "territory_district_claimed_count",
    targetCount: 3
  },
  {
    id: "claim_5_districts",
    name: "City Influence",
    description: "Claim 5 districts for your gang.",
    triggerType: "territory_district_claimed_count",
    targetCount: 5
  },
  {
    id: "claim_10_districts",
    name: "Territorial Expansion",
    description: "Claim 10 districts for your gang.",
    triggerType: "territory_district_claimed_count",
    targetCount: 10
  },

  // ── Territory Wars ────────────────────────────────────────
  {
    id: "win_first_war",
    name: "First Victory",
    description: "Win your first gang war.",
    triggerType: "territory_war_won_count",
    targetCount: 1
  },
  {
    id: "win_3_wars",
    name: "Warlord",
    description: "Win 3 gang wars.",
    triggerType: "territory_war_won_count",
    targetCount: 3
  },
  {
    id: "win_5_wars",
    name: "Conqueror",
    description: "Win 5 gang wars.",
    triggerType: "territory_war_won_count",
    targetCount: 5
  },

  // ── Territory Payouts ─────────────────────────────────────
  {
    id: "claim_first_payout",
    name: "Payday",
    description: "Claim your first territory payout.",
    triggerType: "territory_payout_claimed_count",
    targetCount: 1
  },
  {
    id: "claim_5_payouts",
    name: "Steady Income",
    description: "Claim 5 territory payouts.",
    triggerType: "territory_payout_claimed_count",
    targetCount: 5
  },
  {
    id: "claim_10_payouts",
    name: "Cash Cow",
    description: "Claim 10 territory payouts.",
    triggerType: "territory_payout_claimed_count",
    targetCount: 10
  },
  {
    id: "claim_25_payouts",
    name: "Passive Empire",
    description: "Claim 25 territory payouts.",
    triggerType: "territory_payout_claimed_count",
    targetCount: 25
  },

  // ── Market ────────────────────────────────────────────────
  {
    id: "sell_first_item",
    name: "First Sale",
    description: "Sell your first item on the market.",
    triggerType: "market_item_sold_count",
    targetCount: 1
  },
  {
    id: "sell_5_items",
    name: "Fence",
    description: "Sell 5 items on the market.",
    triggerType: "market_item_sold_count",
    targetCount: 5
  },
  {
    id: "sell_10_items",
    name: "Black Market Dealer",
    description: "Sell 10 items on the market.",
    triggerType: "market_item_sold_count",
    targetCount: 10
  },
  {
    id: "sell_25_items",
    name: "Underground Merchant",
    description: "Sell 25 items on the market.",
    triggerType: "market_item_sold_count",
    targetCount: 25
  },
  {
    id: "sell_50_items",
    name: "Crime Lord Trader",
    description: "Sell 50 items on the market.",
    triggerType: "market_item_sold_count",
    targetCount: 50
  }
] as const satisfies readonly AchievementDefinition[];

export function getAchievementById(
  achievementId: string
): AchievementDefinition | undefined {
  return starterAchievementCatalog.find((achievement) => achievement.id === achievementId);
}

export function getAchievementsByTriggerType(
  triggerType: AchievementTriggerType
): AchievementDefinition[] {
  return starterAchievementCatalog.filter(
    (achievement) => achievement.triggerType === triggerType
  );
}
