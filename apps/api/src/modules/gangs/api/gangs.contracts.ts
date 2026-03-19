export interface CreateGangRequestBody {
  playerId: string;
  name: string;
}

export interface GangMembershipRequestBody {
  playerId: string;
}

export interface GangResponseBody {
  id: string;
  name: string;
  createdAt: string;
  createdByPlayerId: string;
  memberCount: number;
}

export interface GangMemberResponseBody {
  id: string;
  gangId: string;
  playerId: string;
  displayName: string;
  role: "leader" | "member";
  joinedAt: string;
}

export interface LeaveGangResponseBody {
  gangId: string;
  playerId: string;
  role: "leader" | "member";
  gangDeleted: boolean;
}

export interface GangInviteResponseBody {
  id: string;
  gangId: string;
  gangName: string;
  invitedPlayerId: string;
  invitedPlayerDisplayName: string;
  invitedByPlayerId: string;
  invitedByPlayerDisplayName: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
}

export interface GangInviteDecisionResponseBody {
  inviteId: string;
  status: "accepted" | "declined";
  membership: GangMemberResponseBody | null;
}
