export interface DistrictSnapshot {
    id: string;
    name: string;
    payoutAmount: number;
    payoutCooldownMinutes: number;
    createdAt: Date;
}
export interface DistrictControlSnapshot {
    id: string;
    districtId: string;
    gangId: string;
    capturedAt: Date;
    lastPayoutClaimedAt: Date | null;
}
export type DistrictWarStatus = "pending" | "resolved";
export interface DistrictWarSnapshot {
    id: string;
    districtId: string;
    attackerGangId: string;
    defenderGangId: string;
    startedByPlayerId: string;
    status: DistrictWarStatus;
    createdAt: Date;
    resolvedAt: Date | null;
    winningGangId: string | null;
}
export interface DistrictWithControlSnapshot extends DistrictSnapshot {
    control: DistrictControlSnapshot | null;
    activeWar: DistrictWarSnapshot | null;
}
export interface DistrictController {
    gangId: string;
    gangName: string;
    capturedAt: Date;
}
export interface DistrictPayoutSummary {
    amount: number;
    cooldownMinutes: number;
    lastClaimedAt: Date | null;
    nextClaimAvailableAt: Date | null;
}
export interface DistrictSummary {
    id: string;
    name: string;
    payout: DistrictPayoutSummary;
    createdAt: Date;
    controller: DistrictController | null;
    activeWar: DistrictWarSummary | null;
}
export interface ClaimDistrictCommand {
    districtId: string;
    gangId: string;
}
export interface ClaimDistrictByPlayerCommand extends ClaimDistrictCommand {
    playerId: string;
}
export interface StartDistrictWarCommand {
    districtId: string;
    playerId: string;
    attackerGangId: string;
}
export interface ClaimDistrictPayoutByPlayerCommand {
    districtId: string;
    playerId: string;
    gangId: string;
}
export interface ResolveDistrictWarCommand {
    warId: string;
    winningGangId: string;
}
export interface DistrictWarSummary {
    id: string;
    districtId: string;
    attackerGangId: string;
    attackerGangName: string;
    defenderGangId: string;
    defenderGangName: string;
    startedByPlayerId: string;
    status: DistrictWarStatus;
    createdAt: Date;
    resolvedAt: Date | null;
    winningGangId: string | null;
    winningGangName: string | null;
}
export interface ResolveDistrictWarResult {
    war: DistrictWarSummary;
    district: DistrictSummary;
}
export interface DistrictPayoutClaimResult {
    district: DistrictSummary;
    payoutAmount: number;
    claimedAt: Date;
    paidToPlayerId: string;
    playerCashAfterClaim: number;
}
export type ClaimDistrictPayoutStatus = "claimed" | "district_not_found" | "district_uncontrolled" | "gang_not_controller" | "cooldown_not_elapsed";
