import { Controller, Get, Inject, Param, ParseUUIDPipe } from "@nestjs/common";

import { HospitalService } from "../application/hospital.service";
import type { HospitalStatusResponseBody } from "./hospital.contracts";
import { toHospitalStatusResponseBody } from "./hospital.presenter";

@Controller("players/:playerId/hospital")
export class HospitalController {
  constructor(
    @Inject(HospitalService)
    private readonly hospitalService: HospitalService
  ) {}

  @Get("status")
  async getStatus(
    @Param("playerId", ParseUUIDPipe) playerId: string
  ): Promise<HospitalStatusResponseBody> {
    const status = await this.hospitalService.getStatus(playerId);
    return toHospitalStatusResponseBody(status);
  }
}
