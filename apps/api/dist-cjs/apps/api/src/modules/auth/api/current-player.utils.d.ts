import type { AuthActor } from "../domain/auth.types";
export declare function requireCurrentPlayerId(actor: AuthActor | undefined): string;
