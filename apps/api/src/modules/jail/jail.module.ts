import { Module } from "@nestjs/common";

import { PlayerModule } from "../player/player.module";
import { JailService } from "./application/jail.service";
import { JailController } from "./api/jail.controller";

@Module({
  imports: [PlayerModule],
  controllers: [JailController],
  providers: [JailService],
  exports: [JailService]
})
export class JailModule {}
