import { PrismaService } from "../../../platform/database/prisma.service";
import type { PlayerMissionSnapshot } from "../domain/missions.types";
import type { CreatePlayerMissionRecord, MissionsRepository, ResetPlayerMissionRecord } from "../application/missions.repository";
export declare class PrismaMissionsRepository implements MissionsRepository {
    private readonly prismaService;
    constructor(prismaService: PrismaService);
    findByPlayerAndMissionId(playerId: string, missionId: string): Promise<PlayerMissionSnapshot | null>;
    listByPlayerId(playerId: string): Promise<PlayerMissionSnapshot[]>;
    listActiveByPlayerId(playerId: string): Promise<PlayerMissionSnapshot[]>;
    createMission(record: CreatePlayerMissionRecord): Promise<PlayerMissionSnapshot>;
    resetMission(record: ResetPlayerMissionRecord): Promise<PlayerMissionSnapshot>;
    updateProgress(playerMissionId: string, progress: number): Promise<PlayerMissionSnapshot>;
    markCompleted(playerMissionId: string, completedAt: Date): Promise<PlayerMissionSnapshot>;
}
