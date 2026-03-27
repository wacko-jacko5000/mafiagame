import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module";
import { CustodyModule } from "../custody/custody.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { PlayerModule } from "../player/player.module";
import { JailService } from "./application/jail.service";
import { JailController } from "./api/jail.controller";

@Module({
  imports: [AuthModule, PlayerModule, CustodyModule, NotificationsModule],
  controllers: [JailController],
  providers: [JailService],
  exports: [JailService]
})
export class JailModule {}
