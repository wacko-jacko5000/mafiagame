import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post
} from "@nestjs/common";

import { MarketService } from "../application/market.service";
import type {
  MarketListingResponseBody,
  MarketPurchaseResponseBody
} from "./market.contracts";
import {
  toMarketListingResponseBody,
  toMarketPurchaseResponseBody
} from "./market.presenter";

@Controller("market/listings")
export class MarketController {
  constructor(
    @Inject(MarketService)
    private readonly marketService: MarketService
  ) {}

  @Get()
  async listListings(): Promise<MarketListingResponseBody[]> {
    const listings = await this.marketService.listListings();
    return listings.map(toMarketListingResponseBody);
  }

  @Get(":listingId")
  async getListingById(
    @Param("listingId", ParseUUIDPipe) listingId: string
  ): Promise<MarketListingResponseBody> {
    const listing = await this.marketService.getListingById(listingId);
    return toMarketListingResponseBody(listing);
  }

  @Post()
  async createListing(
    @Body("playerId", ParseUUIDPipe) playerId: string,
    @Body("inventoryItemId", ParseUUIDPipe) inventoryItemId: string,
    @Body("price", ParseIntPipe) price: number
  ): Promise<MarketListingResponseBody> {
    const listing = await this.marketService.createListing({
      playerId,
      inventoryItemId,
      price
    });

    return toMarketListingResponseBody(listing);
  }

  @Post(":listingId/buy")
  async buyListing(
    @Param("listingId", ParseUUIDPipe) listingId: string,
    @Body("buyerPlayerId", ParseUUIDPipe) buyerPlayerId: string
  ): Promise<MarketPurchaseResponseBody> {
    const result = await this.marketService.buyListing({
      listingId,
      buyerPlayerId
    });

    return toMarketPurchaseResponseBody(result);
  }

  @Post(":listingId/cancel")
  async cancelListing(
    @Param("listingId", ParseUUIDPipe) listingId: string,
    @Body("playerId", ParseUUIDPipe) playerId: string
  ): Promise<MarketListingResponseBody> {
    const listing = await this.marketService.cancelListing({
      listingId,
      playerId
    });

    return toMarketListingResponseBody(listing);
  }
}
