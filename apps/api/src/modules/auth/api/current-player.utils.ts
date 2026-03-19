import { ConflictException, UnauthorizedException } from "@nestjs/common";

import type { AuthActor } from "../domain/auth.types";

export function requireCurrentPlayerId(actor: AuthActor | undefined): string {
  if (!actor) {
    throw new UnauthorizedException("Authentication is required.");
  }

  if (!actor.playerId) {
    throw new ConflictException("Authenticated account does not own a player yet.");
  }

  return actor.playerId;
}
