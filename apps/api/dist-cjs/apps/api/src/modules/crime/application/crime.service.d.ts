import { HospitalService } from "../../hospital/application/hospital.service";
import { JailService } from "../../jail/application/jail.service";
import { PlayerService } from "../../player/application/player.service";
import { DomainEventsService } from "../../../platform/domain-events/domain-events.service";
import type { CrimeDefinition, CrimeOutcome } from "../domain/crime.types";
export declare class CrimeService {
    private readonly playerService;
    private readonly jailService;
    private readonly hospitalService;
    private readonly domainEventsService;
    private readonly getRandomRoll;
    constructor(playerService: PlayerService, jailService: JailService, hospitalService: HospitalService, domainEventsService: DomainEventsService, getRandomRoll: () => number);
    listCrimes(): readonly CrimeDefinition[];
    executeCrime(playerId: string, crimeId: string): Promise<CrimeOutcome>;
    private publishCrimeCompletedEvent;
}
