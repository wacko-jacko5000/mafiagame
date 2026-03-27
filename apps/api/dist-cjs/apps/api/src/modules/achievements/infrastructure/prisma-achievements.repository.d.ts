import { PrismaService } from "../../../platform/database/prisma.service";
import type { PlayerAchievementSnapshot } from "../domain/achievements.types";
import type { AchievementsRepository, CreatePlayerAchievementRecord, UpdatePlayerAchievementProgressRecord } from "../application/achievements.repository";
export declare class PrismaAchievementsRepository implements AchievementsRepository {
    private readonly prismaService;
    constructor(prismaService: PrismaService);
    listByPlayerId(playerId: string): Promise<PlayerAchievementSnapshot[]>;
    createAchievement(record: CreatePlayerAchievementRecord): Promise<PlayerAchievementSnapshot>;
    updateProgress(record: UpdatePlayerAchievementProgressRecord): Promise<PlayerAchievementSnapshot>;
}
