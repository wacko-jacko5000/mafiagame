import { PrismaService } from "../../../platform/database/prisma.service";
import type { CreatePlayerActivity, PlayerActivitySnapshot } from "../domain/player-activity.types";
import type { PlayerActivityRepository } from "../application/player-activity.repository";
export declare class PrismaPlayerActivityRepository implements PlayerActivityRepository {
    private readonly prismaService;
    constructor(prismaService: PrismaService);
    createActivity(activity: CreatePlayerActivity): Promise<PlayerActivitySnapshot>;
    listByPlayerId(playerId: string, limit: number): Promise<PlayerActivitySnapshot[]>;
    markAsRead(playerId: string, activityId: string, readAt: Date): Promise<PlayerActivitySnapshot | null>;
}
