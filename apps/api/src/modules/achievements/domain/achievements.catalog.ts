import type { AchievementDefinition, AchievementTriggerType } from "./achievements.types";

export const starterAchievementCatalog = [
  {
    id: "complete_first_crime",
    name: "First Crime",
    description: "Complete your first crime attempt.",
    triggerType: "crime_completed_count",
    targetCount: 1
  },
  {
    id: "buy_first_item",
    name: "First Purchase",
    description: "Buy your first shop item.",
    triggerType: "inventory_item_purchased_count",
    targetCount: 1
  },
  {
    id: "win_first_combat",
    name: "First Win",
    description: "Win your first combat.",
    triggerType: "combat_won_count",
    targetCount: 1
  },
  {
    id: "claim_first_district",
    name: "First Claim",
    description: "Claim your first district for your gang.",
    triggerType: "territory_district_claimed_count",
    targetCount: 1
  },
  {
    id: "sell_first_item",
    name: "First Sale",
    description: "Sell your first item on the market.",
    triggerType: "market_item_sold_count",
    targetCount: 1
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
