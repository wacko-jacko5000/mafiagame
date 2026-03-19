import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Post
} from "@nestjs/common";

import { TerritoryService } from "../application/territory.service";
import type {
  DistrictPayoutClaimResponseBody,
  DistrictResponseBody,
  DistrictWarResponseBody,
  ResolveDistrictWarResponseBody
} from "./territory.contracts";
import {
  toDistrictResponseBody,
  toDistrictPayoutClaimResponseBody,
  toDistrictWarResponseBody,
  toResolveDistrictWarResponseBody
} from "./territory.presenter";

@Controller("districts")
export class TerritoryController {
  constructor(
    @Inject(TerritoryService)
    private readonly territoryService: TerritoryService
  ) {}

  @Get()
  async listDistricts(): Promise<DistrictResponseBody[]> {
    const districts = await this.territoryService.listDistricts();
    return districts.map(toDistrictResponseBody);
  }

  @Get(":districtId")
  async getDistrictById(
    @Param("districtId", ParseUUIDPipe) districtId: string
  ): Promise<DistrictResponseBody> {
    const district = await this.territoryService.getDistrictById(districtId);
    return toDistrictResponseBody(district);
  }

  @Post(":districtId/claim")
  async claimDistrict(
    @Param("districtId", ParseUUIDPipe) districtId: string,
    @Body("playerId", ParseUUIDPipe) playerId: string,
    @Body("gangId", ParseUUIDPipe) gangId: string
  ): Promise<DistrictResponseBody> {
    const district = await this.territoryService.claimDistrict({
      districtId,
      playerId,
      gangId
    });
    return toDistrictResponseBody(district);
  }

  @Post(":districtId/payout/claim")
  async claimDistrictPayout(
    @Param("districtId", ParseUUIDPipe) districtId: string,
    @Body("playerId", ParseUUIDPipe) playerId: string,
    @Body("gangId", ParseUUIDPipe) gangId: string
  ): Promise<DistrictPayoutClaimResponseBody> {
    const result = await this.territoryService.claimDistrictPayout({
      districtId,
      playerId,
      gangId
    });

    return toDistrictPayoutClaimResponseBody(result);
  }

  @Post(":districtId/war/start")
  async startWar(
    @Param("districtId", ParseUUIDPipe) districtId: string,
    @Body("playerId", ParseUUIDPipe) playerId: string,
    @Body("attackerGangId", ParseUUIDPipe) attackerGangId: string
  ): Promise<DistrictWarResponseBody> {
    const war = await this.territoryService.startWar({
      districtId,
      playerId,
      attackerGangId
    });

    return toDistrictWarResponseBody(war);
  }

  @Get(":districtId/war")
  async getDistrictWar(
    @Param("districtId", ParseUUIDPipe) districtId: string
  ): Promise<DistrictWarResponseBody | null> {
    const war = await this.territoryService.getDistrictWarForDistrict(districtId);
    return war ? toDistrictWarResponseBody(war) : null;
  }
}

@Controller("district-wars")
export class DistrictWarsController {
  constructor(
    @Inject(TerritoryService)
    private readonly territoryService: TerritoryService
  ) {}

  @Get(":warId")
  async getWarById(
    @Param("warId", ParseUUIDPipe) warId: string
  ): Promise<DistrictWarResponseBody> {
    const war = await this.territoryService.getDistrictWarById(warId);
    return toDistrictWarResponseBody(war);
  }

  @Post(":warId/resolve")
  async resolveWar(
    @Param("warId", ParseUUIDPipe) warId: string,
    @Body("winningGangId", ParseUUIDPipe) winningGangId: string
  ): Promise<ResolveDistrictWarResponseBody> {
    const result = await this.territoryService.resolveWar({
      warId,
      winningGangId
    });

    return toResolveDistrictWarResponseBody(result);
  }
}
