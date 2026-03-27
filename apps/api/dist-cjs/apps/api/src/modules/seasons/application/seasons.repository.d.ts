import type { CreateSeasonInput, SeasonSnapshot } from "../domain/season.types";
export declare const SEASONS_REPOSITORY: unique symbol;
export interface SeasonsRepository {
    listSeasons(): Promise<SeasonSnapshot[]>;
    findSeasonById(seasonId: string): Promise<SeasonSnapshot | null>;
    findCurrentSeason(): Promise<SeasonSnapshot | null>;
    createSeason(input: CreateSeasonInput): Promise<SeasonSnapshot>;
    activateSeason(seasonId: string, activatedAt: Date): Promise<SeasonSnapshot | null>;
    deactivateSeason(seasonId: string, deactivatedAt: Date): Promise<SeasonSnapshot | null>;
}
