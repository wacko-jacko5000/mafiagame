import { Inject, Injectable } from "@nestjs/common";

import { DomainEventsService } from "../../../platform/domain-events/domain-events.service";
import { PlayerService } from "../../player/application/player.service";
import {
  getAchievementsByTriggerType,
  starterAchievementCatalog
} from "../domain/achievements.catalog";
import type {
  AchievementDefinition,
  AchievementTriggerType,
  PlayerAchievementSnapshot,
  PlayerAchievementView
} from "../domain/achievements.types";
import {
  ACHIEVEMENTS_REPOSITORY,
  type AchievementsRepository
} from "./achievements.repository";

@Injectable()
export class AchievementsService {
  constructor(
    @Inject(PlayerService)
    private readonly playerService: PlayerService,
    @Inject(DomainEventsService)
    private readonly domainEventsService: DomainEventsService,
    @Inject(ACHIEVEMENTS_REPOSITORY)
    private readonly achievementsRepository: AchievementsRepository
  ) {}

  listAchievements(): readonly AchievementDefinition[] {
    return starterAchievementCatalog;
  }

  async listPlayerAchievements(playerId: string): Promise<PlayerAchievementView[]> {
    await this.playerService.getPlayerById(playerId);
    const existingAchievements = await this.achievementsRepository.listByPlayerId(playerId);
    const achievementMap = new Map(
      existingAchievements.map((achievement) => [achievement.achievementId, achievement])
    );

    return starterAchievementCatalog.map((definition) =>
      this.toAchievementView(
        playerId,
        achievementMap.get(definition.id) ?? null,
        definition
      )
    );
  }

  async recordProgress(
    playerId: string,
    triggerType: AchievementTriggerType,
    amount = 1
  ): Promise<void> {
    if (amount <= 0) {
      return;
    }

    const definitions = getAchievementsByTriggerType(triggerType);

    if (definitions.length === 0) {
      return;
    }

    const existingAchievements = await this.achievementsRepository.listByPlayerId(playerId);
    const achievementMap = new Map(
      existingAchievements.map((achievement) => [achievement.achievementId, achievement])
    );
    const unlockedAt = new Date();

    await Promise.all(
      definitions.map(async (definition) => {
        const existingAchievement = achievementMap.get(definition.id);
        const nextProgress = Math.min(
          (existingAchievement?.progress ?? 0) + amount,
          definition.targetCount
        );
        const unlockedAtForRecord =
          existingAchievement?.unlockedAt ??
          (nextProgress >= definition.targetCount ? unlockedAt : null);
        const didUnlock =
          !existingAchievement?.unlockedAt &&
          unlockedAtForRecord !== null &&
          nextProgress >= definition.targetCount;

        if (existingAchievement) {
          if (
            existingAchievement.progress >= existingAchievement.targetProgress &&
            existingAchievement.unlockedAt
          ) {
            return;
          }

          await this.achievementsRepository.updateProgress({
            playerAchievementId: existingAchievement.id,
            progress: nextProgress,
            targetProgress: definition.targetCount,
            unlockedAt: unlockedAtForRecord
          });

          if (didUnlock) {
            await this.publishUnlockedEvent(playerId, definition, unlockedAtForRecord);
          }
          return;
        }

        await this.achievementsRepository.createAchievement({
          playerId,
          achievementId: definition.id,
          progress: nextProgress,
          targetProgress: definition.targetCount,
          unlockedAt: unlockedAtForRecord
        });

        if (didUnlock) {
          await this.publishUnlockedEvent(playerId, definition, unlockedAtForRecord);
        }
      })
    );
  }

  private async publishUnlockedEvent(
    playerId: string,
    definition: AchievementDefinition,
    unlockedAt: Date
  ): Promise<void> {
    await this.domainEventsService.publish({
      type: "achievements.unlocked",
      occurredAt: unlockedAt,
      playerId,
      achievementId: definition.id,
      achievementName: definition.name,
      achievementDescription: definition.description
    });
  }

  private toAchievementView(
    playerId: string,
    achievement: PlayerAchievementSnapshot | null,
    definition: AchievementDefinition
  ): PlayerAchievementView {
    return {
      playerId,
      achievementId: definition.id,
      progress: achievement?.progress ?? 0,
      targetProgress: achievement?.targetProgress ?? definition.targetCount,
      unlockedAt: achievement?.unlockedAt ?? null,
      definition
    };
  }
}
