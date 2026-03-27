import type { LeaderboardDefinition, LeaderboardView } from "../domain/leaderboard.types";
import { type LeaderboardRepository } from "./leaderboard.repository";
export declare class LeaderboardService {
    private readonly leaderboardRepository;
    constructor(leaderboardRepository: LeaderboardRepository);
    listLeaderboards(): readonly LeaderboardDefinition[];
    getLeaderboard(leaderboardId: string, requestedLimit?: number): Promise<LeaderboardView>;
    private normalizeLimit;
}
