"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GangLeaderPermissionRequiredError = exports.GangInviteRecipientMismatchError = exports.PlayerAlreadyHasPendingGangInviteError = exports.GangInviteAlreadyResolvedError = exports.GangInvitePermissionDeniedError = exports.GangInviteNotFoundError = exports.GangLeaderCannotLeaveWithMembersError = exports.GangMembershipNotFoundError = exports.PlayerAlreadyInGangError = exports.GangNotFoundError = exports.GangNameTakenError = exports.InvalidGangNameError = void 0;
class InvalidGangNameError extends Error {
    constructor() {
        super("Gang name must be 3-24 characters and contain only letters, numbers, spaces, hyphens, and underscores.");
        this.name = "InvalidGangNameError";
    }
}
exports.InvalidGangNameError = InvalidGangNameError;
class GangNameTakenError extends Error {
    constructor(name) {
        super(`Gang "${name}" already exists.`);
        this.name = "GangNameTakenError";
    }
}
exports.GangNameTakenError = GangNameTakenError;
class GangNotFoundError extends Error {
    constructor(gangId) {
        super(`Gang "${gangId}" was not found.`);
        this.name = "GangNotFoundError";
    }
}
exports.GangNotFoundError = GangNotFoundError;
class PlayerAlreadyInGangError extends Error {
    constructor(playerId) {
        super(`Player "${playerId}" already belongs to a gang.`);
        this.name = "PlayerAlreadyInGangError";
    }
}
exports.PlayerAlreadyInGangError = PlayerAlreadyInGangError;
class GangMembershipNotFoundError extends Error {
    constructor(playerId, gangId) {
        super(`Player "${playerId}" is not a member of gang "${gangId}".`);
        this.name = "GangMembershipNotFoundError";
    }
}
exports.GangMembershipNotFoundError = GangMembershipNotFoundError;
class GangLeaderCannotLeaveWithMembersError extends Error {
    constructor(gangId) {
        super(`Leader cannot leave gang "${gangId}" while other members remain. Transfer and promotion flows are out of scope.`);
        this.name = "GangLeaderCannotLeaveWithMembersError";
    }
}
exports.GangLeaderCannotLeaveWithMembersError = GangLeaderCannotLeaveWithMembersError;
class GangInviteNotFoundError extends Error {
    constructor(inviteId) {
        super(`Gang invite "${inviteId}" was not found.`);
        this.name = "GangInviteNotFoundError";
    }
}
exports.GangInviteNotFoundError = GangInviteNotFoundError;
class GangInvitePermissionDeniedError extends Error {
    constructor(playerId, gangId) {
        super(`Player "${playerId}" is not allowed to invite for gang "${gangId}".`);
        this.name = "GangInvitePermissionDeniedError";
    }
}
exports.GangInvitePermissionDeniedError = GangInvitePermissionDeniedError;
class GangInviteAlreadyResolvedError extends Error {
    constructor(inviteId, status) {
        super(`Gang invite "${inviteId}" is already ${status}.`);
        this.name = "GangInviteAlreadyResolvedError";
    }
}
exports.GangInviteAlreadyResolvedError = GangInviteAlreadyResolvedError;
class PlayerAlreadyHasPendingGangInviteError extends Error {
    constructor(playerId) {
        super(`Player "${playerId}" already has a pending gang invite.`);
        this.name = "PlayerAlreadyHasPendingGangInviteError";
    }
}
exports.PlayerAlreadyHasPendingGangInviteError = PlayerAlreadyHasPendingGangInviteError;
class GangInviteRecipientMismatchError extends Error {
    constructor(inviteId, playerId) {
        super(`Gang invite "${inviteId}" is not for player "${playerId}".`);
        this.name = "GangInviteRecipientMismatchError";
    }
}
exports.GangInviteRecipientMismatchError = GangInviteRecipientMismatchError;
class GangLeaderPermissionRequiredError extends Error {
    constructor(playerId, gangId) {
        super(`Player "${playerId}" is not authorized as leader for gang "${gangId}".`);
        this.name = "GangLeaderPermissionRequiredError";
    }
}
exports.GangLeaderPermissionRequiredError = GangLeaderPermissionRequiredError;
