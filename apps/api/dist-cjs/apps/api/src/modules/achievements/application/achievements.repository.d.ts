import type { PlayerAchievementSnapshot } from "../domain/achievements.types";
export declare const ACHIEVEMENTS_REPOSITORY: unique symbol;
export interface CreatePlayerAchievementRecord {
    playerId: string;
    achievementId: string;
    progress: number;
    targetProgress: number;
    unlockedAt: Date | null;
}
export interface UpdatePlayerAchievementProgressRecord {
    playerAchievementId: string;
    progress: number;
    targetProgress: number;
    unlockedAt: Date | null;
}
export interface AchievementsRepository {
    listByPlayerId(playerId: string): Promise<PlayerAchievementSnapshot[]>;
    createAchievement(record: CreatePlayerAchievementRecord): Promise<PlayerAchievementSnapshot>;
    updateProgress(record: UpdatePlayerAchievementProgressRecord): Promise<PlayerAchievementSnapshot>;
}
