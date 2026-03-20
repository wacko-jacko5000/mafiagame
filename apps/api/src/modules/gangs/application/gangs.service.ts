import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException
} from "@nestjs/common";

import { DomainEventsService } from "../../../platform/domain-events/domain-events.service";
import { PlayerService } from "../../player/application/player.service";
import {
  GangLeaderPermissionRequiredError,
  GangLeaderCannotLeaveWithMembersError,
  GangInviteAlreadyResolvedError,
  GangInviteNotFoundError,
  GangInvitePermissionDeniedError,
  GangInviteRecipientMismatchError,
  GangMembershipNotFoundError,
  GangNameTakenError,
  GangNotFoundError,
  InvalidGangNameError,
  PlayerAlreadyHasPendingGangInviteError,
  PlayerAlreadyInGangError
} from "../domain/gangs.errors";
import { buildCreateGangValues, normalizeGangName } from "../domain/gangs.policy";
import type {
  CreateGangCommand,
  GangInviteDecisionResult,
  GangInviteListItem,
  GangInviteSnapshot,
  GangMemberListItem,
  GangMemberSnapshot,
  PlayerGangMembershipView,
  GangSummary,
  InvitePlayerToGangCommand,
  JoinGangCommand,
  LeaveGangCommand,
  LeaveGangResult,
  ResolveGangInviteCommand
} from "../domain/gangs.types";
import {
  GANGS_REPOSITORY,
  type GangsRepository
} from "./gangs.repository";

@Injectable()
export class GangsService {
  constructor(
    @Inject(PlayerService)
    private readonly playerService: PlayerService,
    @Inject(DomainEventsService)
    private readonly domainEventsService: DomainEventsService,
    @Inject(GANGS_REPOSITORY)
    private readonly gangsRepository: GangsRepository
  ) {}

  async createGang(command: CreateGangCommand): Promise<GangSummary> {
    await this.playerService.getPlayerById(command.playerId);

    try {
      const values = buildCreateGangValues(command.playerId, command.name);
      const existingGang = await this.gangsRepository.findGangByName(
        normalizeGangName(values.name)
      );

      if (existingGang) {
        throw new GangNameTakenError(values.name);
      }

      const existingMembership = await this.gangsRepository.findMembershipByPlayerId(
        command.playerId
      );

      if (existingMembership) {
        throw new PlayerAlreadyInGangError(command.playerId);
      }

      const result = await this.gangsRepository.createGang(values);

      return {
        ...result.gang,
        memberCount: 1
      };
    } catch (error) {
      if (error instanceof InvalidGangNameError) {
        throw new BadRequestException(error.message);
      }

      if (
        error instanceof GangNameTakenError ||
        error instanceof PlayerAlreadyInGangError
      ) {
        throw new ConflictException(error.message);
      }

      throw error;
    }
  }

  async getGangById(gangId: string): Promise<GangSummary> {
    const gang = await this.gangsRepository.findGangById(gangId);

    if (!gang) {
      throw new NotFoundException(new GangNotFoundError(gangId).message);
    }

    const memberCount = await this.gangsRepository.countGangMembers(gangId);

    return {
      ...gang,
      memberCount
    };
  }

  async assertPlayerIsGangLeader(gangId: string, playerId: string): Promise<void> {
    await this.playerService.getPlayerById(playerId);
    await this.getGangById(gangId);

    const membership = await this.gangsRepository.findMembershipByPlayerId(playerId);

    if (!membership || membership.gangId !== gangId || membership.role !== "leader") {
      throw new ConflictException(
        new GangLeaderPermissionRequiredError(playerId, gangId).message
      );
    }
  }

  async joinGang(command: JoinGangCommand): Promise<GangMemberListItem> {
    const player = await this.playerService.getPlayerById(command.playerId);
    await this.getGangById(command.gangId);

    const existingMembership = await this.gangsRepository.findMembershipByPlayerId(
      command.playerId
    );

    if (existingMembership) {
      throw new ConflictException(
        new PlayerAlreadyInGangError(command.playerId).message
      );
    }

    const membership = await this.gangsRepository.joinGang(command);

    if (!membership) {
      throw new NotFoundException(new GangNotFoundError(command.gangId).message);
    }

    return this.toGangMemberListItem(membership, player.displayName);
  }

