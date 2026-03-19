import type { GangInviteStatus } from "./gangs.types";

export class InvalidGangNameError extends Error {
  constructor() {
    super(
      "Gang name must be 3-24 characters and contain only letters, numbers, spaces, hyphens, and underscores."
    );
    this.name = "InvalidGangNameError";
  }
}

export class GangNameTakenError extends Error {
  constructor(name: string) {
    super(`Gang "${name}" already exists.`);
    this.name = "GangNameTakenError";
  }
}

export class GangNotFoundError extends Error {
  constructor(gangId: string) {
    super(`Gang "${gangId}" was not found.`);
    this.name = "GangNotFoundError";
  }
}

export class PlayerAlreadyInGangError extends Error {
  constructor(playerId: string) {
    super(`Player "${playerId}" already belongs to a gang.`);
    this.name = "PlayerAlreadyInGangError";
  }
}

export class GangMembershipNotFoundError extends Error {
  constructor(playerId: string, gangId: string) {
    super(`Player "${playerId}" is not a member of gang "${gangId}".`);
    this.name = "GangMembershipNotFoundError";
  }
}

export class GangLeaderCannotLeaveWithMembersError extends Error {
  constructor(gangId: string) {
    super(
      `Leader cannot leave gang "${gangId}" while other members remain. Transfer and promotion flows are out of scope.`
    );
    this.name = "GangLeaderCannotLeaveWithMembersError";
  }
}

export class GangInviteNotFoundError extends Error {
  constructor(inviteId: string) {
    super(`Gang invite "${inviteId}" was not found.`);
    this.name = "GangInviteNotFoundError";
  }
}

export class GangInvitePermissionDeniedError extends Error {
  constructor(playerId: string, gangId: string) {
    super(`Player "${playerId}" is not allowed to invite for gang "${gangId}".`);
    this.name = "GangInvitePermissionDeniedError";
  }
}

export class GangInviteAlreadyResolvedError extends Error {
  constructor(inviteId: string, status: Exclude<GangInviteStatus, "pending">) {
    super(`Gang invite "${inviteId}" is already ${status}.`);
    this.name = "GangInviteAlreadyResolvedError";
  }
}

export class PlayerAlreadyHasPendingGangInviteError extends Error {
  constructor(playerId: string) {
    super(`Player "${playerId}" already has a pending gang invite.`);
    this.name = "PlayerAlreadyHasPendingGangInviteError";
  }
}

export class GangInviteRecipientMismatchError extends Error {
  constructor(inviteId: string, playerId: string) {
    super(`Gang invite "${inviteId}" is not for player "${playerId}".`);
    this.name = "GangInviteRecipientMismatchError";
  }
}

export class GangLeaderPermissionRequiredError extends Error {
  constructor(playerId: string, gangId: string) {
    super(`Player "${playerId}" is not authorized as leader for gang "${gangId}".`);
    this.name = "GangLeaderPermissionRequiredError";
  }
}
