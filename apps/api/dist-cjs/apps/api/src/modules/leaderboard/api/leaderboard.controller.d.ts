import { LeaderboardService } from "../application/leaderboard.service";
import type { LeaderboardDefinitionResponseBody, LeaderboardResponseBody } from "./leaderboard.contracts";
export declare class LeaderboardController {
    private readonly leaderboardService;
    constructor(leaderboardService: LeaderboardService);
    getLeaderboards(): LeaderboardDefinitionResponseBody[];
    getLeaderboard(leaderboardId: string, limit?: string): Promise<LeaderboardResponseBody>;
}
