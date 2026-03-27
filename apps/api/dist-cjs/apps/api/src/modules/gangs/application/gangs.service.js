"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GangsService = void 0;
const common_1 = require("@nestjs/common");
const domain_events_service_1 = require("../../../platform/domain-events/domain-events.service");
const player_service_1 = require("../../player/application/player.service");
const gangs_errors_1 = require("../domain/gangs.errors");
const gangs_policy_1 = require("../domain/gangs.policy");
const gangs_repository_1 = require("./gangs.repository");
let GangsService = class GangsService {
    playerService;
    domainEventsService;
    gangsRepository;
    constructor(playerService, domainEventsService, gangsRepository) {
        this.playerService = playerService;
        this.domainEventsService = domainEventsService;
        this.gangsRepository = gangsRepository;
    }
    async createGang(command) {
        await this.playerService.getPlayerById(command.playerId);
        try {
            const values = (0, gangs_policy_1.buildCreateGangValues)(command.playerId, command.name);
            const existingGang = await this.gangsRepository.findGangByName((0, gangs_policy_1.normalizeGangName)(values.name));
            if (existingGang) {
                throw new gangs_errors_1.GangNameTakenError(values.name);
            }
            const existingMembership = await this.gangsRepository.findMembershipByPlayerId(command.playerId);
            if (existingMembership) {
                throw new gangs_errors_1.PlayerAlreadyInGangError(command.playerId);
            }
            const result = await this.gangsRepository.createGang(values);
            return {
                ...result.gang,
                memberCount: 1
            };
        }
        catch (error) {
            if (error instanceof gangs_errors_1.InvalidGangNameError) {
                throw new common_1.BadRequestException(error.message);
            }
            if (error instanceof gangs_errors_1.GangNameTakenError ||
                error instanceof gangs_errors_1.PlayerAlreadyInGangError) {
                throw new common_1.ConflictException(error.message);
            }
            throw error;
        }
    }
    async getGangById(gangId) {
        const gang = await this.gangsRepository.findGangById(gangId);
        if (!gang) {
            throw new common_1.NotFoundException(new gangs_errors_1.GangNotFoundError(gangId).message);
        }
        const memberCount = await this.gangsRepository.countGangMembers(gangId);
        return {
            ...gang,
            memberCount
        };
    }
    async assertPlayerIsGangLeader(gangId, playerId) {
        await this.playerService.getPlayerById(playerId);
        await this.getGangById(gangId);
        const membership = await this.gangsRepository.findMembershipByPlayerId(playerId);
        if (!membership || membership.gangId !== gangId || membership.role !== "leader") {
            throw new common_1.ConflictException(new gangs_errors_1.GangLeaderPermissionRequiredError(playerId, gangId).message);
        }
    }
    async joinGang(command) {
        const player = await this.playerService.getPlayerById(command.playerId);
        await this.getGangById(command.gangId);
        const existingMembership = await this.gangsRepository.findMembershipByPlayerId(command.playerId);
        if (existingMembership) {
            throw new common_1.ConflictException(new gangs_errors_1.PlayerAlreadyInGangError(command.playerId).message);
        }
        const membership = await this.gangsRepository.joinGang(command);
        if (!membership) {
            throw new common_1.NotFoundException(new gangs_errors_1.GangNotFoundError(command.gangId).message);
        }
        return this.toGangMemberListItem(membership, player.displayName);
    }
    async leaveGang(command) {
        const membership = await this.gangsRepository.findMembershipByPlayerId(command.playerId);
        if (!membership || membership.gangId !== command.gangId) {
            throw new common_1.NotFoundException(new gangs_errors_1.GangMembershipNotFoundError(command.playerId, command.gangId).message);
        }
        const gangMembers = await this.gangsRepository.listGangMembers(command.gangId);
        const deleteGang = membership.role === "leader" && gangMembers.length === 1;
        if (membership.role === "leader" && gangMembers.length > 1) {
            throw new common_1.ConflictException(new gangs_errors_1.GangLeaderCannotLeaveWithMembersError(command.gangId).message);
        }
        const result = await this.gangsRepository.leaveGang({
            ...command,
            deleteGang
        });
        if (!result) {
            throw new common_1.NotFoundException(new gangs_errors_1.GangNotFoundError(command.gangId).message);
        }
        return {
            gangId: result.membership.gangId,
            playerId: result.membership.playerId,
            role: result.membership.role,
            gangDeleted: result.gangDeleted
        };
    }
    async listGangMembers(gangId) {
        await this.getGangById(gangId);
        const memberships = await this.gangsRepository.listGangMembers(gangId);
        const players = await Promise.all(memberships.map((membership) => this.playerService.getPlayerById(membership.playerId)));
        return memberships.map((membership, index) => this.toGangMemberListItem(membership, players[index].displayName));
    }
    async getPlayerGangMembership(playerId) {
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
    async invitePlayer(command) {
        await this.playerService.getPlayerById(command.invitedPlayerId);
        const inviter = await this.playerService.getPlayerById(command.invitedByPlayerId);
        const gang = await this.getGangById(command.gangId);
        const inviterMembership = await this.gangsRepository.findMembershipByPlayerId(command.invitedByPlayerId);
        if (!inviterMembership ||
            inviterMembership.gangId !== command.gangId ||
            inviterMembership.role !== "leader") {
            throw new common_1.ConflictException(new gangs_errors_1.GangInvitePermissionDeniedError(command.invitedByPlayerId, command.gangId).message);
        }
        const existingMembership = await this.gangsRepository.findMembershipByPlayerId(command.invitedPlayerId);
        if (existingMembership) {
            throw new common_1.ConflictException(new gangs_errors_1.PlayerAlreadyInGangError(command.invitedPlayerId).message);
        }
        const pendingInvite = await this.gangsRepository.findPendingInviteByPlayerId(command.invitedPlayerId);
        if (pendingInvite) {
            throw new common_1.ConflictException(new gangs_errors_1.PlayerAlreadyHasPendingGangInviteError(command.invitedPlayerId).message);
        }
        const invite = await this.gangsRepository.createInvite(command);
        if (!invite) {
            throw new common_1.NotFoundException(new gangs_errors_1.GangNotFoundError(command.gangId).message);
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
    async acceptInvite(command) {
        const invite = await this.gangsRepository.findInviteById(command.inviteId);
        if (!invite) {
            throw new common_1.NotFoundException(new gangs_errors_1.GangInviteNotFoundError(command.inviteId).message);
        }
        if (invite.invitedPlayerId !== command.playerId) {
            throw new common_1.ConflictException(new gangs_errors_1.GangInviteRecipientMismatchError(command.inviteId, command.playerId).message);
        }
        if (invite.status !== "pending") {
            throw new common_1.ConflictException(new gangs_errors_1.GangInviteAlreadyResolvedError(command.inviteId, invite.status).message);
        }
        const existingMembership = await this.gangsRepository.findMembershipByPlayerId(command.playerId);
        if (existingMembership) {
            throw new common_1.ConflictException(new gangs_errors_1.PlayerAlreadyInGangError(command.playerId).message);
        }
        const result = await this.gangsRepository.acceptInvite(command);
        if (!result || !result.membership) {
            throw new common_1.NotFoundException(new gangs_errors_1.GangInviteNotFoundError(command.inviteId).message);
        }
        const membership = await this.toGangMemberListItemFromSnapshot(result.membership);
        return {
            inviteId: result.invite.id,
            status: "accepted",
            membership
        };
    }
    async declineInvite(command) {
        const invite = await this.gangsRepository.findInviteById(command.inviteId);
        if (!invite) {
            throw new common_1.NotFoundException(new gangs_errors_1.GangInviteNotFoundError(command.inviteId).message);
        }
        if (invite.invitedPlayerId !== command.playerId) {
            throw new common_1.ConflictException(new gangs_errors_1.GangInviteRecipientMismatchError(command.inviteId, command.playerId).message);
        }
        if (invite.status !== "pending") {
            throw new common_1.ConflictException(new gangs_errors_1.GangInviteAlreadyResolvedError(command.inviteId, invite.status).message);
        }
        const declinedInvite = await this.gangsRepository.declineInvite(command);
        if (!declinedInvite) {
            throw new common_1.NotFoundException(new gangs_errors_1.GangInviteNotFoundError(command.inviteId).message);
        }
        return {
            inviteId: declinedInvite.id,
            status: "declined",
            membership: null
        };
    }
    async listGangInvites(gangId) {
        const gang = await this.getGangById(gangId);
        const invites = await this.gangsRepository.listGangInvites(gangId);
        return Promise.all(invites.map((invite) => this.toGangInviteListItem(invite, gang.name)));
    }
    async listPlayerGangInvites(playerId) {
        await this.playerService.getPlayerById(playerId);
        const invites = await this.gangsRepository.listPlayerGangInvites(playerId);
        return Promise.all(invites.map((invite) => this.toGangInviteListItem(invite)));
    }
    toGangMemberListItem(membership, displayName) {
        return {
            ...membership,
            displayName
        };
    }
    async toGangMemberListItemFromSnapshot(membership) {
        const player = await this.playerService.getPlayerById(membership.playerId);
        return this.toGangMemberListItem(membership, player.displayName);
    }
    async toGangInviteListItem(invite, gangName) {
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
};
exports.GangsService = GangsService;
exports.GangsService = GangsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(player_service_1.PlayerService)),
    __param(1, (0, common_1.Inject)(domain_events_service_1.DomainEventsService)),
    __param(2, (0, common_1.Inject)(gangs_repository_1.GANGS_REPOSITORY)),
    __metadata("design:paramtypes", [player_service_1.PlayerService,
        domain_events_service_1.DomainEventsService, Object])
], GangsService);
