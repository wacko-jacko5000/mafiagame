import type {
  GangInviteDecisionResult,
  GangInviteListItem,
  GangMemberListItem,
  GangSummary,
  LeaveGangResult
} from "../domain/gangs.types";
import type {
  GangInviteDecisionResponseBody,
  GangInviteResponseBody,
  GangMemberResponseBody,
  GangResponseBody,
  LeaveGangResponseBody
} from "./gangs.contracts";

export function toGangResponseBody(gang: GangSummary): GangResponseBody {
  return {
    id: gang.id,
    name: gang.name,
    createdAt: gang.createdAt.toISOString(),
    createdByPlayerId: gang.createdByPlayerId,
    memberCount: gang.memberCount
  };
}

export function toGangMemberResponseBody(
  member: GangMemberListItem
): GangMemberResponseBody {
  return {
    id: member.id,
    gangId: member.gangId,
    playerId: member.playerId,
    displayName: member.displayName,
    role: member.role,
    joinedAt: member.joinedAt.toISOString()
  };
}

export function toLeaveGangResponseBody(
  result: LeaveGangResult
): LeaveGangResponseBody {
  return {
    gangId: result.gangId,
    playerId: result.playerId,
    role: result.role,
    gangDeleted: result.gangDeleted
  };
}

export function toGangInviteResponseBody(
  invite: GangInviteListItem
): GangInviteResponseBody {
  return {
    id: invite.id,
    gangId: invite.gangId,
    gangName: invite.gangName,
    invitedPlayerId: invite.invitedPlayerId,
    invitedPlayerDisplayName: invite.invitedPlayerDisplayName,
    invitedByPlayerId: invite.invitedByPlayerId,
    invitedByPlayerDisplayName: invite.invitedByPlayerDisplayName,
    status: invite.status,
    createdAt: invite.createdAt.toISOString()
  };
}

export function toGangInviteDecisionResponseBody(
  result: GangInviteDecisionResult
): GangInviteDecisionResponseBody {
  return {
    inviteId: result.inviteId,
    status: result.status,
    membership: result.membership
      ? toGangMemberResponseBody(result.membership)
      : null
  };
}
