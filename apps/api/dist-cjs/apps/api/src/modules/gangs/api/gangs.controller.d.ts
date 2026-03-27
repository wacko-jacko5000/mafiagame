import { GangsService } from "../application/gangs.service";
import type { GangInviteDecisionResponseBody, GangInviteResponseBody, GangMemberResponseBody, PlayerGangMembershipResponseBody, GangResponseBody, LeaveGangResponseBody } from "./gangs.contracts";
export declare class GangsController {
    private readonly gangsService;
    constructor(gangsService: GangsService);
    createGang(playerId: string, name: string): Promise<GangResponseBody>;
    joinGang(gangId: string, playerId: string): Promise<GangMemberResponseBody>;
    leaveGang(gangId: string, playerId: string): Promise<LeaveGangResponseBody>;
    invitePlayer(gangId: string, invitedPlayerId: string, invitedByPlayerId: string): Promise<GangInviteResponseBody>;
    getGangById(gangId: string): Promise<GangResponseBody>;
    listGangMembers(gangId: string): Promise<GangMemberResponseBody[]>;
    listGangInvites(gangId: string): Promise<GangInviteResponseBody[]>;
}
export declare class GangInvitesController {
    private readonly gangsService;
    constructor(gangsService: GangsService);
    acceptInvite(inviteId: string, playerId: string): Promise<GangInviteDecisionResponseBody>;
    declineInvite(inviteId: string, playerId: string): Promise<GangInviteDecisionResponseBody>;
}
export declare class PlayerGangInvitesController {
    private readonly gangsService;
    constructor(gangsService: GangsService);
    listPlayerGangInvites(playerId: string): Promise<GangInviteResponseBody[]>;
}
export declare class PlayerGangMembershipController {
    private readonly gangsService;
    constructor(gangsService: GangsService);
    getPlayerGangMembership(playerId: string): Promise<PlayerGangMembershipResponseBody | null>;
}
