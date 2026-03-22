import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { z } from "zod";

import type { BalanceAuditLogEntry } from "./admin-balance-audit.repository";
import {
  ADMIN_BALANCE_AUDIT_REPOSITORY,
  type AdminBalanceAuditRepository
} from "./admin-balance-audit.repository";
import {
  CrimeBalanceService,
  type UpdateCrimeBalanceInput
} from "../../crime/application/crime-balance.service";
import {
  InventoryBalanceService,
  type UpdateShopItemBalanceInput
} from "../../inventory/application/inventory-balance.service";
import {
  TerritoryBalanceService,
  type UpdateDistrictBalanceInput
} from "../../territory/application/territory-balance.service";
import {
  adminBalanceSections,
  type AdminBalanceSectionKey,
  type AdminBalanceSectionView
} from "../domain/admin-balance.types";

const crimeUpdateSchema = z.object({
  crimes: z.array(
    z
      .object({
        id: z.string().min(1),
        energyCost: z.number().int().positive().optional(),
        successRate: z.number().min(0).max(1).optional(),
        cashRewardMin: z.number().int().nonnegative().optional(),
        cashRewardMax: z.number().int().nonnegative().optional(),
        respectReward: z.number().int().nonnegative().optional()
      })
      .refine(
        (value) =>
          value.energyCost !== undefined ||
          value.successRate !== undefined ||
          value.cashRewardMin !== undefined ||
          value.cashRewardMax !== undefined ||
          value.respectReward !== undefined,
        {
          message: "Each crime update must include at least one editable field."
        }
      )
  )
});

const districtUpdateSchema = z.object({
  districts: z.array(
    z
      .object({
        id: z.string().min(1),
        payoutAmount: z.number().int().positive().optional(),
        payoutCooldownMinutes: z.number().int().positive().optional()
      })
      .refine(
        (value) =>
          value.payoutAmount !== undefined ||
          value.payoutCooldownMinutes !== undefined,
        {
          message: "Each district update must include at least one editable field."
        }
      )
  )
});

const shopItemUpdateSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().min(1),
      price: z.number().int().positive()
    })
  )
});

const auditQuerySchema = z.object({
  section: z.enum(adminBalanceSections).optional(),
  targetId: z.string().min(1).optional(),
  limit: z.coerce.number().int().positive().max(100).default(20)
});

type AuditValue = Record<string, number | string | null>;

type CrimeSectionView = Extract<AdminBalanceSectionView, { section: "crimes" }>;
type DistrictSectionView = Extract<AdminBalanceSectionView, { section: "districts" }>;
type ShopItemSectionView = Extract<AdminBalanceSectionView, { section: "shop-items" }>;

function toCrimeAuditValue(entry: CrimeSectionView["entries"][number]): AuditValue {
  return {
    id: entry.id,
    name: entry.name,
    energyCost: entry.energyCost,
    successRate: entry.successRate,
    cashRewardMin: entry.cashRewardMin,
    cashRewardMax: entry.cashRewardMax,
    respectReward: entry.respectReward
  };
}

function toDistrictAuditValue(
  entry: DistrictSectionView["entries"][number]
): AuditValue {
  return {
    id: entry.id,
    name: entry.name,
    payoutAmount: entry.payoutAmount,
    payoutCooldownMinutes: entry.payoutCooldownMinutes
  };
}

function toShopItemAuditValue(
  entry: ShopItemSectionView["entries"][number]
): AuditValue {
  return {
    id: entry.id,
    name: entry.name,
    type: entry.type,
    price: entry.price,
    equipSlot: entry.equipSlot
  };
}

@Injectable()
export class AdminBalanceService {
  constructor(
    @Inject(ADMIN_BALANCE_AUDIT_REPOSITORY)
    private readonly adminBalanceAuditRepository: AdminBalanceAuditRepository,
    @Inject(CrimeBalanceService)
    private readonly crimeBalanceService: CrimeBalanceService,
    @Inject(TerritoryBalanceService)
    private readonly territoryBalanceService: TerritoryBalanceService,
    @Inject(InventoryBalanceService)
    private readonly inventoryBalanceService: InventoryBalanceService
  ) {}

  async getAllSections(): Promise<AdminBalanceSectionView[]> {
    return Promise.all(adminBalanceSections.map((section) => this.getSection(section)));
  }

  async getSection(section: string): Promise<AdminBalanceSectionView> {
    const parsedSection = this.parseSection(section);

    if (parsedSection === "crimes") {
      return {
        section: "crimes",
        label: "Crime Catalog",
        editableFields: [
          "energyCost",
          "successRate",
          "cashRewardMin",
          "cashRewardMax",
          "respectReward"
        ],
        entries: this.crimeBalanceService.listCrimeBalances().map((crime) => ({
          id: crime.id,
          name: crime.name,
          energyCost: crime.energyCost,
          successRate: crime.successRate,
          cashRewardMin: crime.minReward,
          cashRewardMax: crime.maxReward,
          respectReward: crime.respectReward
        }))
      };
    }

    if (parsedSection === "districts") {
      const districts = await this.territoryBalanceService.listDistrictBalances();

      return {
        section: "districts",
        label: "District Payouts",
        editableFields: ["payoutAmount", "payoutCooldownMinutes"],
        entries: districts.map((district) => ({
          id: district.id,
          name: district.name,
          payoutAmount: district.payoutAmount,
          payoutCooldownMinutes: district.payoutCooldownMinutes
        }))
      };
    }

    return {
      section: "shop-items",
      label: "Starter Shop Items",
      editableFields: ["price"],
      entries: this.inventoryBalanceService.listShopItemBalances().map((item) => ({
        id: item.id,
        name: item.name,
        type: item.type,
        price: item.price,
        equipSlot: item.equipSlot
      }))
    };
  }

