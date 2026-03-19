import { ConflictException, Inject, Injectable } from "@nestjs/common";

import { PlayerService } from "../../player/application/player.service";
import { PlayerJailedError } from "../domain/jail.errors";
import { buildJailReleaseTime, getJailStatus } from "../domain/jail.policy";
import type { JailStatus } from "../domain/jail.types";

@Injectable()
export class JailService {
  constructor(
    @Inject(PlayerService)
    private readonly playerService: PlayerService
  ) {}

  async getStatus(playerId: string, now = new Date()): Promise<JailStatus> {
    const player = await this.playerService.getPlayerById(playerId);
    return getJailStatus(playerId, player.jailedUntil, now);
  }

  async jailPlayer(
    playerId: string,
    durationSeconds: number,
    now = new Date()
  ): Promise<JailStatus> {
    const until = buildJailReleaseTime(now, durationSeconds);
    await this.playerService.updateCustodyStatus(playerId, {
      jailedUntil: until
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
      throw new ConflictException(new PlayerJailedError(status.until).message);
    }
  }
}
