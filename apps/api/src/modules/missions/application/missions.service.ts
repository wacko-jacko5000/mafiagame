import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException
} from "@nestjs/common";

import { PlayerService } from "../../player/application/player.service";
import { getMissionById, starterMissionCatalog } from "../domain/missions.catalog";
import {
  MissionAlreadyActiveError,
  MissionAlreadyCompletedError,
  MissionNotAcceptedError,
  MissionNotFoundError,
  MissionProgressIncompleteError
} from "../domain/missions.errors";
import type {
  MissionCompletionResult,
  MissionDefinition,
  MissionObjectiveType,
  PlayerMissionSnapshot,
  PlayerMissionView
} from "../domain/missions.types";
import {
  MISSIONS_REPOSITORY,
  type MissionsRepository
} from "./missions.repository";

@Injectable()
export class MissionsService {
  constructor(
    @Inject(PlayerService)
    private readonly playerService: PlayerService,
    @Inject(MISSIONS_REPOSITORY)
    private readonly missionsRepository: MissionsRepository
  ) {}

  listMissions(): readonly MissionDefinition[] {
    return starterMissionCatalog;
  }

  async listPlayerMissions(playerId: string): Promise<PlayerMissionView[]> {
    await this.playerService.getPlayerById(playerId);
    const missions = await this.missionsRepository.listByPlayerId(playerId);

    return missions
      .map((mission) => this.toMissionView(mission))
      .filter((mission): mission is PlayerMissionView => mission !== null);
  }

  async acceptMission(playerId: string, missionId: string): Promise<PlayerMissionView> {
    const definition = this.getMissionDefinitionOrThrow(missionId);
    await this.playerService.getPlayerById(playerId);

    const existingMission = await this.missionsRepository.findByPlayerAndMissionId(
      playerId,
      missionId
    );
    const acceptedAt = new Date();

    if (!existingMission) {
      const createdMission = await this.missionsRepository.createMission({
        playerId,
        missionId,
        targetProgress: definition.objectiveTarget,
        acceptedAt
      });

      return this.toMissionViewOrThrow(createdMission);
    }

    if (existingMission.status === "active") {
      throw new ConflictException(new MissionAlreadyActiveError(missionId).message);
    }

    if (!definition.isRepeatable) {
      throw new ConflictException(new MissionAlreadyCompletedError(missionId).message);
    }

    const resetMission = await this.missionsRepository.resetMission({
      playerId,
      missionId,
      targetProgress: definition.objectiveTarget,
      acceptedAt
    });

    return this.toMissionViewOrThrow(resetMission);
  }

  async recordProgress(
    playerId: string,
    objectiveType: MissionObjectiveType,
    amount = 1
  ): Promise<void> {
    if (amount <= 0) {
      return;
    }

    const activeMissions = await this.missionsRepository.listActiveByPlayerId(playerId);

    await Promise.all(
      activeMissions.map(async (mission) => {
        const definition = getMissionById(mission.missionId);

        if (!definition || definition.objectiveType !== objectiveType) {
          return;
        }

        if (mission.progress >= mission.targetProgress) {
          return;
        }

        await this.missionsRepository.updateProgress(
          mission.id,
          Math.min(mission.progress + amount, mission.targetProgress)
        );
      })
    );
  }

  async completeMission(
    playerId: string,
    missionId: string
  ): Promise<MissionCompletionResult> {
    const definition = this.getMissionDefinitionOrThrow(missionId);
    await this.playerService.getPlayerById(playerId);

    const mission = await this.missionsRepository.findByPlayerAndMissionId(
      playerId,
      missionId
    );

    if (!mission) {
      throw new NotFoundException(new MissionNotAcceptedError(missionId).message);
    }

    if (mission.status === "completed") {
      throw new ConflictException(new MissionAlreadyCompletedError(missionId).message);
    }

    if (mission.progress < mission.targetProgress) {
      throw new ConflictException(new MissionProgressIncompleteError(missionId).message);
    }

    const player = await this.playerService.applyResourceDelta(playerId, {
      cash: definition.rewardCash,
      respect: definition.rewardRespect
    });
    const completedMission = await this.missionsRepository.markCompleted(
      mission.id,
      new Date()
    );

    return {
      mission: this.toMissionViewOrThrow(completedMission),
      rewards: {
        cash: definition.rewardCash,
        respect: definition.rewardRespect
      },
      playerResources: {
        cash: player.cash,
        respect: player.respect,
        energy: player.energy,
        health: player.health
      }
    };
  }

  private getMissionDefinitionOrThrow(missionId: string): MissionDefinition {
    const definition = getMissionById(missionId);

    if (!definition) {
      throw new NotFoundException(new MissionNotFoundError(missionId).message);
    }

    return definition;
  }

  private toMissionViewOrThrow(mission: PlayerMissionSnapshot): PlayerMissionView {
    const view = this.toMissionView(mission);

    if (!view) {
      throw new NotFoundException(new MissionNotFoundError(mission.missionId).message);
    }

    return view;
  }

  private toMissionView(mission: PlayerMissionSnapshot): PlayerMissionView | null {
    const definition = getMissionById(mission.missionId);

    if (!definition) {
      return null;
    }

    return {
      ...mission,
      definition
    };
  }
}
