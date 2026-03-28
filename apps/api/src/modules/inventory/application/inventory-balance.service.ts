import { BadRequestException, Inject, Injectable, NotFoundException, OnModuleInit } from "@nestjs/common";

import {
  applyShopItemBalanceOverride,
  buildShopItemDefinition,
  getEquipmentItemById,
  getShopItemById,
  starterShopItemCatalog
} from "../domain/inventory.catalog";
import type {
  ConsumableEffectResource,
  EquipmentShopItemCategory,
  EquipmentItemDefinition,
  OwnedShopItemDefinition,
  ShopItemDefinition
} from "../domain/inventory.types";
import {
  INVENTORY_BALANCE_REPOSITORY,
  type InventoryBalanceRepository,
  type ShopItemBalanceRecord
} from "./inventory-balance.repository";

export interface UpdateShopItemBalanceInput {
  id: string;
  name?: string;
  unlockLevel?: number;
  price?: number;
  respectBonus?: number | null;
  parkingSlots?: number | null;
  damageBonus?: number | null;
  effectResource?: ConsumableEffectResource | null;
  effectAmount?: number | null;
}

export interface CreateShopItemInput {
  id: string;
  name: string;
  kind: "weapon" | "drug" | "car" | "house";
  weaponCategory?: EquipmentShopItemCategory;
  unlockLevel: number;
  price: number;
  respectBonus?: number;
  parkingSlots?: number;
  damageBonus?: number;
  effectResource?: ConsumableEffectResource;
  effectAmount?: number;
}

function cloneShopItem(item: ShopItemDefinition): ShopItemDefinition {
  if (item.delivery === "inventory" && item.equipSlot !== null) {
    return {
      ...item,
      consumableEffects: null,
      weaponStats: item.weaponStats ? { ...item.weaponStats } : null,
      armorStats: item.armorStats ? { ...item.armorStats } : null
    };
  }

  if (item.delivery === "inventory") {
    return {
      ...item,
      consumableEffects: null,
      weaponStats: null,
      armorStats: null
    };
  }

  return {
    ...item,
    weaponStats: null,
    armorStats: null,
    consumableEffects: item.consumableEffects.map((effect) => ({ ...effect }))
  };
}

function assertPositiveInteger(value: number, fieldName: string): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new BadRequestException(`${fieldName} must be a positive whole number.`);
  }
}

@Injectable()
export class InventoryBalanceService implements OnModuleInit {
  private readonly customShopItemCatalog = new Map<string, ShopItemDefinition>();
  private readonly archivedCustomShopItemIds = new Set<string>();

  constructor(
    @Inject(INVENTORY_BALANCE_REPOSITORY)
    private readonly inventoryBalanceRepository: InventoryBalanceRepository
  ) {}

  async onModuleInit(): Promise<void> {
    const persistedBalances = await this.inventoryBalanceRepository.listShopItemBalances();

    for (const balance of persistedBalances) {
      const defaultItem = getShopItemById(balance.itemId);

      if (defaultItem && !balance.archived) {
        applyShopItemBalanceOverride(balance.itemId, {
          price: balance.price
        });
      }

      if (defaultItem) {
        if (balance.archived) {
          this.archivedCustomShopItemIds.add(balance.itemId);
        }

        continue;
      }

      if (
        !balance.name ||
        !balance.type ||
        !balance.category ||
        !balance.delivery ||
        balance.unlockLevel === null
      ) {
        continue;
      }

      const customItem = buildShopItemDefinition({
        id: balance.itemId,
        name: balance.name,
        type: balance.type as ShopItemDefinition["type"],
        category: balance.category as ShopItemDefinition["category"],
        price: balance.price,
        unlockLevel: balance.unlockLevel,
        respectBonus: balance.respectBonus ?? undefined,
        parkingSlots: balance.parkingSlots ?? undefined,
        damageBonus: balance.damageBonus ?? undefined,
        damageReduction: balance.damageReduction ?? undefined,
        effectResource: (balance.resourceEffectResource as ConsumableEffectResource | null) ?? undefined,
        effectAmount: balance.resourceEffectAmount ?? undefined
      });

      this.customShopItemCatalog.set(customItem.id, customItem);
      if (balance.archived) {
        this.archivedCustomShopItemIds.add(customItem.id);
      }
    }
  }

