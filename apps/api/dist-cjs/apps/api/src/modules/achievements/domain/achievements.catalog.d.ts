import type { AchievementDefinition, AchievementTriggerType } from "./achievements.types";
export declare const starterAchievementCatalog: readonly [{
    readonly id: "complete_first_crime";
    readonly name: "First Crime";
    readonly description: "Complete your first crime attempt.";
    readonly triggerType: "crime_completed_count";
    readonly targetCount: 1;
}, {
    readonly id: "buy_first_item";
    readonly name: "First Purchase";
    readonly description: "Buy your first shop item.";
    readonly triggerType: "inventory_item_purchased_count";
    readonly targetCount: 1;
}, {
    readonly id: "win_first_combat";
    readonly name: "First Win";
    readonly description: "Win your first combat.";
    readonly triggerType: "combat_won_count";
    readonly targetCount: 1;
}, {
    readonly id: "claim_first_district";
    readonly name: "First Claim";
    readonly description: "Claim your first district for your gang.";
    readonly triggerType: "territory_district_claimed_count";
    readonly targetCount: 1;
}, {
    readonly id: "sell_first_item";
    readonly name: "First Sale";
    readonly description: "Sell your first item on the market.";
    readonly triggerType: "market_item_sold_count";
    readonly targetCount: 1;
}];
export declare function getAchievementById(achievementId: string): AchievementDefinition | undefined;
export declare function getAchievementsByTriggerType(triggerType: AchievementTriggerType): AchievementDefinition[];
