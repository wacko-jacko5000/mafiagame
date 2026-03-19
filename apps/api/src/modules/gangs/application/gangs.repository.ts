import type {
  CreateGangValues,
  GangInviteSnapshot,
  GangMemberSnapshot,
  GangSnapshot,
  LeaveGangPersistenceCommand,
  LeaveGangPersistenceResult,
  ResolveGangInvitePersistenceResult
} from "../domain/gangs.types";

export const GANGS_REPOSITORY = Symbol("GANGS_REPOSITORY");

export interface GangsRepository {
  createGang(
    values: CreateGangValues
  ): Promise<{ gang: GangSnapshot; membership: GangMemberSnapshot }>;
  countGangMembers(gangId: string): Promise<number>;
  findGangById(gangId: string): Promise<GangSnapshot | null>;
  findGangByName(name: string): Promise<GangSnapshot | null>;
  findMembershipByPlayerId(playerId: string): Promise<GangMemberSnapshot | null>;
  joinGang(command: { gangId: string; playerId: string }): Promise<GangMemberSnapshot | null>;
  leaveGang(
    command: LeaveGangPersistenceCommand
  ): Promise<LeaveGangPersistenceResult | null>;
  createInvite(command: {
    gangId: string;
    invitedPlayerId: string;
    invitedByPlayerId: string;
  }): Promise<GangInviteSnapshot | null>;
  findInviteById(inviteId: string): Promise<GangInviteSnapshot | null>;
  findPendingInviteByPlayerId(playerId: string): Promise<GangInviteSnapshot | null>;
  listGangInvites(gangId: string): Promise<GangInviteSnapshot[]>;
  listPlayerGangInvites(playerId: string): Promise<GangInviteSnapshot[]>;
  acceptInvite(command: {
    inviteId: string;
    playerId: string;
  }): Promise<ResolveGangInvitePersistenceResult | null>;
  declineInvite(command: {
    inviteId: string;
    playerId: string;
  }): Promise<GangInviteSnapshot | null>;
  listGangMembers(gangId: string): Promise<GangMemberSnapshot[]>;
}