  listShopItemBalances(): ShopItemDefinition[] {
    return [
      ...starterShopItemCatalog.filter(
        (item) => !this.archivedCustomShopItemIds.has(item.id)
      ),
      ...[...this.customShopItemCatalog.values()].filter(
        (item) => !this.archivedCustomShopItemIds.has(item.id)
      )
    ]
      .map(cloneShopItem)
      .sort(
        (left, right) =>
          left.unlockLevel - right.unlockLevel ||
          left.category.localeCompare(right.category) ||
          left.name.localeCompare(right.name)
      );
  }

  findShopItemById(
    itemId: string,
    options?: { includeArchived?: boolean }
  ): ShopItemDefinition | null {
    const defaultItem = getShopItemById(itemId);

    if (defaultItem) {
      return defaultItem;
    }

    const customItem = this.customShopItemCatalog.get(itemId) ?? null;

    if (!customItem) {
      return null;
    }

    if (!options?.includeArchived && this.archivedCustomShopItemIds.has(itemId)) {
      return null;
    }

    return customItem;
  }

  findEquipmentItemById(
    itemId: string,
    options?: { includeArchived?: boolean }
  ): EquipmentItemDefinition | null {
    const defaultItem = getEquipmentItemById(itemId);

    if (defaultItem) {
      return defaultItem;
    }

    const customItem = this.findShopItemById(itemId, options);
    return customItem?.delivery === "inventory" && customItem.equipSlot !== null
      ? customItem
      : null;
  }

  isCustomShopItem(itemId: string): boolean {
    return this.customShopItemCatalog.has(itemId);
  }

  async createShopItem(input: CreateShopItemInput): Promise<ShopItemDefinition> {
    if (this.findShopItemById(input.id)) {
      throw new BadRequestException(`Shop item "${input.id}" already exists.`);
    }

    assertPositiveInteger(input.unlockLevel, `Shop item "${input.id}" unlockLevel`);
    assertPositiveInteger(input.price, `Shop item "${input.id}" price`);

    let item: ShopItemDefinition;

    if (input.kind === "weapon") {
      if (!input.weaponCategory) {
        throw new BadRequestException(`Shop item "${input.id}" weaponCategory is required.`);
      }

      assertPositiveInteger(input.damageBonus ?? 0, `Shop item "${input.id}" damageBonus`);
      item = buildShopItemDefinition({
        id: input.id,
        name: input.name,
        type: "weapon",
        category: input.weaponCategory,
        price: input.price,
        unlockLevel: input.unlockLevel,
        damageBonus: input.damageBonus
      });
    } else if (input.kind === "drug") {
      assertPositiveInteger(input.effectAmount ?? 0, `Shop item "${input.id}" effectAmount`);
      item = buildShopItemDefinition({
        id: input.id,
        name: input.name,
        type: "consumable",
        category: "drugs",
        price: input.price,
        unlockLevel: input.unlockLevel,
        effectResource: input.effectResource ?? "energy",
        effectAmount: input.effectAmount
      });
    } else if (input.kind === "car") {
      item = buildShopItemDefinition({
        id: input.id,
        name: input.name,
        type: "vehicle",
        category: "garage",
        price: input.price,
        unlockLevel: input.unlockLevel,
        respectBonus: input.respectBonus ?? 0
      });
    } else {
      assertPositiveInteger(input.parkingSlots ?? 0, `Shop item "${input.id}" parkingSlots`);
      item = buildShopItemDefinition({
        id: input.id,
        name: input.name,
        type: "property",
        category: "realestate",
        price: input.price,
        unlockLevel: input.unlockLevel,
        respectBonus: input.respectBonus ?? 0,
        parkingSlots: input.parkingSlots
      });
    }

    await this.inventoryBalanceRepository.upsertShopItemBalance(
      this.toShopItemBalanceRecord(item, true)
    );

    this.customShopItemCatalog.set(item.id, cloneShopItem(item));
    this.archivedCustomShopItemIds.delete(item.id);
    return cloneShopItem(item);
  }

