import type {
  PlayerCustodyBuyoutInput,
  PlayerCustodyEntryInput,
  PlayerCreationValues,
  PlayerCustodyStatusUpdate,
  PlayerResourceDelta,
  PlayerSnapshot
} from "../domain/player.types";

export const PLAYER_REPOSITORY = Symbol("PLAYER_REPOSITORY");

export interface PlayerRepository {
  create(values: PlayerCreationValues): Promise<PlayerSnapshot>;
  findByAccountId(accountId: string): Promise<PlayerSnapshot | null>;
  findById(playerId: string, now?: Date): Promise<PlayerSnapshot | null>;
  findByDisplayName(displayName: string): Promise<PlayerSnapshot | null>;
  applyResourceDelta(
    playerId: string,
    delta: PlayerResourceDelta,
    now?: Date
  ): Promise<PlayerSnapshot | null>;
  updateCustodyStatus(
    playerId: string,
    status: PlayerCustodyStatusUpdate
  ): Promise<PlayerSnapshot | null>;
  applyCustodyEntry(
    playerId: string,
    input: PlayerCustodyEntryInput
  ): Promise<PlayerSnapshot | null>;
  buyOutCustodyStatus(
    playerId: string,
    input: PlayerCustodyBuyoutInput
  ): Promise<PlayerSnapshot | null>;
}
