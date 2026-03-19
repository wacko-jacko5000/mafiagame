import { Inject, Injectable, NotFoundException } from "@nestjs/common";

import { PlayerService } from "../../player/application/player.service";
import type { CreatePlayerActivity, PlayerActivitySnapshot } from "../domain/player-activity.types";
import {
  PLAYER_ACTIVITY_REPOSITORY,
  type PlayerActivityRepository
} from "./player-activity.repository";

const DEFAULT_ACTIVITY_LIMIT = 20;
const MAX_ACTIVITY_LIMIT = 100;

@Injectable()
export class PlayerActivityService {
  constructor(
    @Inject(PlayerService)
    private readonly playerService: PlayerService,
    @Inject(PLAYER_ACTIVITY_REPOSITORY)
    private readonly playerActivityRepository: PlayerActivityRepository
  ) {}

  async listPlayerActivity(
    playerId: string,
    limit = DEFAULT_ACTIVITY_LIMIT
  ): Promise<PlayerActivitySnapshot[]> {
    await this.playerService.getPlayerById(playerId);
    return this.playerActivityRepository.listByPlayerId(
      playerId,
      Math.min(Math.max(limit, 1), MAX_ACTIVITY_LIMIT)
    );
  }

  async createActivity(activity: CreatePlayerActivity): Promise<PlayerActivitySnapshot> {
    return this.playerActivityRepository.createActivity(activity);
  }

  async markActivityRead(
    playerId: string,
    activityId: string
  ): Promise<PlayerActivitySnapshot> {
    await this.playerService.getPlayerById(playerId);
    const activity = await this.playerActivityRepository.markAsRead(
      playerId,
      activityId,
      new Date()
    );

    if (!activity) {
      throw new NotFoundException(
        `Activity item "${activityId}" was not found for player "${playerId}".`
      );
    }

    return activity;
  }
}
