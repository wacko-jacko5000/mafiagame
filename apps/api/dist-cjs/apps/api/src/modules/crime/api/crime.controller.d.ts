import type { AuthActor } from "../../auth/domain/auth.types";
import { CrimeService } from "../application/crime.service";
import type { CrimeExecutionResponseBody, CrimeListItemResponseBody } from "./crime.contracts";
export declare class CrimeController {
    private readonly crimeService;
    constructor(crimeService: CrimeService);
    getCrimes(): CrimeListItemResponseBody[];
    executeCrime(playerId: string, crimeId: string): Promise<CrimeExecutionResponseBody>;
    executeCurrentPlayerCrime(crimeId: string, actor: AuthActor | undefined): Promise<CrimeExecutionResponseBody>;
}
