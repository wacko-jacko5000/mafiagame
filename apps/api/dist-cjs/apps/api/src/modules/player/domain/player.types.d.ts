import type { CustodyStatusType } from "../../custody/domain/custody.types";
export interface PlayerSnapshot {
    id: string;
    accountId?: string | null;
    displayName: string;
    cash: number;
    respect: number;
    energy: number;
    energyUpdatedAt?: Date;
    health: number;
    jailedUntil: Date | null;
    hospitalizedUntil: Date | null;
    jailEntryCount?: number;
    hospitalEntryCount?: number;
    jailReason?: string | null;
    hospitalReason?: string | null;
    createdAt: Date;
    updatedAt: Date;
}
export interface PlayerResources {
    cash: number;
    respect: number;
    energy: number;
    health: number;
}
export interface PlayerProgressionSnapshot {
    level: number;
    rank: string;
    currentRespect: number;
    currentLevelMinRespect: number;
    nextLevel: number | null;
    nextRank: string | null;
    nextLevelRespectRequired: number | null;
    respectToNextLevel: number | null;
    progressPercent: number;
}
export interface PlayerResourceDelta {
    cash?: number;
    respect?: number;
    energy?: number;
    health?: number;
}
export interface PlayerCustodyStatusUpdate {
    jailedUntil?: Date | null;
    hospitalizedUntil?: Date | null;
    jailReason?: string | null;
    hospitalReason?: string | null;
}
export interface PlayerCustodyEntryInput {
    statusType: CustodyStatusType;
    until: Date;
    reason: string | null;
}
export interface PlayerCustodyBuyoutInput {
    statusType: CustodyStatusType;
    buyoutPrice: number;
    now: Date;
}
export interface CreatePlayerCommand {
    displayName: string;
}
export interface PlayerCreationValues extends PlayerResources {
    accountId?: string;
    displayName: string;
}
