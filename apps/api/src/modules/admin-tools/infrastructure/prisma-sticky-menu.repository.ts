import { Inject, Injectable } from "@nestjs/common";

import { PrismaService } from "../../../platform/database/prisma.service";
import {
  stickyMenuConfigId,
  type StickyHeaderResourceKey,
  type StickyMenuDestinationKey,
  type StickyMenuLeafDestinationKey
} from "../domain/sticky-menu.types";
import type {
  StickyMenuConfigRecord,
  StickyMenuRepository,
  UpsertStickyMenuConfigInput
} from "../application/sticky-menu.repository";

interface StickyMenuConfigRow {
  id: string;
  headerEnabled: boolean;
  headerResourceKeys: unknown;
  primaryItems: unknown;
  moreItems: unknown;
  createdAt: Date;
  updatedAt: Date;
}

interface StickyMenuConfigDelegate {
  findUnique(args: { where: { id: string } }): Promise<StickyMenuConfigRow | null>;
  upsert(args: {
    where: { id: string };
    create: {
      id: string;
      headerEnabled: boolean;
      headerResourceKeys: StickyHeaderResourceKey[];
      primaryItems: StickyMenuDestinationKey[];
      moreItems: StickyMenuLeafDestinationKey[];
    };
    update: {
      headerEnabled: boolean;
      headerResourceKeys: StickyHeaderResourceKey[];
      primaryItems: StickyMenuDestinationKey[];
      moreItems: StickyMenuLeafDestinationKey[];
    };
  }): Promise<StickyMenuConfigRow>;
}

interface StickyMenuPrismaClient {
  stickyMenuConfig: StickyMenuConfigDelegate;
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : [];
}

function toStickyMenuConfigRecord(row: StickyMenuConfigRow): StickyMenuConfigRecord {
  return {
    id: row.id,
    headerEnabled: row.headerEnabled,
    headerResourceKeys: toStringArray(row.headerResourceKeys) as StickyHeaderResourceKey[],
    primaryItems: toStringArray(row.primaryItems) as StickyMenuDestinationKey[],
    moreItems: toStringArray(row.moreItems) as StickyMenuLeafDestinationKey[],
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

@Injectable()
export class PrismaStickyMenuRepository implements StickyMenuRepository {
  constructor(
    @Inject(PrismaService)
    private readonly prismaService: PrismaService
  ) {}

  async getConfig(): Promise<StickyMenuConfigRecord | null> {
    const prismaClient = this.prismaService as unknown as StickyMenuPrismaClient;
    const row = await prismaClient.stickyMenuConfig.findUnique({
      where: {
        id: stickyMenuConfigId
      }
    });

    return row ? toStickyMenuConfigRecord(row) : null;
  }

  async upsertConfig(input: UpsertStickyMenuConfigInput): Promise<StickyMenuConfigRecord> {
    const prismaClient = this.prismaService as unknown as StickyMenuPrismaClient;
    const row = await prismaClient.stickyMenuConfig.upsert({
      where: {
        id: stickyMenuConfigId
      },
      create: {
        id: stickyMenuConfigId,
        headerEnabled: input.headerEnabled,
        headerResourceKeys: input.headerResourceKeys,
        primaryItems: input.primaryItems,
        moreItems: input.moreItems
      },
      update: {
        headerEnabled: input.headerEnabled,
        headerResourceKeys: input.headerResourceKeys,
        primaryItems: input.primaryItems,
        moreItems: input.moreItems
      }
    });

    return toStickyMenuConfigRecord(row);
  }
}
