import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException
} from "@nestjs/common";

import {
  InvalidSeasonNameError,
  InvalidSeasonWindowError,
  SeasonAlreadyInactiveError,
  SeasonNotFoundError
} from "../domain/season.errors";
import type { CreateSeasonInput, SeasonSnapshot } from "../domain/season.types";
import {
  SEASONS_REPOSITORY,
  type SeasonsRepository
} from "./seasons.repository";

@Injectable()
export class SeasonsService {
  constructor(
    @Inject(SEASONS_REPOSITORY)
    private readonly seasonsRepository: SeasonsRepository
  ) {}

  listSeasons(): Promise<SeasonSnapshot[]> {
    return this.seasonsRepository.listSeasons();
  }

  getCurrentSeason(): Promise<SeasonSnapshot | null> {
    return this.seasonsRepository.findCurrentSeason();
  }

  async getSeasonById(seasonId: string): Promise<SeasonSnapshot> {
    const season = await this.seasonsRepository.findSeasonById(seasonId);

    if (!season) {
      throw new NotFoundException(new SeasonNotFoundError(seasonId).message);
    }

    return season;
  }

  async createSeason(input: CreateSeasonInput): Promise<SeasonSnapshot> {
    const normalizedName = input.name.trim();

    if (normalizedName.length === 0 || normalizedName.length > 64) {
      throw new BadRequestException(new InvalidSeasonNameError().message);
    }

    if (input.startsAt && input.endsAt && input.endsAt <= input.startsAt) {
      throw new BadRequestException(new InvalidSeasonWindowError().message);
    }

    return this.seasonsRepository.createSeason({
      ...input,
      name: normalizedName
    });
  }

  async activateSeason(seasonId: string): Promise<SeasonSnapshot> {
    const season = await this.getSeasonById(seasonId);

    if (season.status === "active") {
      return season;
    }

    const activatedSeason = await this.seasonsRepository.activateSeason(
      seasonId,
      new Date()
    );

    if (!activatedSeason) {
      throw new NotFoundException(new SeasonNotFoundError(seasonId).message);
    }

    return activatedSeason;
  }

  async deactivateSeason(seasonId: string): Promise<SeasonSnapshot> {
    const season = await this.getSeasonById(seasonId);

    if (season.status !== "active") {
      throw new ConflictException(new SeasonAlreadyInactiveError(seasonId).message);
    }

    const deactivatedSeason = await this.seasonsRepository.deactivateSeason(
      seasonId,
      new Date()
    );

    if (!deactivatedSeason) {
      throw new NotFoundException(new SeasonNotFoundError(seasonId).message);
    }

    return deactivatedSeason;
  }
}
