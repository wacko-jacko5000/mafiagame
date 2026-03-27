export type AchievementTriggerType = "crime_completed_count" | "inventory_item_purchased_count" | "combat_won_count" | "territory_district_claimed_count" | "market_item_sold_count";
export interface AchievementDefinition {
    id: string;
    name: string;
    description: string;
    triggerType: AchievementTriggerType;
    targetCount: number;
}
export interface PlayerAchievementSnapshot {
    id: string;
    playerId: string;
    achievementId: string;
    progress: number;
    targetProgress: number;
    unlockedAt: Date | null;
}
export interface PlayerAchievementView {
    playerId: string;
    achievementId: string;
    progress: number;
    targetProgress: number;
    unlockedAt: Date | null;
    definition: AchievementDefinition;
}
