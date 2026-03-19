import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException
} from "@nestjs/common";

import { GangsService } from "../../gangs/application/gangs.service";
import { PlayerService } from "../../player/application/player.service";
import { DomainEventsService } from "../../../platform/domain-events/domain-events.service";
import {
  DistrictAlreadyControlledError,
  DistrictNotFoundError,
  DistrictPayoutCooldownNotElapsedError,
  DistrictPayoutGangControlRequiredError,
  DistrictPayoutUnavailableForUncontrolledDistrictError,
  DistrictWarAlreadyActiveError,
  DistrictWarAlreadyResolvedError,
  DistrictWarAttackerAlreadyControlsDistrictError,
  DistrictWarInvalidWinnerError,
  DistrictWarNotFoundError,
  DistrictWarUnavailableForUnclaimedDistrictError
} from "../domain/territory.errors";
import type {
  ClaimDistrictByPlayerCommand,
  ClaimDistrictPayoutByPlayerCommand,
  DistrictController,
  DistrictPayoutClaimResult,
  DistrictPayoutSummary,
  DistrictSummary,
  DistrictWarSnapshot,
  DistrictWarSummary,
  ResolveDistrictWarCommand,
  ResolveDistrictWarResult,
  StartDistrictWarCommand
} from "../domain/territory.types";
import {
  TERRITORY_REPOSITORY,
  type TerritoryRepository
} from "./territory.repository";

@Injectable()
export class TerritoryService {
  constructor(
    @Inject(PlayerService)
    private readonly playerService: PlayerService,
    @Inject(GangsService)
    private readonly gangsService: GangsService,
    @Inject(DomainEventsService)
    private readonly domainEventsService: DomainEventsService,
    @Inject(TERRITORY_REPOSITORY)
    private readonly territoryRepository: TerritoryRepository
  ) {}

  async listDistricts(): Promise<DistrictSummary[]> {
    const districts = await this.territoryRepository.listDistricts();

    return Promise.all(
      districts.map(async (district) => ({
        id: district.id,
        name: district.name,
        payout: this.toDistrictPayoutSummary(
          district.payoutAmount,
          district.payoutCooldownMinutes,
          district.control?.lastPayoutClaimedAt ?? null
        ),
        createdAt: district.createdAt,
        controller: await this.toDistrictController(district.control),
        activeWar: await this.toDistrictWarSummary(district.activeWar)
      }))
    );
  }

  async getDistrictById(districtId: string): Promise<DistrictSummary> {
    const district = await this.territoryRepository.findDistrictById(districtId);

    if (!district) {
      throw new NotFoundException(new DistrictNotFoundError(districtId).message);
    }

    return {
      id: district.id,
      name: district.name,
      payout: this.toDistrictPayoutSummary(
        district.payoutAmount,
        district.payoutCooldownMinutes,
        district.control?.lastPayoutClaimedAt ?? null
      ),
      createdAt: district.createdAt,
      controller: await this.toDistrictController(district.control),
      activeWar: await this.toDistrictWarSummary(district.activeWar)
    };
  }