  async archiveShopItem(itemId: string): Promise<void> {
    const item = this.findShopItemById(itemId, { includeArchived: true });

    if (!item) {
      throw new NotFoundException(`Shop item "${itemId}" was not found.`);
    }

    if (this.archivedCustomShopItemIds.has(itemId)) {
      return;
    }

    this.archivedCustomShopItemIds.add(itemId);
    await this.inventoryBalanceRepository.upsertShopItemBalance(
      this.toShopItemBalanceRecord(item, this.customShopItemCatalog.has(itemId), true)
    );
  }

  async updateShopItemBalances(
    updates: readonly UpdateShopItemBalanceInput[]
  ): Promise<ShopItemDefinition[]> {
    for (const update of updates) {
      const item = this.findShopItemById(update.id);

      if (!item) {
        throw new NotFoundException(`Shop item "${update.id}" was not found.`);
      }

      const nextPrice = update.price ?? item.price;
      const nextUnlockLevel = update.unlockLevel ?? item.unlockLevel;
      const nextName = update.name?.trim() ? update.name.trim() : item.name;
      const nextRespectBonus = update.respectBonus ?? item.respectBonus ?? null;
      const nextParkingSlots = update.parkingSlots ?? item.parkingSlots ?? null;
      const nextDamageBonus = update.damageBonus ?? item.weaponStats?.damageBonus ?? null;
      const nextEffectResource =
        update.effectResource ?? (item.delivery === "instant"
          ? item.consumableEffects[0]?.resource ?? null
          : null);
      const nextEffectAmount =
        update.effectAmount ?? (item.delivery === "instant"
          ? item.consumableEffects[0]?.amount ?? null
          : null);

      assertPositiveInteger(nextPrice, `Shop item "${update.id}" price`);
      assertPositiveInteger(nextUnlockLevel, `Shop item "${update.id}" unlockLevel`);

      const nextItem = buildShopItemDefinition({
        id: item.id,
        name: nextName,
        type: item.type,
        category: item.category,
        price: nextPrice,
        unlockLevel: nextUnlockLevel,
        respectBonus: nextRespectBonus ?? undefined,
        parkingSlots: nextParkingSlots ?? undefined,
        damageBonus: nextDamageBonus ?? undefined,
        damageReduction: item.armorStats?.damageReduction ?? undefined,
        effectResource: nextEffectResource ?? undefined,
        effectAmount: nextEffectAmount ?? undefined
      });

      if (this.customShopItemCatalog.has(item.id)) {
        this.customShopItemCatalog.set(item.id, cloneShopItem(nextItem));
      } else {
        applyShopItemBalanceOverride(item.id, {
          price: nextPrice
        });
      }

      await this.inventoryBalanceRepository.upsertShopItemBalance(
        this.toShopItemBalanceRecord(
          nextItem,
          this.customShopItemCatalog.has(item.id),
          this.archivedCustomShopItemIds.has(item.id)
        )
      );
    }

    return this.listShopItemBalances();
  }

  private toShopItemBalanceRecord(
    item: ShopItemDefinition,
    isCustomItem: boolean,
    isArchived = false
  ): ShopItemBalanceRecord {
    return {
      itemId: item.id,
      name: isCustomItem ? item.name : null,
      type: isCustomItem ? item.type : null,
      category: isCustomItem ? item.category : null,
      delivery: isCustomItem ? item.delivery : null,
      equipSlot: isCustomItem ? item.equipSlot : null,
      unlockLevel: isCustomItem ? item.unlockLevel : null,
      respectBonus: isCustomItem ? item.respectBonus ?? null : null,
      parkingSlots: isCustomItem ? item.parkingSlots ?? null : null,
      damageBonus: isCustomItem ? item.weaponStats?.damageBonus ?? null : null,
      damageReduction: isCustomItem ? item.armorStats?.damageReduction ?? null : null,
      resourceEffectResource:
        isCustomItem && item.delivery === "instant"
          ? item.consumableEffects[0]?.resource ?? null
          : null,
      resourceEffectAmount:
        isCustomItem && item.delivery === "instant"
          ? item.consumableEffects[0]?.amount ?? null
          : null,
      archived: isCustomItem ? isArchived : null,
      price: item.price
    };
  }
}
