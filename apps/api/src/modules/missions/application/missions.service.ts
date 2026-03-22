import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException
} from "@nestjs/common";

import { GangsService } from "../../gangs/application/gangs.service";
import { InventoryService } from "../../inventory/application/inventory.service";
import type { EquippedInventory, InventoryListItem } from "../../inventory/domain/inventory.types";
import { PlayerService } from "../../player/application/player.service";
import { TerritoryService } from "../../territory/application/territory.service";
import { getMissionById, starterMissionCatalog } from "../domain/missions.catalog";
import {
  MissionAlreadyActiveError,
  MissionAlreadyCompletedError,
  MissionLevelLockedError,
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

interface MissionProgressContext {
  itemType?: InventoryListItem["type"];
}

interface MissionEvaluationContext {
  inventory?: InventoryListItem[];
  equipped?: EquippedInventory;
  player?: Awaited<ReturnType<PlayerService["getPlayerById"]>>;
  membership?: Awaited<ReturnType<GangsService["getPlayerGangMembership"]>>;
  controlledDistrictCount?: number;
}

@Injectable()
export class MissionsService {
  constructor(
    @Inject(PlayerService)
    private readonly playerService: PlayerService,
    @Inject(InventoryService)
    private readonly inventoryService: InventoryService,
    @Inject(GangsService)
    private readonly gangsService: GangsService,
    @Inject(TerritoryService)
    private readonly territoryService: TerritoryService,
    @Inject(MISSIONS_REPOSITORY)
    private readonly missionsRepository: MissionsRepository
  ) {}

  listMissions(): readonly MissionDefinition[] {
    return starterMissionCatalog;
  }

  async listPlayerMissions(playerId: string): Promise<PlayerMissionView[]> {
    await this.playerService.getPlayerById(playerId);
    await this.syncActiveMissionProgress(playerId);

    const missions = await this.missionsRepository.listByPlayerId(playerId);

    return missions
      .map((mission) => this.toMissionView(mission))
      .filter((mission): mission is PlayerMissionView => mission !== null);
  }

  async acceptMission(playerId: string, missionId: string): Promise<PlayerMissionView> {
    const definition = this.getMissionDefinitionOrThrow(missionId);
    const progression = await this.playerService.getPlayerProgression(playerId);

    if (progression.level < definition.unlockLevel) {
      throw new BadRequestException(
        new MissionLevelLockedError(definition.name, definition.unlockLevel).message
      );
    }

    await this.playerService.getPlayerById(playerId);

    const existingMission = await this.missionsRepository.findByPlayerAndMissionId(
      playerId,
      missionId
    );
    const acceptedAt = new Date();

    let mission: PlayerMissionSnapshot;

    if (!existingMission) {
      mission = await this.missionsRepository.createMission({
        playerId,
        missionId,
        targetProgress: definition.target,
        acceptedAt
      });
    } else if (existingMission.status === "active") {
      throw new ConflictException(new MissionAlreadyActiveError(missionId).message);
    } else if (!definition.isRepeatable) {
      throw new ConflictException(new MissionAlreadyCompletedError(missionId).message);
    } else {
      mission = await this.missionsRepository.resetMission({
        playerId,
        missionId,
        targetProgress: definition.target,
        acceptedAt
      });
    }

    const refreshedMission = await this.syncMissionProgress(playerId, mission, definition);
    return this.toMissionViewOrThrow(refreshedMission);
  }

  async recordProgress(
    playerId: string,
    objectiveType: MissionObjectiveType,
    amount = 1,
    context?: MissionProgressContext
  ): Promise<void> {
    if (amount <= 0) {
      return;
    }

    const activeMissions = await this.missionsRepository.listActiveByPlayerId(playerId);

    await Promise.all(
      activeMissions.map(async (mission) => {
        const definition = getMissionById(mission.missionId);

        if (
          !definition ||
          definition.objectiveType !== objectiveType ||
          mission.progress >= mission.targetProgress ||
          !this.matchesProgressContext(definition, context)
        ) {
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

    const refreshedMission = await this.syncMissionProgress(playerId, mission, definition);

    if (refreshedMission.progress < refreshedMission.targetProgress) {
      throw new ConflictException(new MissionProgressIncompleteError(missionId).message);
    }

    const player = await this.playerService.applyResourceDelta(playerId, {
      cash: definition.rewardCash,
      respect: definition.rewardRespect
    });
    const completedMission = await this.missionsRepository.markCompleted(
      refreshedMission.id,
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

  private async syncActiveMissionProgress(playerId: string): Promise<void> {
    const activeMissions = await this.missionsRepository.listActiveByPlayerId(playerId);
    const evaluationContext: MissionEvaluationContext = {};

    for (const mission of activeMissions) {
      const definition = getMissionById(mission.missionId);

      if (!definition) {
        continue;
      }

      await this.syncMissionProgress(playerId, mission, definition, evaluationContext);
    }
  }

  private async syncMissionProgress(
    playerId: string,
    mission: PlayerMissionSnapshot,
    definition: MissionDefinition,
    evaluationContext: MissionEvaluationContext = {}
  ): Promise<PlayerMissionSnapshot> {
    const evaluatedProgress = await this.evaluateMissionProgress(
      playerId,
      definition,
      mission.progress,
      evaluationContext
    );

    if (evaluatedProgress <= mission.progress) {
      return mission;
    }

    return this.missionsRepository.updateProgress(mission.id, evaluatedProgress);
  }

  private async evaluateMissionProgress(
    playerId: string,
    definition: MissionDefinition,
    currentProgress: number,
    evaluationContext: MissionEvaluationContext
  ): Promise<number> {
    let evaluatedProgress = currentProgress;

    switch (definition.objectiveType) {
      case "earn_money": {
        const player = await this.getPlayer(evaluationContext, playerId);
        evaluatedProgress = Math.max(currentProgress, player.cash);
        break;
      }
      case "reach_respect": {
        const player = await this.getPlayer(evaluationContext, playerId);
        evaluatedProgress = Math.max(currentProgress, player.respect);
        break;
      }
      case "buy_items": {
        const inventory = await this.getInventory(evaluationContext, playerId);
        const matchingItems = definition.itemType
          ? inventory.filter((item) => item.type === definition.itemType)
          : inventory;
        evaluatedProgress = Math.max(currentProgress, matchingItems.length);
        break;
      }
      case "equip_weapon": {
        const equipped = await this.getEquipped(evaluationContext, playerId);
        evaluatedProgress = Math.max(currentProgress, equipped.weapon ? 1 : 0);
        break;
      }
      case "equip_armor": {
        const equipped = await this.getEquipped(evaluationContext, playerId);
        evaluatedProgress = Math.max(currentProgress, equipped.armor ? 1 : 0);
        break;
      }
      case "equip_loadout": {
        const equipped = await this.getEquipped(evaluationContext, playerId);
        evaluatedProgress = Math.max(
          currentProgress,
          equipped.weapon && equipped.armor ? 1 : 0
        );
        break;
      }
      case "own_items": {
        const inventory = await this.getInventory(evaluationContext, playerId);
        evaluatedProgress = Math.max(currentProgress, inventory.length);
        break;
      }
      case "join_gang": {
        const membership = await this.getMembership(evaluationContext, playerId);
        evaluatedProgress = Math.max(currentProgress, membership ? 1 : 0);
        break;
      }
      case "recruit_member": {
        const membership = await this.getMembership(evaluationContext, playerId);
        const recruitedCount =
          membership && membership.membership.role === "leader"
            ? Math.max(0, membership.gang.memberCount - 1)
            : 0;
        evaluatedProgress = Math.max(currentProgress, recruitedCount);
        break;
      }
      case "control_districts": {
        const membership = await this.getMembership(evaluationContext, playerId);
        const controlledDistrictCount = membership
          ? await this.getControlledDistrictCount(
              evaluationContext,
              membership.gang.id
            )
          : 0;
        evaluatedProgress = Math.max(currentProgress, controlledDistrictCount);
        break;
      }
      case "crime_count":
      case "win_combat":
        break;
    }

    return Math.min(evaluatedProgress, definition.target);
  }

  private matchesProgressContext(
    definition: MissionDefinition,
    context?: MissionProgressContext
  ): boolean {
    if (definition.objectiveType !== "buy_items" || !definition.itemType) {
      return true;
    }

    return definition.itemType === context?.itemType;
  }

  private async getPlayer(
    evaluationContext: MissionEvaluationContext,
    playerId: string
  ): Promise<Awaited<ReturnType<PlayerService["getPlayerById"]>>> {
    if (!evaluationContext.player) {
      evaluationContext.player = await this.playerService.getPlayerById(playerId);
    }

    return evaluationContext.player;
  }

  private async getInventory(
    evaluationContext: MissionEvaluationContext,
    playerId: string
  ): Promise<InventoryListItem[]> {
    if (!evaluationContext.inventory) {
      evaluationContext.inventory = await this.inventoryService.listPlayerInventory(playerId);
    }

    return evaluationContext.inventory;
  }

  private async getEquipped(
    evaluationContext: MissionEvaluationContext,
    playerId: string
  ): Promise<EquippedInventory> {
    if (!evaluationContext.equipped) {
      const inventory = await this.getInventory(evaluationContext, playerId);
      evaluationContext.equipped = {
        weapon: inventory.find((item) => item.equippedSlot === "weapon") ?? null,
        armor: inventory.find((item) => item.equippedSlot === "armor") ?? null
      };
    }

    return evaluationContext.equipped;
  }

  private async getMembership(
    evaluationContext: MissionEvaluationContext,
    playerId: string
  ): Promise<Awaited<ReturnType<GangsService["getPlayerGangMembership"]>>> {
    if (evaluationContext.membership === undefined) {
      evaluationContext.membership =
        await this.gangsService.getPlayerGangMembership(playerId);
    }

    return evaluationContext.membership;
  }

  private async getControlledDistrictCount(
    evaluationContext: MissionEvaluationContext,
    gangId: string
  ): Promise<number> {
    if (evaluationContext.controlledDistrictCount === undefined) {
      const districts = await this.territoryService.listDistricts();
      evaluationContext.controlledDistrictCount = districts.filter(
        (district) => district.controller?.gangId === gangId
      ).length;
    }

    return evaluationContext.controlledDistrictCount;
  }
}