  async claimDistrict(command: ClaimDistrictByPlayerCommand): Promise<DistrictSummary> {
    await this.gangsService.assertPlayerIsGangLeader(command.gangId, command.playerId);
    const district = await this.getDistrictById(command.districtId);

    if (district.controller) {
      throw new ConflictException(
        new DistrictAlreadyControlledError(command.districtId).message
      );
    }

    const control = await this.territoryRepository.claimDistrict({
      districtId: command.districtId,
      gangId: command.gangId
    });

    if (!control) {
      throw new NotFoundException(
        new DistrictNotFoundError(command.districtId).message
      );
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

  async claimDistrictPayout(
    command: ClaimDistrictPayoutByPlayerCommand
  ): Promise<DistrictPayoutClaimResult> {
    await this.gangsService.assertPlayerIsGangLeader(command.gangId, command.playerId);
    const district = await this.getDistrictById(command.districtId);

    if (!district.controller) {
      throw new ConflictException(
        new DistrictPayoutUnavailableForUncontrolledDistrictError(
          command.districtId
        ).message
      );
    }

    if (district.controller.gangId !== command.gangId) {
      throw new ConflictException(
        new DistrictPayoutGangControlRequiredError(
          command.districtId,
          command.gangId
        ).message
      );
    }

    if (district.payout.nextClaimAvailableAt && district.payout.nextClaimAvailableAt > new Date()) {
      throw new ConflictException(
        new DistrictPayoutCooldownNotElapsedError(command.districtId).message
      );
    }

    const claimedAt = new Date();
    const latestEligibleClaimedAt = new Date(
      claimedAt.getTime() - district.payout.cooldownMinutes * 60_000
    );
    const status = await this.territoryRepository.claimDistrictPayout({
      districtId: command.districtId,
      gangId: command.gangId,
      claimedAt,
      latestEligibleClaimedAt
    });

    if (status === "district_not_found") {
      throw new NotFoundException(new DistrictNotFoundError(command.districtId).message);
    }

    if (status === "district_uncontrolled") {
      throw new ConflictException(
        new DistrictPayoutUnavailableForUncontrolledDistrictError(
          command.districtId
        ).message
      );
    }

    if (status === "gang_not_controller") {
      throw new ConflictException(
        new DistrictPayoutGangControlRequiredError(
          command.districtId,
          command.gangId
        ).message
      );
    }

    if (status === "cooldown_not_elapsed") {
      throw new ConflictException(
        new DistrictPayoutCooldownNotElapsedError(command.districtId).message
      );
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

  async startWar(command: StartDistrictWarCommand): Promise<DistrictWarSummary> {
    await this.gangsService.assertPlayerIsGangLeader(command.attackerGangId, command.playerId);
    const district = await this.getDistrictById(command.districtId);

    if (!district.controller) {
      throw new ConflictException(
        new DistrictWarUnavailableForUnclaimedDistrictError(command.districtId).message
      );
    }

    if (district.controller.gangId === command.attackerGangId) {
      throw new ConflictException(
        new DistrictWarAttackerAlreadyControlsDistrictError(
          command.districtId,
          command.attackerGangId
        ).message
      );
    }

    if (district.activeWar) {
      throw new ConflictException(
        new DistrictWarAlreadyActiveError(command.districtId).message
      );
    }

    const war = await this.territoryRepository.startWar({
      districtId: command.districtId,
      attackerGangId: command.attackerGangId,
      defenderGangId: district.controller.gangId,
      startedByPlayerId: command.playerId
    });

    if (!war) {
      throw new NotFoundException(new DistrictNotFoundError(command.districtId).message);
    }

    return (await this.toDistrictWarSummary(war))!;
  }

  async getDistrictWarForDistrict(districtId: string): Promise<DistrictWarSummary | null> {
    await this.getDistrictById(districtId);
    const war = await this.territoryRepository.findActiveWarByDistrictId(districtId);
    return this.toDistrictWarSummary(war);
  }

  async getDistrictWarById(warId: string): Promise<DistrictWarSummary> {
    const war = await this.territoryRepository.findWarById(warId);

    if (!war) {
      throw new NotFoundException(new DistrictWarNotFoundError(warId).message);
    }

    return (await this.toDistrictWarSummary(war))!;
  }

  async resolveWar(command: ResolveDistrictWarCommand): Promise<ResolveDistrictWarResult> {
    const war = await this.territoryRepository.findWarById(command.warId);

    if (!war) {
      throw new NotFoundException(new DistrictWarNotFoundError(command.warId).message);
    }

    if (war.status !== "pending") {
      throw new ConflictException(
        new DistrictWarAlreadyResolvedError(command.warId).message
      );
    }

    if (
      command.winningGangId !== war.attackerGangId &&
      command.winningGangId !== war.defenderGangId
    ) {
      throw new ConflictException(
        new DistrictWarInvalidWinnerError(command.warId, command.winningGangId).message
      );
    }

    const resolvedWar = await this.territoryRepository.resolveWar(command);

    if (!resolvedWar) {
      throw new NotFoundException(new DistrictWarNotFoundError(command.warId).message);
    }

    await this.domainEventsService.publish({
      type: "territory.war_won",
      occurredAt: resolvedWar.resolvedAt ?? new Date(),
      warId: resolvedWar.id,
      districtId: resolvedWar.districtId,
      districtName: (await this.getDistrictById(resolvedWar.districtId)).name,
      winningGangId: resolvedWar.winningGangId!,
      winningGangName: (await this.gangsService.getGangById(resolvedWar.winningGangId!)).name,
      attackerGangId: resolvedWar.attackerGangId,
      defenderGangId: resolvedWar.defenderGangId,
      resolvedAt: resolvedWar.resolvedAt ?? new Date()
    });

    return {
      war: (await this.toDistrictWarSummary(resolvedWar))!,
      district: await this.getDistrictById(resolvedWar.districtId)
    };
  }

  private async toDistrictController(
    control: {
      gangId: string;
      capturedAt: Date;
      lastPayoutClaimedAt: Date | null;
    } | null
  ): Promise<DistrictController | null> {
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

  private toDistrictPayoutSummary(
    amount: number,
    cooldownMinutes: number,
    lastClaimedAt: Date | null
  ): DistrictPayoutSummary {
    return {
      amount,
      cooldownMinutes,
      lastClaimedAt,
      nextClaimAvailableAt: lastClaimedAt
        ? new Date(lastClaimedAt.getTime() + cooldownMinutes * 60_000)
        : null
    };
  }

  private async toDistrictWarSummary(
    war: DistrictWarSnapshot | null
  ): Promise<DistrictWarSummary | null> {
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
}
