import type { GangInviteDecisionResult, GangInviteListItem, GangMemberListItem, PlayerGangMembershipView, GangSummary, LeaveGangResult } from "../domain/gangs.types";
import type { GangInviteDecisionResponseBody, GangInviteResponseBody, GangMemberResponseBody, PlayerGangMembershipResponseBody, GangResponseBody, LeaveGangResponseBody } from "./gangs.contracts";
export declare function toGangResponseBody(gang: GangSummary): GangResponseBody;
export declare function toGangMemberResponseBody(member: GangMemberListItem): GangMemberResponseBody;
export declare function toLeaveGangResponseBody(result: LeaveGangResult): LeaveGangResponseBody;
export declare function toGangInviteResponseBody(invite: GangInviteListItem): GangInviteResponseBody;
export declare function toGangInviteDecisionResponseBody(result: GangInviteDecisionResult): GangInviteDecisionResponseBody;
export declare function toPlayerGangMembershipResponseBody(view: PlayerGangMembershipView): PlayerGangMembershipResponseBody;
