import { ConflictException, Inject, Injectable } from "@nestjs/common";

import { PlayerService } from "../../player/application/player.service";
import { PlayerHospitalizedError } from "../domain/hospital.errors";
import {
  buildHospitalReleaseTime,
  getHospitalStatus
} from "../domain/hospital.policy";
import type { HospitalStatus } from "../domain/hospital.types";

@Injectable()
export class HospitalService {
  constructor(
    @Inject(PlayerService)
    private readonly playerService: PlayerService
  ) {}

  async getStatus(playerId: string, now = new Date()): Promise<HospitalStatus> {
    const player = await this.playerService.getPlayerById(playerId);
    return getHospitalStatus(playerId, player.hospitalizedUntil, now);
  }

  async hospitalizePlayer(
    playerId: string,
    durationSeconds: number,
    now = new Date()
  ): Promise<HospitalStatus> {
    const until = buildHospitalReleaseTime(now, durationSeconds);
    await this.playerService.updateCustodyStatus(playerId, {
      hospitalizedUntil: until
    });

    return {
      playerId,
      active: true,
      until,
      remainingSeconds: durationSeconds
    };
  }

  async assertCrimeExecutionAllowed(
    playerId: string,
    now = new Date()
  ): Promise<void> {
    const status = await this.getStatus(playerId, now);

    if (status.active && status.until) {
      throw new ConflictException(
        new PlayerHospitalizedError(status.until).message
      );
    }
  }
}
