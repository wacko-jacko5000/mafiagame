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
exports.PlayerService = void 0;
const common_1 = require("@nestjs/common");
const player_policy_1 = require("../domain/player.policy");
const player_rank_catalog_1 = require("../domain/player-rank.catalog");
const player_errors_1 = require("../domain/player.errors");
const player_repository_1 = require("./player.repository");
let PlayerService = class PlayerService {
    playerRepository;
    constructor(playerRepository) {
        this.playerRepository = playerRepository;
    }
    async createPlayer(command) {
        return this.createPlayerForAccount(command);
    }
    async createPlayerForAccount(command, accountId) {
        try {
            const initialValues = (0, player_policy_1.buildInitialPlayerValues)(command.displayName);
            const existingPlayer = await this.playerRepository.findByDisplayName((0, player_policy_1.normalizeDisplayName)(initialValues.displayName));
            if (existingPlayer) {
                throw new player_errors_1.PlayerDisplayNameTakenError(initialValues.displayName);
            }
            if (accountId) {
                const ownedPlayer = await this.playerRepository.findByAccountId(accountId);
                if (ownedPlayer) {
                    throw new player_errors_1.AccountAlreadyHasPlayerError();
                }
            }
            return await this.playerRepository.create({
                ...initialValues,
                accountId
            });
        }
        catch (error) {
            if (error instanceof player_errors_1.InvalidPlayerDisplayNameError) {
                throw new common_1.BadRequestException(error.message);
            }
            if (error instanceof player_errors_1.AccountAlreadyHasPlayerError) {
                throw new common_1.ConflictException(error.message);
            }
            if (error instanceof player_errors_1.PlayerDisplayNameTakenError) {
                throw new common_1.ConflictException(error.message);
            }
            throw error;
        }
    }
    async getPlayerById(playerId) {
        return this.getPlayerByIdAt(playerId, new Date());
    }
    async getPlayerByIdAt(playerId, now) {
        const player = await this.playerRepository.findById(playerId, now);
        if (!player) {
            throw new common_1.NotFoundException(new player_errors_1.PlayerNotFoundError(playerId).message);
        }
        return player;
    }
    async getPlayerResources(playerId) {
        const player = await this.getPlayerById(playerId);
        return {
            cash: player.cash,
            respect: player.respect,
            energy: player.energy,
            health: player.health
        };
    }
    async getPlayerProgression(playerId) {
        const player = await this.getPlayerById(playerId);
        return (0, player_policy_1.derivePlayerProgression)(player.respect);
    }
    getRankNameForLevel(level) {
        return (0, player_rank_catalog_1.getPlayerRankByLevel)(level)?.rank ?? null;
    }
    async applyResourceDelta(playerId, delta, now = new Date()) {
        try {
            const player = await this.playerRepository.applyResourceDelta(playerId, delta, now);
            if (!player) {
                throw new common_1.NotFoundException(new player_errors_1.PlayerNotFoundError(playerId).message);
            }
            return player;
        }
        catch (error) {
            if (error instanceof player_errors_1.InvalidPlayerResourceDeltaError) {
                throw new common_1.BadRequestException(error.message);
            }
            throw error;
        }
    }
    async updateCustodyStatus(playerId, status) {
        const player = await this.playerRepository.updateCustodyStatus(playerId, status);
        if (!player) {
            throw new common_1.NotFoundException(new player_errors_1.PlayerNotFoundError(playerId).message);
        }
        return player;
    }
    async applyCustodyEntry(playerId, input) {
        const player = await this.playerRepository.applyCustodyEntry(playerId, input);
        if (!player) {
            throw new common_1.NotFoundException(new player_errors_1.PlayerNotFoundError(playerId).message);
        }
        return player;
    }
    async buyOutCustodyStatus(playerId, input) {
        return this.playerRepository.buyOutCustodyStatus(playerId, input);
    }
};
exports.PlayerService = PlayerService;
exports.PlayerService = PlayerService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(player_repository_1.PLAYER_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], PlayerService);
