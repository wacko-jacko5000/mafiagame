import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards
} from "@nestjs/common";

import { AdminApiKeyGuard } from "../../admin-tools/api/admin-api-key.guard";
import { SeasonsService } from "../application/seasons.service";
import type {
  CurrentSeasonResponseBody,
  SeasonResponseBody
} from "./seasons.contracts";
import { parseCreateSeasonRequest } from "./create-season-request";
import { toSeasonResponseBody } from "./seasons.presenter";

@Controller("seasons")
export class SeasonsController {
  constructor(
    @Inject(SeasonsService)
    private readonly seasonsService: SeasonsService
  ) {}

  @Get()
  async listSeasons(): Promise<SeasonResponseBody[]> {
    const seasons = await this.seasonsService.listSeasons();
    return seasons.map(toSeasonResponseBody);
  }

  @Get("current")
  async getCurrentSeason(): Promise<CurrentSeasonResponseBody> {
    const season = await this.seasonsService.getCurrentSeason();
    return {
      season: season ? toSeasonResponseBody(season) : null
    };
  }

  @Get(":seasonId")
  async getSeasonById(
    @Param("seasonId", ParseUUIDPipe) seasonId: string
  ): Promise<SeasonResponseBody> {
    const season = await this.seasonsService.getSeasonById(seasonId);
    return toSeasonResponseBody(season);
  }
}

@Controller("admin/seasons")
@UseGuards(AdminApiKeyGuard)
export class AdminSeasonsController {
  constructor(
    @Inject(SeasonsService)
    private readonly seasonsService: SeasonsService
  ) {}

  @Post()
  async createSeason(@Body() body: unknown): Promise<SeasonResponseBody> {
    const season = await this.seasonsService.createSeason(
      parseCreateSeasonRequest(body)
    );

    return toSeasonResponseBody(season);
  }

  @Post(":seasonId/activate")
  async activateSeason(
    @Param("seasonId", ParseUUIDPipe) seasonId: string
  ): Promise<SeasonResponseBody> {
    const season = await this.seasonsService.activateSeason(seasonId);
    return toSeasonResponseBody(season);
  }

  @Post(":seasonId/deactivate")
  async deactivateSeason(
    @Param("seasonId", ParseUUIDPipe) seasonId: string
  ): Promise<SeasonResponseBody> {
    const season = await this.seasonsService.deactivateSeason(seasonId);
    return toSeasonResponseBody(season);
  }
}