  async leaveGang(command: LeaveGangCommand): Promise<LeaveGangResult> {
    const membership = await this.gangsRepository.findMembershipByPlayerId(command.playerId);

    if (!membership || membership.gangId !== command.gangId) {
      throw new NotFoundException(
        new GangMembershipNotFoundError(command.playerId, command.gangId).message
      );
    }

    const gangMembers = await this.gangsRepository.listGangMembers(command.gangId);
    const deleteGang = membership.role === "leader" && gangMembers.length === 1;

    if (membership.role === "leader" && gangMembers.length > 1) {
      throw new ConflictException(
        new GangLeaderCannotLeaveWithMembersError(command.gangId).message
      );
    }

    const result = await this.gangsRepository.leaveGang({
      ...command,
      deleteGang
    });

    if (!result) {
      throw new NotFoundException(new GangNotFoundError(command.gangId).message);
    }

    return {
      gangId: result.membership.gangId,
      playerId: result.membership.playerId,
      role: result.membership.role,
      gangDeleted: result.gangDeleted
    };
  }

  async listGangMembers(gangId: string): Promise<GangMemberListItem[]> {
    await this.getGangById(gangId);

    const memberships = await this.gangsRepository.listGangMembers(gangId);
    const players = await Promise.all(
      memberships.map((membership) => this.playerService.getPlayerById(membership.playerId))
    );

    return memberships.map((membership, index) =>
      this.toGangMemberListItem(membership, players[index]!.displayName)
    );
  }

  async getPlayerGangMembership(
    playerId: string
  ): Promise<PlayerGangMembershipView | null> {
    await this.playerService.getPlayerById(playerId);

    const membership = await this.gangsRepository.findMembershipByPlayerId(playerId);

    if (!membership) {
      return null;
    }

    const [player, gang] = await Promise.all([
      this.playerService.getPlayerById(playerId),
      this.getGangById(membership.gangId)
    ]);

    return {
      membership: this.toGangMemberListItem(membership, player.displayName),
      gang
    };
  }

  async invitePlayer(command: InvitePlayerToGangCommand): Promise<GangInviteListItem> {
    await this.playerService.getPlayerById(command.invitedPlayerId);
    const inviter = await this.playerService.getPlayerById(command.invitedByPlayerId);
    const gang = await this.getGangById(command.gangId);
    const inviterMembership = await this.gangsRepository.findMembershipByPlayerId(
      command.invitedByPlayerId
    );

    if (
      !inviterMembership ||
      inviterMembership.gangId !== command.gangId ||
      inviterMembership.role !== "leader"
    ) {
      throw new ConflictException(
        new GangInvitePermissionDeniedError(
          command.invitedByPlayerId,
          command.gangId
        ).message
      );
    }

    const existingMembership = await this.gangsRepository.findMembershipByPlayerId(
      command.invitedPlayerId
    );

    if (existingMembership) {
      throw new ConflictException(
        new PlayerAlreadyInGangError(command.invitedPlayerId).message
      );
    }

    const pendingInvite = await this.gangsRepository.findPendingInviteByPlayerId(
      command.invitedPlayerId
    );

    if (pendingInvite) {
      throw new ConflictException(
        new PlayerAlreadyHasPendingGangInviteError(command.invitedPlayerId).message
      );
    }

    const invite = await this.gangsRepository.createInvite(command);

    if (!invite) {
      throw new NotFoundException(new GangNotFoundError(command.gangId).message);
    }

    const invitedPlayer = await this.playerService.getPlayerById(command.invitedPlayerId);
    await this.domainEventsService.publish({
      type: "gangs.invite_received",
      occurredAt: invite.createdAt,
      inviteId: invite.id,
      gangId: invite.gangId,
      gangName: gang.name,
      invitedPlayerId: invite.invitedPlayerId,
      invitedByPlayerId: invite.invitedByPlayerId,
      invitedByPlayerDisplayName: inviter.displayName
    });

    return {
      ...invite,
      gangName: gang.name,
      invitedPlayerDisplayName: invitedPlayer.displayName,
      invitedByPlayerDisplayName: inviter.displayName
    };
  }

