import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException
} from "@nestjs/common";

import {
  buildInitialPlayerValues,
  normalizeDisplayName
} from "../domain/player.policy";
import {
  AccountAlreadyHasPlayerError,
  InvalidPlayerDisplayNameError,
  InvalidPlayerResourceDeltaError,
  PlayerDisplayNameTakenError,
  PlayerNotFoundError
} from "../domain/player.errors";
import type {
  CreatePlayerCommand,
  PlayerCustodyStatusUpdate,
  PlayerResourceDelta,
  PlayerResources,
  PlayerSnapshot
} from "../domain/player.types";
import {
  PLAYER_REPOSITORY,
  type PlayerRepository
} from "./player.repository";

@Injectable()
export class PlayerService {
  constructor(
    @Inject(PLAYER_REPOSITORY)
    private readonly playerRepository: PlayerRepository
  ) {}

  async createPlayer(command: CreatePlayerCommand): Promise<PlayerSnapshot> {
    return this.createPlayerForAccount(command);
  }

  async createPlayerForAccount(
    command: CreatePlayerCommand,
    accountId?: string
  ): Promise<PlayerSnapshot> {
    try {
      const initialValues = buildInitialPlayerValues(command.displayName);
      const existingPlayer = await this.playerRepository.findByDisplayName(
        normalizeDisplayName(initialValues.displayName)
      );

      if (existingPlayer) {
        throw new PlayerDisplayNameTakenError(initialValues.displayName);
      }

      if (accountId) {
        const ownedPlayer = await this.playerRepository.findByAccountId(accountId);

        if (ownedPlayer) {
          throw new AccountAlreadyHasPlayerError();
        }
      }

      return await this.playerRepository.create({
        ...initialValues,
        accountId
      });
    } catch (error) {
      if (error instanceof InvalidPlayerDisplayNameError) {
        throw new BadRequestException(error.message);
      }

      if (error instanceof AccountAlreadyHasPlayerError) {
        throw new ConflictException(error.message);
      }

      if (error instanceof PlayerDisplayNameTakenError) {
        throw new ConflictException(error.message);
      }

      throw error;
    }
  }

  async getPlayerById(playerId: string): Promise<PlayerSnapshot> {
    return this.getPlayerByIdAt(playerId, new Date());
  }

  async getPlayerByIdAt(playerId: string, now: Date): Promise<PlayerSnapshot> {
    const player = await this.playerRepository.findById(playerId, now);

    if (!player) {
      throw new NotFoundException(new PlayerNotFoundError(playerId).message);
    }

    return player;
  }

  async getPlayerResources(playerId: string): Promise<PlayerResources> {
    const player = await this.getPlayerById(playerId);

    return {
      cash: player.cash,
      respect: player.respect,
      energy: player.energy,
      health: player.health
    };
  }

  async applyResourceDelta(
    playerId: string,
    delta: PlayerResourceDelta,
    now = new Date()
  ): Promise<PlayerSnapshot> {
    try {
      const player = await this.playerRepository.applyResourceDelta(playerId, delta, now);

      if (!player) {
        throw new NotFoundException(new PlayerNotFoundError(playerId).message);
      }

      return player;
    } catch (error) {
      if (error instanceof InvalidPlayerResourceDeltaError) {
        throw new BadRequestException(error.message);
      }

      throw error;
    }
  }

  async updateCustodyStatus(
    playerId: string,
    status: PlayerCustodyStatusUpdate
  ): Promise<PlayerSnapshot> {
    const player = await this.playerRepository.updateCustodyStatus(playerId, status);

    if (!player) {
      throw new NotFoundException(new PlayerNotFoundError(playerId).message);
    }

    return player;
  }
}
