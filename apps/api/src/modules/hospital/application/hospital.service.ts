import { ConflictException, Inject, Injectable } from "@nestjs/common";

import { CustodyBalanceService } from "../../custody/application/custody-balance.service";
import { PlayerActivityService } from "../../notifications/application/player-activity.service";
import { PlayerService } from "../../player/application/player.service";
import { derivePlayerProgression } from "../../player/domain/player.policy";
import { PlayerHospitalizedError } from "../domain/hospital.errors";
import {
  buildHospitalReleaseTime,
  getHospitalStatus
} from "../domain/hospital.policy";
import type { HospitalStatus } from "../domain/hospital.types";

@Injectable()
export class HospitalService {
  constructor(
    @Inject(CustodyBalanceService)
    private readonly custodyBalanceService: CustodyBalanceService,
    @Inject(PlayerActivityService)
    private readonly playerActivityService: PlayerActivityService,
    @Inject(PlayerService)
    private readonly playerService: PlayerService
  ) {}

  async getStatus(playerId: string, now = new Date()): Promise<HospitalStatus> {
    const player = await this.playerService.getPlayerByIdAt(playerId, now);
    const status = getHospitalStatus(playerId, player.hospitalizedUntil, now);

    return {
      ...status,
      reason: player.hospitalReason ?? null
    };
  }

  async hospitalizePlayer(
    playerId: string,
    durationSeconds: number,
    reason: string | null = null,
    now = new Date()
  ): Promise<HospitalStatus> {
    const until = buildHospitalReleaseTime(now, durationSeconds);
    await this.playerService.applyCustodyEntry(playerId, {
      statusType: "hospital",
      until,
      reason
    });
    await this.playerActivityService.createActivity({
      playerId,
      type: "hospital.entered",
      title: "You are in the hospital",
      createdAt: now,
      body: reason
        ? `${reason} Recovery lasts until ${until.toISOString()}.`
        : `Recovery lasts until ${until.toISOString()}.`
    });

    return {
      playerId,
      active: true,
      until,
      remainingSeconds: durationSeconds,
      reason
    };
  }

  async getBuyoutQuote(playerId: string, now = new Date()) {
    const player = await this.playerService.getPlayerByIdAt(playerId, now);
    const status = getHospitalStatus(playerId, player.hospitalizedUntil, now);
    const progression = derivePlayerProgression(player.respect);

    return this.custodyBalanceService.buildQuote({
      statusType: "hospital",
      active: status.active,
      until: status.until,
      reason: player.hospitalReason ?? null,
      remainingSeconds: status.remainingSeconds,
      playerLevel: progression.level,
      entryCountSinceLevelReset: player.hospitalEntryCount ?? 0
    });
  }

  async buyOut(playerId: string, now = new Date()) {
    const player = await this.playerService.getPlayerByIdAt(playerId, now);
    const status = getHospitalStatus(playerId, player.hospitalizedUntil, now);
    const progression = derivePlayerProgression(player.respect);
    const quote = this.custodyBalanceService.buildQuote({
      statusType: "hospital",
      active: status.active,
      until: status.until,
      reason: player.hospitalReason ?? null,
      remainingSeconds: status.remainingSeconds,
      playerLevel: progression.level,
      entryCountSinceLevelReset: player.hospitalEntryCount ?? 0
    });

    if (!quote.active || !quote.buyoutPrice) {
      throw new ConflictException("Player is not currently hospitalized.");
    }

    if (player.cash < quote.buyoutPrice) {
      throw new ConflictException(
        "Player does not have enough cash to buy out of hospital."
      );
    }

    const updatedPlayer = await this.playerService.buyOutCustodyStatus(playerId, {
      statusType: "hospital",
      buyoutPrice: quote.buyoutPrice,
      now
    });

    if (!updatedPlayer) {
      throw new ConflictException("Hospital buyout could not be completed.");
    }

    await this.playerActivityService.createActivity({
      playerId,
      type: "hospital.buyout",
      title: "Discharge purchased",
      createdAt: now,
      body: `You paid ${quote.buyoutPrice} cash to be discharged immediately.`
    });

    return {
      player: updatedPlayer,
      buyoutPrice: quote.buyoutPrice
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
