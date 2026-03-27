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
exports.TerritoryService = void 0;
const common_1 = require("@nestjs/common");
const gangs_service_1 = require("../../gangs/application/gangs.service");
const player_service_1 = require("../../player/application/player.service");
const domain_events_service_1 = require("../../../platform/domain-events/domain-events.service");
const territory_errors_1 = require("../domain/territory.errors");
const territory_repository_1 = require("./territory.repository");
let TerritoryService = class TerritoryService {
    playerService;
    gangsService;
    domainEventsService;
    territoryRepository;
    constructor(playerService, gangsService, domainEventsService, territoryRepository) {
        this.playerService = playerService;
        this.gangsService = gangsService;
        this.domainEventsService = domainEventsService;
        this.territoryRepository = territoryRepository;
    }
    async listDistricts() {
        const districts = await this.territoryRepository.listDistricts();
        return Promise.all(districts.map(async (district) => ({
            id: district.id,
            name: district.name,
            payout: this.toDistrictPayoutSummary(district.payoutAmount, district.payoutCooldownMinutes, district.control?.lastPayoutClaimedAt ?? null),
            createdAt: district.createdAt,
            controller: await this.toDistrictController(district.control),
            activeWar: await this.toDistrictWarSummary(district.activeWar)
        })));
    }
    async getDistrictById(districtId) {
        const district = await this.territoryRepository.findDistrictById(districtId);
        if (!district) {
            throw new common_1.NotFoundException(new territory_errors_1.DistrictNotFoundError(districtId).message);
        }
        return {
            id: district.id,
            name: district.name,
            payout: this.toDistrictPayoutSummary(district.payoutAmount, district.payoutCooldownMinutes, district.control?.lastPayoutClaimedAt ?? null),
            createdAt: district.createdAt,
            controller: await this.toDistrictController(district.control),
            activeWar: await this.toDistrictWarSummary(district.activeWar)
        };
    }
    async claimDistrict(command) {
        await this.gangsService.assertPlayerIsGangLeader(command.gangId, command.playerId);
        const district = await this.getDistrictById(command.districtId);
        if (district.controller) {
            throw new common_1.ConflictException(new territory_errors_1.DistrictAlreadyControlledError(command.districtId).message);
        }
        const control = await this.territoryRepository.claimDistrict({
            districtId: command.districtId,
            gangId: command.gangId
        });
        if (!control) {
            throw new common_1.NotFoundException(new territory_errors_1.DistrictNotFoundError(command.districtId).message);
        }
        await this.domainEventsService.publish({
            type: "territory.district_claimed",
            occurredAt: new Date(),
            playerId: command.playerId,
            gangId: command.gangId,
            districtId: command.districtId
        });
        return this.getDistrictById(command.districtId);
    }
    async claimDistrictPayout(command) {
        await this.gangsService.assertPlayerIsGangLeader(command.gangId, command.playerId);
        const district = await this.getDistrictById(command.districtId);
        if (!district.controller) {
            throw new common_1.ConflictException(new territory_errors_1.DistrictPayoutUnavailableForUncontrolledDistrictError(command.districtId).message);
        }
        if (district.controller.gangId !== command.gangId) {
            throw new common_1.ConflictException(new territory_errors_1.DistrictPayoutGangControlRequiredError(command.districtId, command.gangId).message);
        }
        if (district.payout.nextClaimAvailableAt && district.payout.nextClaimAvailableAt > new Date()) {
            throw new common_1.ConflictException(new territory_errors_1.DistrictPayoutCooldownNotElapsedError(command.districtId).message);
        }
        const claimedAt = new Date();
        const latestEligibleClaimedAt = new Date(claimedAt.getTime() - district.payout.cooldownMinutes * 60_000);
        const status = await this.territoryRepository.claimDistrictPayout({
            districtId: command.districtId,
            gangId: command.gangId,
            claimedAt,
            latestEligibleClaimedAt
        });
        if (status === "district_not_found") {
            throw new common_1.NotFoundException(new territory_errors_1.DistrictNotFoundError(command.districtId).message);
        }
        if (status === "district_uncontrolled") {
            throw new common_1.ConflictException(new territory_errors_1.DistrictPayoutUnavailableForUncontrolledDistrictError(command.districtId).message);
        }
        if (status === "gang_not_controller") {
            throw new common_1.ConflictException(new territory_errors_1.DistrictPayoutGangControlRequiredError(command.districtId, command.gangId).message);
        }
        if (status === "cooldown_not_elapsed") {
            throw new common_1.ConflictException(new territory_errors_1.DistrictPayoutCooldownNotElapsedError(command.districtId).message);
        }
        const player = await this.playerService.applyResourceDelta(command.playerId, {
            cash: district.payout.amount
        });
        await this.domainEventsService.publish({
            type: "territory.payout_claimed",
            occurredAt: claimedAt,
            playerId: command.playerId,
            gangId: command.gangId,
            districtId: command.districtId,
            districtName: district.name,
            payoutAmount: district.payout.amount
        });
        return {
            district: await this.getDistrictById(command.districtId),
            payoutAmount: district.payout.amount,
            claimedAt,
            paidToPlayerId: command.playerId,
            playerCashAfterClaim: player.cash
        };
    }
    async startWar(command) {
        await this.gangsService.assertPlayerIsGangLeader(command.attackerGangId, command.playerId);
        const district = await this.getDistrictById(command.districtId);
        if (!district.controller) {
            throw new common_1.ConflictException(new territory_errors_1.DistrictWarUnavailableForUnclaimedDistrictError(command.districtId).message);
        }
        if (district.controller.gangId === command.attackerGangId) {
            throw new common_1.ConflictException(new territory_errors_1.DistrictWarAttackerAlreadyControlsDistrictError(command.districtId, command.attackerGangId).message);
        }
        if (district.activeWar) {
            throw new common_1.ConflictException(new territory_errors_1.DistrictWarAlreadyActiveError(command.districtId).message);
        }
        const war = await this.territoryRepository.startWar({
            districtId: command.districtId,
            attackerGangId: command.attackerGangId,
            defenderGangId: district.controller.gangId,
            startedByPlayerId: command.playerId
        });
        if (!war) {
            throw new common_1.NotFoundException(new territory_errors_1.DistrictNotFoundError(command.districtId).message);
        }
        return (await this.toDistrictWarSummary(war));
    }
    async getDistrictWarForDistrict(districtId) {
        await this.getDistrictById(districtId);
        const war = await this.territoryRepository.findActiveWarByDistrictId(districtId);
        return this.toDistrictWarSummary(war);
    }
    async getDistrictWarById(warId) {
        const war = await this.territoryRepository.findWarById(warId);
        if (!war) {
            throw new common_1.NotFoundException(new territory_errors_1.DistrictWarNotFoundError(warId).message);
        }
        return (await this.toDistrictWarSummary(war));
    }
    async resolveWar(command) {
        const war = await this.territoryRepository.findWarById(command.warId);
        if (!war) {
            throw new common_1.NotFoundException(new territory_errors_1.DistrictWarNotFoundError(command.warId).message);
        }
        if (war.status !== "pending") {
            throw new common_1.ConflictException(new territory_errors_1.DistrictWarAlreadyResolvedError(command.warId).message);
        }
        if (command.winningGangId !== war.attackerGangId &&
            command.winningGangId !== war.defenderGangId) {
            throw new common_1.ConflictException(new territory_errors_1.DistrictWarInvalidWinnerError(command.warId, command.winningGangId).message);
        }
        const resolvedWar = await this.territoryRepository.resolveWar(command);
        if (!resolvedWar) {
            throw new common_1.NotFoundException(new territory_errors_1.DistrictWarNotFoundError(command.warId).message);
        }
        await this.domainEventsService.publish({
            type: "territory.war_won",
            occurredAt: resolvedWar.resolvedAt ?? new Date(),
            warId: resolvedWar.id,
            districtId: resolvedWar.districtId,
            districtName: (await this.getDistrictById(resolvedWar.districtId)).name,
            winningGangId: resolvedWar.winningGangId,
            winningGangName: (await this.gangsService.getGangById(resolvedWar.winningGangId)).name,
            attackerGangId: resolvedWar.attackerGangId,
            defenderGangId: resolvedWar.defenderGangId,
            resolvedAt: resolvedWar.resolvedAt ?? new Date()
        });
        return {
            war: (await this.toDistrictWarSummary(resolvedWar)),
            district: await this.getDistrictById(resolvedWar.districtId)
        };
    }
    async toDistrictController(control) {
        if (!control) {
            return null;
        }
        const gang = await this.gangsService.getGangById(control.gangId);
        return {
            gangId: control.gangId,
            gangName: gang.name,
            capturedAt: control.capturedAt
        };
    }
    toDistrictPayoutSummary(amount, cooldownMinutes, lastClaimedAt) {
        return {
            amount,
            cooldownMinutes,
            lastClaimedAt,
            nextClaimAvailableAt: lastClaimedAt
                ? new Date(lastClaimedAt.getTime() + cooldownMinutes * 60_000)
                : null
        };
    }
    async toDistrictWarSummary(war) {
        if (!war) {
            return null;
        }
        const [attackerGang, defenderGang, winningGang] = await Promise.all([
            this.gangsService.getGangById(war.attackerGangId),
            this.gangsService.getGangById(war.defenderGangId),
            war.winningGangId ? this.gangsService.getGangById(war.winningGangId) : Promise.resolve(null)
        ]);
        return {
            id: war.id,
            districtId: war.districtId,
            attackerGangId: war.attackerGangId,
            attackerGangName: attackerGang.name,
            defenderGangId: war.defenderGangId,
            defenderGangName: defenderGang.name,
            startedByPlayerId: war.startedByPlayerId,
            status: war.status,
            createdAt: war.createdAt,
            resolvedAt: war.resolvedAt,
            winningGangId: war.winningGangId,
            winningGangName: winningGang?.name ?? null
        };
    }
};
exports.TerritoryService = TerritoryService;
exports.TerritoryService = TerritoryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(player_service_1.PlayerService)),
    __param(1, (0, common_1.Inject)(gangs_service_1.GangsService)),
    __param(2, (0, common_1.Inject)(domain_events_service_1.DomainEventsService)),
    __param(3, (0, common_1.Inject)(territory_repository_1.TERRITORY_REPOSITORY)),
    __metadata("design:paramtypes", [player_service_1.PlayerService,
        gangs_service_1.GangsService,
        domain_events_service_1.DomainEventsService, Object])
], TerritoryService);
