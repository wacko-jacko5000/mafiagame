import type { CreateSeasonInput, SeasonSnapshot } from "../domain/season.types";
import { type SeasonsRepository } from "./seasons.repository";
export declare class SeasonsService {
    private readonly seasonsRepository;
    constructor(seasonsRepository: SeasonsRepository);
    listSeasons(): Promise<SeasonSnapshot[]>;
    getCurrentSeason(): Promise<SeasonSnapshot | null>;
    getSeasonById(seasonId: string): Promise<SeasonSnapshot>;
    createSeason(input: CreateSeasonInput): Promise<SeasonSnapshot>;
    activateSeason(seasonId: string): Promise<SeasonSnapshot>;
    deactivateSeason(seasonId: string): Promise<SeasonSnapshot>;
}
