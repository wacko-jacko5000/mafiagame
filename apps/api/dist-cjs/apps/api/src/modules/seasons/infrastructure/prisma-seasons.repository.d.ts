import { PrismaService } from "../../../platform/database/prisma.service";
import type { SeasonsRepository } from "../application/seasons.repository";
import type { CreateSeasonInput, SeasonSnapshot } from "../domain/season.types";
export declare class PrismaSeasonsRepository implements SeasonsRepository {
    private readonly prismaService;
    constructor(prismaService: PrismaService);
    listSeasons(): Promise<SeasonSnapshot[]>;
    findSeasonById(seasonId: string): Promise<SeasonSnapshot | null>;
    findCurrentSeason(): Promise<SeasonSnapshot | null>;
    createSeason(input: CreateSeasonInput): Promise<SeasonSnapshot>;
    activateSeason(seasonId: string, activatedAt: Date): Promise<SeasonSnapshot | null>;
    deactivateSeason(seasonId: string, deactivatedAt: Date): Promise<SeasonSnapshot | null>;
}