  async updateSection(
    section: string,
    payload: unknown,
    changedByAccountId: string | null
  ): Promise<AdminBalanceSectionView> {
    const parsedSection = this.parseSection(section);

    if (parsedSection === "crimes") {
      const updates = this.parsePayload<{ crimes: UpdateCrimeBalanceInput[] }>(
        crimeUpdateSchema,
        payload
      );

      const previousSection = await this.getSection(parsedSection);
      await this.crimeBalanceService.updateCrimeBalances(updates.crimes);
      const nextSection = await this.getSection(parsedSection);
      await this.recordAuditEntries(
        parsedSection,
        updates.crimes.map((update) => update.id),
        previousSection,
        nextSection,
        changedByAccountId
      );

      return nextSection;
    }

    if (parsedSection === "districts") {
      const updates = this.parsePayload<{ districts: UpdateDistrictBalanceInput[] }>(
        districtUpdateSchema,
        payload
      );

      const previousSection = await this.getSection(parsedSection);
      await this.territoryBalanceService.updateDistrictBalances(updates.districts);
      const nextSection = await this.getSection(parsedSection);
      await this.recordAuditEntries(
        parsedSection,
        updates.districts.map((update) => update.id),
        previousSection,
        nextSection,
        changedByAccountId
      );

      return nextSection;
    }

    const updates = this.parsePayload<{ items: UpdateShopItemBalanceInput[] }>(
      shopItemUpdateSchema,
      payload
    );

    const previousSection = await this.getSection(parsedSection);
    await this.inventoryBalanceService.updateShopItemBalances(updates.items);
    const nextSection = await this.getSection(parsedSection);
    await this.recordAuditEntries(
      parsedSection,
      updates.items.map((update) => update.id),
      previousSection,
      nextSection,
      changedByAccountId
    );

    return nextSection;
  }

  async getAuditLog(query: {
    section?: string;
    targetId?: string;
    limit?: string;
  }) {
    const parsed = auditQuerySchema.safeParse(query);

    if (!parsed.success) {
      throw new BadRequestException(parsed.error.issues[0]?.message ?? "Invalid query.");
    }

    const entries = await this.adminBalanceAuditRepository.listEntries(parsed.data);

    return entries.map((entry) => this.toAuditEntryView(entry));
  }

  private parseSection(section: string): AdminBalanceSectionKey {
    if ((adminBalanceSections as readonly string[]).includes(section)) {
      return section as AdminBalanceSectionKey;
    }

    throw new NotFoundException(`Balance section "${section}" was not found.`);
  }

  private parsePayload<TSchema>(
    schema: z.ZodSchema<TSchema>,
    payload: unknown
  ): TSchema {
    const parsed = schema.safeParse(payload);

    if (!parsed.success) {
      throw new BadRequestException(parsed.error.issues[0]?.message ?? "Invalid request body.");
    }

    return parsed.data;
  }

  private toAuditEntryView(entry: BalanceAuditLogEntry) {
    return {
      id: entry.id,
      section: this.parseSection(entry.section),
      targetId: entry.targetId,
      changedByAccountId: entry.changedByAccountId,
      previousValue: entry.previousValue,
      newValue: entry.newValue,
      changedAt: entry.changedAt.toISOString()
    };
  }

  private async recordAuditEntries(
    section: AdminBalanceSectionKey,
    targetIds: readonly string[],
    previousSection: AdminBalanceSectionView,
    nextSection: AdminBalanceSectionView,
    changedByAccountId: string | null
  ): Promise<void> {
    await this.adminBalanceAuditRepository.createEntries(
      targetIds.map((targetId) => ({
        section,
        targetId,
        changedByAccountId,
        previousValue: this.getAuditValue(previousSection, targetId),
        newValue: this.getAuditValue(nextSection, targetId)
      }))
    );
  }

  private getAuditValue(
    section: AdminBalanceSectionView,
    targetId: string
  ): Record<string, number | string | null> {
    if (section.section === "crimes") {
      const entry = section.entries.find((item) => item.id === targetId);

      if (!entry) {
        throw new NotFoundException(`Balance entry "${targetId}" was not found.`);
      }

      return toCrimeAuditValue(entry);
    }

    if (section.section === "districts") {
      const entry = section.entries.find((item) => item.id === targetId);

      if (!entry) {
        throw new NotFoundException(`Balance entry "${targetId}" was not found.`);
      }

      return toDistrictAuditValue(entry);
    }

    const entry = section.entries.find((item) => item.id === targetId);

    if (!entry) {
      throw new NotFoundException(`Balance entry "${targetId}" was not found.`);
    }

    return toShopItemAuditValue(entry);
  }
}
