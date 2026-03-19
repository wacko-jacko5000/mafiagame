import { Module } from "@nestjs/common";

import { LeaderboardService } from "./application/leaderboard.service";
import { LEADERBOARD_REPOSITORY } from "./application/leaderboard.repository";
import { LeaderboardController } from "./api/leaderboard.controller";
import { PrismaLeaderboardRepository } from "./infrastructure/prisma-leaderboard.repository";

@Module({
  controllers: [LeaderboardController],
  providers: [
    LeaderboardService,
    {
      provide: LEADERBOARD_REPOSITORY,
      useClass: PrismaLeaderboardRepository
    }
  ],
  exports: [LeaderboardService]
})
export class LeaderboardModule {}
