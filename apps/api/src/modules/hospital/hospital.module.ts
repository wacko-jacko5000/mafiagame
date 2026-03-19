import { Module } from "@nestjs/common";

import { PlayerModule } from "../player/player.module";
import { HospitalService } from "./application/hospital.service";
import { HospitalController } from "./api/hospital.controller";

@Module({
  imports: [PlayerModule],
  controllers: [HospitalController],
  providers: [HospitalService],
  exports: [HospitalService]
})
export class HospitalModule {}
