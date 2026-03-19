import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";

import type { DistrictWithControlSnapshot } from "../domain/territory.types";
import {
  TERRITORY_REPOSITORY,
  type TerritoryRepository
} from "./territory.repository";

export interface UpdateDistrictBalanceInput {
  id: string;
  payoutAmount?: number;
  payoutCooldownMinutes?: number;
}

@Injectable()
export class TerritoryBalanceService {
  constructor(
    @Inject(TERRITORY_REPOSITORY)
    private readonly territoryRepository: TerritoryRepository
  ) {}

  async listDistrictBalances(): Promise<DistrictWithControlSnapshot[]> {
    return this.territoryRepository.listDistricts();
  }

  async updateDistrictBalances(
    updates: readonly UpdateDistrictBalanceInput[]
  ): Promise<DistrictWithControlSnapshot[]> {
    for (const update of updates) {
      const district = await this.territoryRepository.findDistrictById(update.id);

      if (!district) {
        throw new NotFoundException(`District "${update.id}" was not found.`);
      }

      const payoutAmount = update.payoutAmount ?? district.payoutAmount;
      const payoutCooldownMinutes =
        update.payoutCooldownMinutes ?? district.payoutCooldownMinutes;

      if (!Number.isInteger(payoutAmount) || payoutAmount <= 0) {
        throw new BadRequestException(
          `District "${district.id}" payoutAmount must be a positive whole number.`
        );
      }

      if (!Number.isInteger(payoutCooldownMinutes) || payoutCooldownMinutes <= 0) {
        throw new BadRequestException(
          `District "${district.id}" payoutCooldownMinutes must be a positive whole number.`
        );
      }

      const updatedDistrict = await this.territoryRepository.updateDistrictBalance({
        districtId: district.id,
        payoutAmount,
        payoutCooldownMinutes
      });

      if (!updatedDistrict) {
        throw new NotFoundException(`District "${district.id}" was not found.`);
      }
    }

    return this.listDistrictBalances();
  }
}
