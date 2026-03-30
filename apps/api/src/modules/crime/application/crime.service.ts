import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException
} from "@nestjs/common";

import { HospitalService } from "../../hospital/application/hospital.service";
import { JailService } from "../../jail/application/jail.service";
import { PlayerService } from "../../player/application/player.service";
import { derivePlayerProgression } from "../../player/domain/player.policy";
import { DomainEventsService } from "../../../platform/domain-events/domain-events.service";
import {
  CrimeLevelLockedError,
  CrimeNotFoundError,
  CrimeUnavailableWhileHospitalizedError,
  CrimeUnavailableWhileJailedError,
  InsufficientCrimeEnergyError
} from "../domain/crime.errors";
import { resolveCrimeOutcome } from "../domain/crime.policy";
import type { CrimeDefinition, CrimeOutcome } from "../domain/crime.types";
import { playerHeatDecayRules } from "../../player/domain/player.constants";
import { CRIME_RANDOM_PROVIDER } from "./crime.constants";
import { CrimeBalanceService } from "./crime-balance.service";

@Injectable()
export class CrimeService {
  constructor(
    @Inject(PlayerService)
    private readonly playerService: PlayerService,
    @Inject(JailService)
    private readonly jailService: JailService,
    @Inject(HospitalService)
    private readonly hospitalService: HospitalService,
    @Inject(DomainEventsService)
    private readonly domainEventsService: DomainEventsService,
    @Inject(CrimeBalanceService)
    private readonly crimeBalanceService: CrimeBalanceService,
    @Inject(CRIME_RANDOM_PROVIDER)
    private readonly getRandomRoll: () => number
  ) {}

  listCrimes(): readonly CrimeDefinition[] {
    return this.crimeBalanceService.listCrimeBalances();
  }

  async executeCrime(playerId: string, crimeId: string): Promise<CrimeOutcome> {
    const crime = this.crimeBalanceService.findCrimeById(crimeId);
    const now = new Date();

    if (!crime) {
      throw new NotFoundException(new CrimeNotFoundError(crimeId).message);
    }

    const jailStatus = await this.jailService.getStatus(playerId, now);

    if (jailStatus.active && jailStatus.until) {
      throw new ConflictException(
        new CrimeUnavailableWhileJailedError(jailStatus.until).message
      );
    }

    const hospitalStatus = await this.hospitalService.getStatus(playerId, now);

    if (hospitalStatus.active && hospitalStatus.until) {
      throw new ConflictException(
        new CrimeUnavailableWhileHospitalizedError(hospitalStatus.until).message
      );
    }

    const player = await this.playerService.getPlayerByIdAt(playerId, now);
    const progression = derivePlayerProgression(player.respect);

    if (progression.level < crime.unlockLevel) {
      throw new BadRequestException(
        new CrimeLevelLockedError(crime.name, crime.unlockLevel).message
      );
    }

    if (player.energy < crime.energyCost) {
      throw new BadRequestException(
        new InsufficientCrimeEnergyError(crimeId).message
      );
    }

    const outcome = resolveCrimeOutcome(crime, this.getRandomRoll(), player.heat ?? 0);

    await this.playerService.applyResourceDelta(playerId, {
      energy: -outcome.energySpent,
      cash: outcome.cashAwarded,
      respect: outcome.respectAwarded,
      heat: playerHeatDecayRules.gainPerCrime
    }, now);

    if (outcome.success || crime.failureConsequence.type === "none") {
      await this.publishCrimeCompletedEvent(playerId, outcome);
      return outcome;
    }

    if (crime.failureConsequence.type === "jail") {
      const jailStatusAfterFailure = await this.jailService.jailPlayer(
        playerId,
        crime.failureConsequence.durationSeconds,
        `Failed crime: ${crime.name}.`,
        now
      );

      const result: CrimeOutcome = {
        ...outcome,
        consequence: {
          type: "jail",
          activeUntil: jailStatusAfterFailure.until
        }
      };

      await this.publishCrimeCompletedEvent(playerId, result);
      return result;
    }

    const hospitalStatusAfterFailure = await this.hospitalService.hospitalizePlayer(
      playerId,
      crime.failureConsequence.durationSeconds,
      `Injured during crime: ${crime.name}.`,
      now
    );

    const result: CrimeOutcome = {
      ...outcome,
      consequence: {
        type: "hospital",
        activeUntil: hospitalStatusAfterFailure.until
      }
    };

    await this.publishCrimeCompletedEvent(playerId, result);
    return result;
  }

  private async publishCrimeCompletedEvent(
    playerId: string,
    outcome: CrimeOutcome
  ): Promise<void> {
    await this.domainEventsService.publish({
      type: "crime.completed",
      occurredAt: new Date(),
      playerId,
      crimeId: outcome.crimeId,
      success: outcome.success,
      cashAwarded: outcome.cashAwarded,
      respectAwarded: outcome.respectAwarded,
      consequenceType: outcome.consequence.type
    });
  }
}
