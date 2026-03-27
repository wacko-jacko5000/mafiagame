"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toGangResponseBody = toGangResponseBody;
exports.toGangMemberResponseBody = toGangMemberResponseBody;
exports.toLeaveGangResponseBody = toLeaveGangResponseBody;
exports.toGangInviteResponseBody = toGangInviteResponseBody;
exports.toGangInviteDecisionResponseBody = toGangInviteDecisionResponseBody;
exports.toPlayerGangMembershipResponseBody = toPlayerGangMembershipResponseBody;
function toGangResponseBody(gang) {
    return {
        id: gang.id,
        name: gang.name,
        createdAt: gang.createdAt.toISOString(),
        createdByPlayerId: gang.createdByPlayerId,
        memberCount: gang.memberCount
    };
}
function toGangMemberResponseBody(member) {
    return {
        id: member.id,
        gangId: member.gangId,
        playerId: member.playerId,
        displayName: member.displayName,
        role: member.role,
        joinedAt: member.joinedAt.toISOString()
    };
}
function toLeaveGangResponseBody(result) {
    return {
        gangId: result.gangId,
        playerId: result.playerId,
        role: result.role,
        gangDeleted: result.gangDeleted
    };
}
function toGangInviteResponseBody(invite) {
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
function toGangInviteDecisionResponseBody(result) {
    return {
        inviteId: result.inviteId,
        status: result.status,
        membership: result.membership
            ? toGangMemberResponseBody(result.membership)
            : null
    };
}
function toPlayerGangMembershipResponseBody(view) {
    return {
        membership: toGangMemberResponseBody(view.membership),
        gang: toGangResponseBody(view.gang)
    };
}
