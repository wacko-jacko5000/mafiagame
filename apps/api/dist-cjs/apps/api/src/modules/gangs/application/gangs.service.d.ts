import { DomainEventsService } from "../../../platform/domain-events/domain-events.service";
import { PlayerService } from "../../player/application/player.service";
import type { CreateGangCommand, GangInviteDecisionResult, GangInviteListItem, GangMemberListItem, PlayerGangMembershipView, GangSummary, InvitePlayerToGangCommand, JoinGangCommand, LeaveGangCommand, LeaveGangResult, ResolveGangInviteCommand } from "../domain/gangs.types";
import { type GangsRepository } from "./gangs.repository";
export declare class GangsService {
    private readonly playerService;
    private readonly domainEventsService;
    private readonly gangsRepository;
    constructor(playerService: PlayerService, domainEventsService: DomainEventsService, gangsRepository: GangsRepository);
    createGang(command: CreateGangCommand): Promise<GangSummary>;
    getGangById(gangId: string): Promise<GangSummary>;
    assertPlayerIsGangLeader(gangId: string, playerId: string): Promise<void>;
    joinGang(command: JoinGangCommand): Promise<GangMemberListItem>;
    leaveGang(command: LeaveGangCommand): Promise<LeaveGangResult>;
    listGangMembers(gangId: string): Promise<GangMemberListItem[]>;
    getPlayerGangMembership(playerId: string): Promise<PlayerGangMembershipView | null>;
    invitePlayer(command: InvitePlayerToGangCommand): Promise<GangInviteListItem>;
    acceptInvite(command: ResolveGangInviteCommand): Promise<GangInviteDecisionResult>;
    declineInvite(command: ResolveGangInviteCommand): Promise<GangInviteDecisionResult>;
    listGangInvites(gangId: string): Promise<GangInviteListItem[]>;
    listPlayerGangInvites(playerId: string): Promise<GangInviteListItem[]>;
    private toGangMemberListItem;
    private toGangMemberListItemFromSnapshot;
    private toGangInviteListItem;
}
