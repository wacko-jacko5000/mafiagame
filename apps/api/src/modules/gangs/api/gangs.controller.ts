import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Post
} from "@nestjs/common";

import { GangsService } from "../application/gangs.service";
import type {
  GangInviteDecisionResponseBody,
  GangInviteResponseBody,
  GangMemberResponseBody,
  PlayerGangMembershipResponseBody,
  GangResponseBody,
  LeaveGangResponseBody
} from "./gangs.contracts";
import {
  toGangInviteDecisionResponseBody,
  toGangInviteResponseBody,
  toGangMemberResponseBody,
  toPlayerGangMembershipResponseBody,
  toGangResponseBody,
  toLeaveGangResponseBody
} from "./gangs.presenter";

@Controller("gangs")
export class GangsController {
  constructor(
    @Inject(GangsService)
    private readonly gangsService: GangsService
  ) {}

  @Post()
  async createGang(
    @Body("playerId", ParseUUIDPipe) playerId: string,
    @Body("name") name: string
  ): Promise<GangResponseBody> {
    const gang = await this.gangsService.createGang({
      playerId,
      name
    });

    return toGangResponseBody(gang);
  }

  @Post(":gangId/join")
  async joinGang(
    @Param("gangId", ParseUUIDPipe) gangId: string,
    @Body("playerId", ParseUUIDPipe) playerId: string
  ): Promise<GangMemberResponseBody> {
    const membership = await this.gangsService.joinGang({
      gangId,
      playerId
    });

    return toGangMemberResponseBody(membership);
  }

  @Post(":gangId/leave")
  async leaveGang(
    @Param("gangId", ParseUUIDPipe) gangId: string,
    @Body("playerId", ParseUUIDPipe) playerId: string
  ): Promise<LeaveGangResponseBody> {
    const result = await this.gangsService.leaveGang({
      gangId,
      playerId
    });

    return toLeaveGangResponseBody(result);
  }

  @Post(":gangId/invite/:playerId")
  async invitePlayer(
    @Param("gangId", ParseUUIDPipe) gangId: string,
    @Param("playerId", ParseUUIDPipe) invitedPlayerId: string,
    @Body("invitedByPlayerId", ParseUUIDPipe) invitedByPlayerId: string
  ): Promise<GangInviteResponseBody> {
    const invite = await this.gangsService.invitePlayer({
      gangId,
      invitedPlayerId,
      invitedByPlayerId
    });

    return toGangInviteResponseBody(invite);
  }

  @Get(":gangId")
  async getGangById(
    @Param("gangId", ParseUUIDPipe) gangId: string
  ): Promise<GangResponseBody> {
    const gang = await this.gangsService.getGangById(gangId);
    return toGangResponseBody(gang);
  }

  @Get(":gangId/members")
  async listGangMembers(
    @Param("gangId", ParseUUIDPipe) gangId: string
  ): Promise<GangMemberResponseBody[]> {
    const members = await this.gangsService.listGangMembers(gangId);
    return members.map(toGangMemberResponseBody);
  }

  @Get(":gangId/invites")
  async listGangInvites(
    @Param("gangId", ParseUUIDPipe) gangId: string
  ): Promise<GangInviteResponseBody[]> {
    const invites = await this.gangsService.listGangInvites(gangId);
    return invites.map(toGangInviteResponseBody);
  }
}

@Controller("gang-invites")
export class GangInvitesController {
  constructor(
    @Inject(GangsService)
    private readonly gangsService: GangsService
  ) {}

  @Post(":inviteId/accept")
  async acceptInvite(
    @Param("inviteId", ParseUUIDPipe) inviteId: string,
    @Body("playerId", ParseUUIDPipe) playerId: string
  ): Promise<GangInviteDecisionResponseBody> {
    const result = await this.gangsService.acceptInvite({
      inviteId,
      playerId
    });

    return toGangInviteDecisionResponseBody(result);
  }

  @Post(":inviteId/decline")
  async declineInvite(
    @Param("inviteId", ParseUUIDPipe) inviteId: string,
    @Body("playerId", ParseUUIDPipe) playerId: string
  ): Promise<GangInviteDecisionResponseBody> {
    const result = await this.gangsService.declineInvite({
      inviteId,
      playerId
    });

    return toGangInviteDecisionResponseBody(result);
  }
}

@Controller("players/:playerId/gang-invites")
export class PlayerGangInvitesController {
  constructor(
    @Inject(GangsService)
    private readonly gangsService: GangsService
  ) {}

  @Get()
  async listPlayerGangInvites(
    @Param("playerId", ParseUUIDPipe) playerId: string
  ): Promise<GangInviteResponseBody[]> {
    const invites = await this.gangsService.listPlayerGangInvites(playerId);
    return invites.map(toGangInviteResponseBody);
  }
}

@Controller("players/:playerId/gang-membership")
export class PlayerGangMembershipController {
  constructor(
    @Inject(GangsService)
    private readonly gangsService: GangsService
  ) {}

  @Get()
  async getPlayerGangMembership(
    @Param("playerId", ParseUUIDPipe) playerId: string
  ): Promise<PlayerGangMembershipResponseBody | null> {
    const membership = await this.gangsService.getPlayerGangMembership(playerId);
    return membership ? toPlayerGangMembershipResponseBody(membership) : null;
  }
}
