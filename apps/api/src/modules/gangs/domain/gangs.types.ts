export type GangRole = "leader" | "member";
export type GangInviteStatus = "pending" | "accepted" | "declined";

export interface CreateGangCommand {
  playerId: string;
  name: string;
}

export interface JoinGangCommand {
  gangId: string;
  playerId: string;
}

export interface LeaveGangCommand {
  gangId: string;
  playerId: string;
}

export interface InvitePlayerToGangCommand {
  gangId: string;
  invitedPlayerId: string;
  invitedByPlayerId: string;
}

export interface ResolveGangInviteCommand {
  inviteId: string;
  playerId: string;
}

export interface GangSnapshot {
  id: string;
  name: string;
  createdAt: Date;
  createdByPlayerId: string;
}

export interface GangMemberSnapshot {
  id: string;
  gangId: string;
  playerId: string;
  role: GangRole;
  joinedAt: Date;
}

export interface GangInviteSnapshot {
  id: string;
  gangId: string;
  invitedPlayerId: string;
  invitedByPlayerId: string;
  status: GangInviteStatus;
  createdAt: Date;
}

export interface GangSummary extends GangSnapshot {
  memberCount: number;
}

export interface GangMemberListItem extends GangMemberSnapshot {
  displayName: string;
}

export interface GangInviteListItem extends GangInviteSnapshot {
  gangName: string;
  invitedPlayerDisplayName: string;
  invitedByPlayerDisplayName: string;
}

export interface LeaveGangResult {
  gangId: string;
  playerId: string;
  role: GangRole;
  gangDeleted: boolean;
}

export interface GangInviteDecisionResult {
  inviteId: string;
  status: Exclude<GangInviteStatus, "pending">;
  membership: GangMemberListItem | null;
}

export interface CreateGangValues {
  playerId: string;
  name: string;
}

export interface LeaveGangPersistenceCommand extends LeaveGangCommand {
  deleteGang: boolean;
}

export interface LeaveGangPersistenceResult {
  membership: GangMemberSnapshot;
  gangDeleted: boolean;
}

export interface ResolveGangInvitePersistenceResult {
  invite: GangInviteSnapshot;
  membership: GangMemberSnapshot | null;
}
