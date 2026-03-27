import { ConflictException, Inject, Injectable } from "@nestjs/common";

import { CustodyBalanceService } from "../../custody/application/custody-balance.service";
import { PlayerActivityService } from "../../notifications/application/player-activity.service";
import { PlayerService } from "../../player/application/player.service";
import { derivePlayerProgression } from "../../player/domain/player.policy";
import { PlayerJailedError } from "../domain/jail.errors";
import { buildJailReleaseTime, getJailStatus } from "../domain/jail.policy";
import type { JailStatus } from "../domain/jail.types";

@Injectable()
export class JailService {
  constructor(
    @Inject(CustodyBalanceService)
    private readonly custodyBalanceService: CustodyBalanceService,
    @Inject(PlayerActivityService)
    private readonly playerActivityService: PlayerActivityService,
    @Inject(PlayerService)
    private readonly playerService: PlayerService
  ) {}

  async getStatus(playerId: string, now = new Date()): Promise<JailStatus> {
    const player = await this.playerService.getPlayerByIdAt(playerId, now);
    const status = getJailStatus(playerId, player.jailedUntil, now);

    return {
      ...status,
      reason: player.jailReason ?? null
    };
  }

  async jailPlayer(
    playerId: string,
    durationSeconds: number,
    reason: string | null = null,
    now = new Date()
  ): Promise<JailStatus> {
    const until = buildJailReleaseTime(now, durationSeconds);
    await this.playerService.applyCustodyEntry(playerId, {
      statusType: "jail",
      until,
      reason
    });
    await this.playerActivityService.createActivity({
      playerId,
      type: "jail.entered",
      title: "You are in jail",
      createdAt: now,
      body: reason
        ? `${reason} You are jailed until ${until.toISOString()}.`
        : `You are jailed until ${until.toISOString()}.`
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
    const status = getJailStatus(playerId, player.jailedUntil, now);
    const progression = derivePlayerProgression(player.respect);

    return this.custodyBalanceService.buildQuote({
      statusType: "jail",
      active: status.active,
      until: status.until,
      reason: player.jailReason ?? null,
      remainingSeconds: status.remainingSeconds,
      playerLevel: progression.level,
      entryCountSinceLevelReset: player.jailEntryCount ?? 0
    });
  }

  async buyOut(playerId: string, now = new Date()) {
    const player = await this.playerService.getPlayerByIdAt(playerId, now);
    const status = getJailStatus(playerId, player.jailedUntil, now);
    const progression = derivePlayerProgression(player.respect);
    const quote = this.custodyBalanceService.buildQuote({
      statusType: "jail",
      active: status.active,
      until: status.until,
      reason: player.jailReason ?? null,
      remainingSeconds: status.remainingSeconds,
      playerLevel: progression.level,
      entryCountSinceLevelReset: player.jailEntryCount ?? 0
    });

    if (!quote.active || !quote.buyoutPrice) {
      throw new ConflictException("Player is not currently jailed.");
    }

    if (player.cash < quote.buyoutPrice) {
      throw new ConflictException("Player does not have enough cash to buy out of jail.");
    }

    const updatedPlayer = await this.playerService.buyOutCustodyStatus(playerId, {
      statusType: "jail",
      buyoutPrice: quote.buyoutPrice,
      now
    });

    if (!updatedPlayer) {
      throw new ConflictException("Jail buyout could not be completed.");
    }

    await this.playerActivityService.createActivity({
      playerId,
      type: "jail.buyout",
      title: "Bought your freedom",
      createdAt: now,
      body: `You paid ${quote.buyoutPrice} cash to leave jail immediately.`
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
      throw new ConflictException(new PlayerJailedError(status.until).message);
    }
  }
}