  async acceptInvite(command: ResolveGangInviteCommand): Promise<GangInviteDecisionResult> {
    const invite = await this.gangsRepository.findInviteById(command.inviteId);

    if (!invite) {
      throw new NotFoundException(new GangInviteNotFoundError(command.inviteId).message);
    }

    if (invite.invitedPlayerId !== command.playerId) {
      throw new ConflictException(
        new GangInviteRecipientMismatchError(command.inviteId, command.playerId).message
      );
    }

    if (invite.status !== "pending") {
      throw new ConflictException(
        new GangInviteAlreadyResolvedError(command.inviteId, invite.status).message
      );
    }

    const existingMembership = await this.gangsRepository.findMembershipByPlayerId(
      command.playerId
    );

    if (existingMembership) {
      throw new ConflictException(new PlayerAlreadyInGangError(command.playerId).message);
    }

    const result = await this.gangsRepository.acceptInvite(command);

    if (!result || !result.membership) {
      throw new NotFoundException(new GangInviteNotFoundError(command.inviteId).message);
    }

    const membership = await this.toGangMemberListItemFromSnapshot(result.membership);

    return {
      inviteId: result.invite.id,
      status: "accepted",
      membership
    };
  }

  async declineInvite(command: ResolveGangInviteCommand): Promise<GangInviteDecisionResult> {
    const invite = await this.gangsRepository.findInviteById(command.inviteId);

    if (!invite) {
      throw new NotFoundException(new GangInviteNotFoundError(command.inviteId).message);
    }

    if (invite.invitedPlayerId !== command.playerId) {
      throw new ConflictException(
        new GangInviteRecipientMismatchError(command.inviteId, command.playerId).message
      );
    }

    if (invite.status !== "pending") {
      throw new ConflictException(
        new GangInviteAlreadyResolvedError(command.inviteId, invite.status).message
      );
    }

    const declinedInvite = await this.gangsRepository.declineInvite(command);

    if (!declinedInvite) {
      throw new NotFoundException(new GangInviteNotFoundError(command.inviteId).message);
    }

    return {
      inviteId: declinedInvite.id,
      status: "declined",
      membership: null
    };
  }

  async listGangInvites(gangId: string): Promise<GangInviteListItem[]> {
    const gang = await this.getGangById(gangId);
    const invites = await this.gangsRepository.listGangInvites(gangId);

    return Promise.all(
      invites.map((invite) => this.toGangInviteListItem(invite, gang.name))
    );
  }

  async listPlayerGangInvites(playerId: string): Promise<GangInviteListItem[]> {
    await this.playerService.getPlayerById(playerId);
    const invites = await this.gangsRepository.listPlayerGangInvites(playerId);

    return Promise.all(
      invites.map((invite) => this.toGangInviteListItem(invite))
    );
  }

  private toGangMemberListItem(
    membership: GangMemberSnapshot,
    displayName: string
  ): GangMemberListItem {
    return {
      ...membership,
      displayName
    };
  }

  private async toGangMemberListItemFromSnapshot(
    membership: GangMemberSnapshot
  ): Promise<GangMemberListItem> {
    const player = await this.playerService.getPlayerById(membership.playerId);
    return this.toGangMemberListItem(membership, player.displayName);
  }

  private async toGangInviteListItem(
    invite: GangInviteSnapshot,
    gangName?: string
  ): Promise<GangInviteListItem> {
    const [gang, invitedPlayer, invitedByPlayer] = await Promise.all([
      gangName ? Promise.resolve({ name: gangName }) : this.getGangById(invite.gangId),
      this.playerService.getPlayerById(invite.invitedPlayerId),
      this.playerService.getPlayerById(invite.invitedByPlayerId)
    ]);

    return {
      ...invite,
      gangName: gang.name,
      invitedPlayerDisplayName: invitedPlayer.displayName,
      invitedByPlayerDisplayName: invitedByPlayer.displayName
    };
  }
}
