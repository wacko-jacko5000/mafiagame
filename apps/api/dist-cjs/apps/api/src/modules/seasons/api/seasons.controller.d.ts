import { SeasonsService } from "../application/seasons.service";
import type { CurrentSeasonResponseBody, SeasonResponseBody } from "./seasons.contracts";
export declare class SeasonsController {
    private readonly seasonsService;
    constructor(seasonsService: SeasonsService);
    listSeasons(): Promise<SeasonResponseBody[]>;
    getCurrentSeason(): Promise<CurrentSeasonResponseBody>;
    getSeasonById(seasonId: string): Promise<SeasonResponseBody>;
}
export declare class AdminSeasonsController {
    private readonly seasonsService;
    constructor(seasonsService: SeasonsService);
    createSeason(body: unknown): Promise<SeasonResponseBody>;
    activateSeason(seasonId: string): Promise<SeasonResponseBody>;
    deactivateSeason(seasonId: string): Promise<SeasonResponseBody>;
}
