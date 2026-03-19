import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module";
import { PlayerService } from "./application/player.service";
import { PLAYER_REPOSITORY } from "./application/player.repository";
import { PlayerController } from "./api/player.controller";
import { PrismaPlayerRepository } from "./infrastructure/prisma-player.repository";

@Module({
  imports: [AuthModule],
  controllers: [PlayerController],
  providers: [
    PlayerService,
    {
      provide: PLAYER_REPOSITORY,
      useClass: PrismaPlayerRepository
    }
  ],
  exports: [PlayerService]
})
export class PlayerModule {}
