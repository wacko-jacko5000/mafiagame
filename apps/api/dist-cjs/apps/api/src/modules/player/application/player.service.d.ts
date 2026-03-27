import type { CreatePlayerCommand, PlayerCustodyBuyoutInput, PlayerCustodyEntryInput, PlayerCustodyStatusUpdate, PlayerProgressionSnapshot, PlayerResourceDelta, PlayerResources, PlayerSnapshot } from "../domain/player.types";
import { type PlayerRepository } from "./player.repository";
export declare class PlayerService {
    private readonly playerRepository;
    constructor(playerRepository: PlayerRepository);
    createPlayer(command: CreatePlayerCommand): Promise<PlayerSnapshot>;
    createPlayerForAccount(command: CreatePlayerCommand, accountId?: string): Promise<PlayerSnapshot>;
    getPlayerById(playerId: string): Promise<PlayerSnapshot>;
    getPlayerByIdAt(playerId: string, now: Date): Promise<PlayerSnapshot>;
    getPlayerResources(playerId: string): Promise<PlayerResources>;
    getPlayerProgression(playerId: string): Promise<PlayerProgressionSnapshot>;
    getRankNameForLevel(level: number): string | null;
    applyResourceDelta(playerId: string, delta: PlayerResourceDelta, now?: Date): Promise<PlayerSnapshot>;
    updateCustodyStatus(playerId: string, status: PlayerCustodyStatusUpdate): Promise<PlayerSnapshot>;
    applyCustodyEntry(playerId: string, input: PlayerCustodyEntryInput): Promise<PlayerSnapshot>;
    buyOutCustodyStatus(playerId: string, input: PlayerCustodyBuyoutInput): Promise<PlayerSnapshot | null>;
}
