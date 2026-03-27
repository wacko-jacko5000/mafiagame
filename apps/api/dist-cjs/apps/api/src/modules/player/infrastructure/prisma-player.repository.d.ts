import { PrismaService } from "../../../platform/database/prisma.service";
import type { PlayerCustodyBuyoutInput, PlayerCustodyEntryInput, PlayerCreationValues, PlayerCustodyStatusUpdate, PlayerResourceDelta, PlayerSnapshot } from "../domain/player.types";
import type { PlayerRepository } from "../application/player.repository";
export declare class PrismaPlayerRepository implements PlayerRepository {
    private readonly prismaService;
    constructor(prismaService: PrismaService);
    create(values: PlayerCreationValues): Promise<PlayerSnapshot>;
    findById(playerId: string, now?: Date): Promise<PlayerSnapshot | null>;
    findByAccountId(accountId: string): Promise<PlayerSnapshot | null>;
    findByDisplayName(displayName: string): Promise<PlayerSnapshot | null>;
    applyResourceDelta(playerId: string, delta: PlayerResourceDelta, now?: Date): Promise<PlayerSnapshot | null>;
    updateCustodyStatus(playerId: string, status: PlayerCustodyStatusUpdate): Promise<PlayerSnapshot | null>;
    applyCustodyEntry(playerId: string, input: PlayerCustodyEntryInput): Promise<PlayerSnapshot | null>;
    buyOutCustodyStatus(playerId: string, input: PlayerCustodyBuyoutInput): Promise<PlayerSnapshot | null>;
    private synchronizeEnergy;
    private synchronizeCustody;
}
