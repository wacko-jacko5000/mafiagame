import type { CrimeDefinition, CrimeOutcome } from "../domain/crime.types";
import type { CrimeExecutionResponseBody, CrimeListItemResponseBody } from "./crime.contracts";
export declare function toCrimeListItemResponseBody(crime: CrimeDefinition): CrimeListItemResponseBody;
export declare function toCrimeExecutionResponseBody(outcome: CrimeOutcome): CrimeExecutionResponseBody;
