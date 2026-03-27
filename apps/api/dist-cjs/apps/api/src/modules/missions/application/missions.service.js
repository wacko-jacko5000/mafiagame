"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MissionsService = void 0;
const common_1 = require("@nestjs/common");
const gangs_service_1 = require("../../gangs/application/gangs.service");
const inventory_service_1 = require("../../inventory/application/inventory.service");
const player_service_1 = require("../../player/application/player.service");
const territory_service_1 = require("../../territory/application/territory.service");
const missions_catalog_1 = require("../domain/missions.catalog");
const missions_errors_1 = require("../domain/missions.errors");
const missions_repository_1 = require("./missions.repository");
let MissionsService = class MissionsService {
    playerService;
    inventoryService;
    gangsService;
    territoryService;
    missionsRepository;
    constructor(playerService, inventoryService, gangsService, territoryService, missionsRepository) {
        this.playerService = playerService;
        this.inventoryService = inventoryService;
        this.gangsService = gangsService;
        this.territoryService = territoryService;
        this.missionsRepository = missionsRepository;
    }
    listMissions() {
        return missions_catalog_1.starterMissionCatalog;
    }
    async listPlayerMissions(playerId) {
        await this.playerService.getPlayerById(playerId);
        await this.syncActiveMissionProgress(playerId);
        const missions = await this.missionsRepository.listByPlayerId(playerId);
        return missions
            .map((mission) => this.toMissionView(mission))
            .filter((mission) => mission !== null);
    }
    async acceptMission(playerId, missionId) {
        const definition = this.getMissionDefinitionOrThrow(missionId);
        const progression = await this.playerService.getPlayerProgression(playerId);
        if (progression.level < definition.unlockLevel) {
            throw new common_1.BadRequestException(new missions_errors_1.MissionLevelLockedError(definition.name, definition.unlockLevel).message);
        }
        await this.playerService.getPlayerById(playerId);
        const existingMission = await this.missionsRepository.findByPlayerAndMissionId(playerId, missionId);
        const acceptedAt = new Date();
        let mission;
        if (!existingMission) {
            mission = await this.missionsRepository.createMission({
                playerId,
                missionId,
                targetProgress: definition.target,
                acceptedAt
            });
        }
        else if (existingMission.status === "active") {
            throw new common_1.ConflictException(new missions_errors_1.MissionAlreadyActiveError(missionId).message);
        }
        else if (!definition.isRepeatable) {
            throw new common_1.ConflictException(new missions_errors_1.MissionAlreadyCompletedError(missionId).message);
        }
        else {
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
    async recordProgress(playerId, objectiveType, amount = 1, context) {
        if (amount <= 0) {
            return;
        }
        const activeMissions = await this.missionsRepository.listActiveByPlayerId(playerId);
        await Promise.all(activeMissions.map(async (mission) => {
            const definition = (0, missions_catalog_1.getMissionById)(mission.missionId);
            if (!definition ||
                definition.objectiveType !== objectiveType ||
                mission.progress >= mission.targetProgress ||
                !this.matchesProgressContext(definition, context)) {
                return;
            }
            await this.missionsRepository.updateProgress(mission.id, Math.min(mission.progress + amount, mission.targetProgress));
        }));
    }
    async completeMission(playerId, missionId) {
        const definition = this.getMissionDefinitionOrThrow(missionId);
        await this.playerService.getPlayerById(playerId);
        const mission = await this.missionsRepository.findByPlayerAndMissionId(playerId, missionId);
        if (!mission) {
            throw new common_1.NotFoundException(new missions_errors_1.MissionNotAcceptedError(missionId).message);
        }
        if (mission.status === "completed") {
            throw new common_1.ConflictException(new missions_errors_1.MissionAlreadyCompletedError(missionId).message);
        }
        const refreshedMission = await this.syncMissionProgress(playerId, mission, definition);
        if (refreshedMission.progress < refreshedMission.targetProgress) {
            throw new common_1.ConflictException(new missions_errors_1.MissionProgressIncompleteError(missionId).message);
        }
        const player = await this.playerService.applyResourceDelta(playerId, {
            cash: definition.rewardCash,
            respect: definition.rewardRespect
        });
        const completedMission = await this.missionsRepository.markCompleted(refreshedMission.id, new Date());
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
    getMissionDefinitionOrThrow(missionId) {
        const definition = (0, missions_catalog_1.getMissionById)(missionId);
        if (!definition) {
            throw new common_1.NotFoundException(new missions_errors_1.MissionNotFoundError(missionId).message);
        }
        return definition;
    }
    toMissionViewOrThrow(mission) {
        const view = this.toMissionView(mission);
        if (!view) {
            throw new common_1.NotFoundException(new missions_errors_1.MissionNotFoundError(mission.missionId).message);
        }
        return view;
    }
    toMissionView(mission) {
        const definition = (0, missions_catalog_1.getMissionById)(mission.missionId);
        if (!definition) {
            return null;
        }
        return {
            ...mission,
            definition
        };
    }
    async syncActiveMissionProgress(playerId) {
        const activeMissions = await this.missionsRepository.listActiveByPlayerId(playerId);
        const evaluationContext = {};
        for (const mission of activeMissions) {
            const definition = (0, missions_catalog_1.getMissionById)(mission.missionId);
            if (!definition) {
                continue;
            }
            await this.syncMissionProgress(playerId, mission, definition, evaluationContext);
        }
    }
    async syncMissionProgress(playerId, mission, definition, evaluationContext = {}) {
        const evaluatedProgress = await this.evaluateMissionProgress(playerId, definition, mission.progress, evaluationContext);
        if (evaluatedProgress <= mission.progress) {
            return mission;
        }
        return this.missionsRepository.updateProgress(mission.id, evaluatedProgress);
    }
    async evaluateMissionProgress(playerId, definition, currentProgress, evaluationContext) {
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
                evaluatedProgress = Math.max(currentProgress, equipped.weapon && equipped.armor ? 1 : 0);
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
                const recruitedCount = membership && membership.membership.role === "leader"
                    ? Math.max(0, membership.gang.memberCount - 1)
                    : 0;
                evaluatedProgress = Math.max(currentProgress, recruitedCount);
                break;
            }
            case "control_districts": {
                const membership = await this.getMembership(evaluationContext, playerId);
                const controlledDistrictCount = membership
                    ? await this.getControlledDistrictCount(evaluationContext, membership.gang.id)
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
    matchesProgressContext(definition, context) {
        if (definition.objectiveType !== "buy_items" || !definition.itemType) {
            return true;
        }
        return definition.itemType === context?.itemType;
    }
    async getPlayer(evaluationContext, playerId) {
        if (!evaluationContext.player) {
            evaluationContext.player = await this.playerService.getPlayerById(playerId);
        }
        return evaluationContext.player;
    }
    async getInventory(evaluationContext, playerId) {
        if (!evaluationContext.inventory) {
            evaluationContext.inventory = await this.inventoryService.listPlayerInventory(playerId);
        }
        return evaluationContext.inventory;
    }
    async getEquipped(evaluationContext, playerId) {
        if (!evaluationContext.equipped) {
            const inventory = await this.getInventory(evaluationContext, playerId);
            evaluationContext.equipped = {
                weapon: inventory.find((item) => item.equippedSlot === "weapon") ?? null,
                armor: inventory.find((item) => item.equippedSlot === "armor") ?? null
            };
        }
        return evaluationContext.equipped;
    }
    async getMembership(evaluationContext, playerId) {
        if (evaluationContext.membership === undefined) {
            evaluationContext.membership =
                await this.gangsService.getPlayerGangMembership(playerId);
        }
        return evaluationContext.membership;
    }
    async getControlledDistrictCount(evaluationContext, gangId) {
        if (evaluationContext.controlledDistrictCount === undefined) {
            const districts = await this.territoryService.listDistricts();
            evaluationContext.controlledDistrictCount = districts.filter((district) => district.controller?.gangId === gangId).length;
        }
        return evaluationContext.controlledDistrictCount;
    }
};
exports.MissionsService = MissionsService;
exports.MissionsService = MissionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(player_service_1.PlayerService)),
    __param(1, (0, common_1.Inject)(inventory_service_1.InventoryService)),
    __param(2, (0, common_1.Inject)(gangs_service_1.GangsService)),
    __param(3, (0, common_1.Inject)(territory_service_1.TerritoryService)),
    __param(4, (0, common_1.Inject)(missions_repository_1.MISSIONS_REPOSITORY)),
    __metadata("design:paramtypes", [player_service_1.PlayerService,
        inventory_service_1.InventoryService,
        gangs_service_1.GangsService,
        territory_service_1.TerritoryService, Object])
], MissionsService);
