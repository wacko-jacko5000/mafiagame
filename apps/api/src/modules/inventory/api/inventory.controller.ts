import {
  Controller,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards
} from "@nestjs/common";

import { AuthGuard } from "../../auth/api/auth.guard";
import { CurrentActor } from "../../auth/api/current-actor.decorator";
import { requireCurrentPlayerId } from "../../auth/api/current-player.utils";
import type { AuthActor } from "../../auth/domain/auth.types";
import { InventoryService } from "../application/inventory.service";
import type {
  EquippedItemsResponseBody,
  PlayerInventoryItemResponseBody,
  PurchaseItemResponseBody,
  ShopItemResponseBody
} from "./inventory.contracts";
import {
  toEquippedItemsResponseBody,
  toPlayerInventoryItemResponseBody,
  toPurchaseItemResponseBody,
  toShopItemResponseBody
} from "./inventory.presenter";

@Controller()
export class InventoryController {
  constructor(
    @Inject(InventoryService)
    private readonly inventoryService: InventoryService
  ) {}

  @Get("shop/items")
  getShopItems(): ShopItemResponseBody[] {
    return this.inventoryService.listShopItems().map(toShopItemResponseBody);
  }

  @Get("players/:playerId/inventory")
  async getPlayerInventory(
    @Param("playerId", ParseUUIDPipe) playerId: string
  ): Promise<PlayerInventoryItemResponseBody[]> {
    const inventory = await this.inventoryService.listPlayerInventory(playerId);
    return inventory.map(toPlayerInventoryItemResponseBody);
  }

  @Get("players/:playerId/equipment")
  async getEquippedItems(
    @Param("playerId", ParseUUIDPipe) playerId: string
  ): Promise<EquippedItemsResponseBody> {
    const equippedItems = await this.inventoryService.getEquippedItems(playerId);
    return toEquippedItemsResponseBody(equippedItems);
  }

  @Get("me/inventory")
  @UseGuards(AuthGuard)
  async getCurrentPlayerInventory(
    @CurrentActor() actor: AuthActor | undefined
  ): Promise<PlayerInventoryItemResponseBody[]> {
    const inventory = await this.inventoryService.listPlayerInventory(
      requireCurrentPlayerId(actor)
    );

    return inventory.map(toPlayerInventoryItemResponseBody);
  }

  @Get("me/equipment")
  @UseGuards(AuthGuard)
  async getCurrentEquippedItems(
    @CurrentActor() actor: AuthActor | undefined
  ): Promise<EquippedItemsResponseBody> {
    const equippedItems = await this.inventoryService.getEquippedItems(
      requireCurrentPlayerId(actor)
    );

    return toEquippedItemsResponseBody(equippedItems);
  }

  @Post("players/:playerId/shop/:itemId/purchase")
  async purchaseItem(
    @Param("playerId", ParseUUIDPipe) playerId: string,
    @Param("itemId") itemId: string
  ): Promise<PurchaseItemResponseBody> {
    const result = await this.inventoryService.purchaseItem(playerId, itemId);
    return toPurchaseItemResponseBody(result);
  }

  @Post("me/shop/:itemId/purchase")
  @UseGuards(AuthGuard)
  async purchaseCurrentPlayerItem(
    @Param("itemId") itemId: string,
    @CurrentActor() actor: AuthActor | undefined
  ): Promise<PurchaseItemResponseBody> {
    const result = await this.inventoryService.purchaseItem(
      requireCurrentPlayerId(actor),
      itemId
    );

    return toPurchaseItemResponseBody(result);
  }

  @Post("players/:playerId/inventory/:inventoryItemId/equip/:slot")
  async equipItem(
    @Param("playerId", ParseUUIDPipe) playerId: string,
    @Param("inventoryItemId", ParseUUIDPipe) inventoryItemId: string,
    @Param("slot") slot: string
  ): Promise<PlayerInventoryItemResponseBody> {
    const result = await this.inventoryService.equipItem(playerId, inventoryItemId, slot);
    return toPlayerInventoryItemResponseBody(result);
  }

  @Post("me/inventory/:inventoryItemId/equip/:slot")
  @UseGuards(AuthGuard)
  async equipCurrentPlayerItem(
    @Param("inventoryItemId", ParseUUIDPipe) inventoryItemId: string,
    @Param("slot") slot: string,
    @CurrentActor() actor: AuthActor | undefined
  ): Promise<PlayerInventoryItemResponseBody> {
    const result = await this.inventoryService.equipItem(
      requireCurrentPlayerId(actor),
      inventoryItemId,
      slot
    );

    return toPlayerInventoryItemResponseBody(result);
  }

  @Post("players/:playerId/equipment/:slot/unequip")
  async unequipSlot(
    @Param("playerId", ParseUUIDPipe) playerId: string,
    @Param("slot") slot: string
  ): Promise<PlayerInventoryItemResponseBody | null> {
    const result = await this.inventoryService.unequipSlot(playerId, slot);
    return result ? toPlayerInventoryItemResponseBody(result) : null;
  }

  @Post("me/equipment/:slot/unequip")
  @UseGuards(AuthGuard)
  async unequipCurrentPlayerSlot(
    @Param("slot") slot: string,
    @CurrentActor() actor: AuthActor | undefined
  ): Promise<PlayerInventoryItemResponseBody | null> {
    const result = await this.inventoryService.unequipSlot(
      requireCurrentPlayerId(actor),
      slot
    );

    return result ? toPlayerInventoryItemResponseBody(result) : null;
  }
}
