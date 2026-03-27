import type { GangInviteStatus } from "./gangs.types";
export declare class InvalidGangNameError extends Error {
    constructor();
}
export declare class GangNameTakenError extends Error {
    constructor(name: string);
}
export declare class GangNotFoundError extends Error {
    constructor(gangId: string);
}
export declare class PlayerAlreadyInGangError extends Error {
    constructor(playerId: string);
}
export declare class GangMembershipNotFoundError extends Error {
    constructor(playerId: string, gangId: string);
}
export declare class GangLeaderCannotLeaveWithMembersError extends Error {
    constructor(gangId: string);
}
export declare class GangInviteNotFoundError extends Error {
    constructor(inviteId: string);
}
export declare class GangInvitePermissionDeniedError extends Error {
    constructor(playerId: string, gangId: string);
}
export declare class GangInviteAlreadyResolvedError extends Error {
    constructor(inviteId: string, status: Exclude<GangInviteStatus, "pending">);
}
export declare class PlayerAlreadyHasPendingGangInviteError extends Error {
    constructor(playerId: string);
}
export declare class GangInviteRecipientMismatchError extends Error {
    constructor(inviteId: string, playerId: string);
}
export declare class GangLeaderPermissionRequiredError extends Error {
    constructor(playerId: string, gangId: string);
}
