export interface JailStatusResponseBody {
    playerId: string;
    active: boolean;
    until: string | null;
    remainingSeconds: number;
}
export interface JailBuyoutStatusResponseBody {
    statusType: "jail";
    active: boolean;
    until: string | null;
    remainingSeconds: number;
    reason: string | null;
    entryCountSinceLevelReset: number;
    repeatCountSinceLevelReset: number;
    basePricePerMinute: number | null;
    currentPricePerMinute: number | null;
    escalationEnabled: boolean;
    escalationPercentage: number;
    minimumPrice: number | null;
    roundingRule: "ceil";
    buyoutPrice: number | null;
}
export interface JailBuyoutResponseBody {
    buyoutPrice: number;
    player: import("../../player/api/player.contracts").PlayerResponseBody;
}
