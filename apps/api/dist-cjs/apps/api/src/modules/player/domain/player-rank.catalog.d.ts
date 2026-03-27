export interface PlayerRankDefinition {
    level: number;
    rank: string;
    minRespect: number;
}
export declare const playerRankCatalog: readonly PlayerRankDefinition[];
export declare function getPlayerRankByLevel(level: number): PlayerRankDefinition | undefined;
