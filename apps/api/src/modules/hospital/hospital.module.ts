import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module";
import { CustodyModule } from "../custody/custody.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { PlayerModule } from "../player/player.module";
import { HospitalService } from "./application/hospital.service";
import { HospitalController } from "./api/hospital.controller";

@Module({
  imports: [AuthModule, PlayerModule, CustodyModule, NotificationsModule],
  controllers: [HospitalController],
  providers: [HospitalService],
  exports: [HospitalService]
})
export class HospitalModule {}
