import { PrismaService } from "../../../platform/database/prisma.service";
import type { LeaderboardRepository } from "../application/leaderboard.repository";
import type { LeaderboardId, LeaderboardMetricRecord } from "../domain/leaderboard.types";
export declare class PrismaLeaderboardRepository implements LeaderboardRepository {
    private readonly prismaService;
    constructor(prismaService: PrismaService);
    listLeaderboardRecords(leaderboardId: LeaderboardId, limit: number): Promise<LeaderboardMetricRecord[]>;
    private listRichestPlayers;
    private listMostRespectedPlayers;
    private listPlayersByAchievementCount;
}
