import { Inject, Injectable } from "@nestjs/common";

import { PrismaService } from "../../../platform/database/prisma.service";
import type {
  AdminBalanceAuditRepository,
  BalanceAuditLogEntry,
  CreateBalanceAuditLogEntryInput,
  ListBalanceAuditLogQuery
} from "../application/admin-balance-audit.repository";

interface BalanceChangeLogRecord {
  id: string;
  section: string;
  targetId: string;
  changedByAccountId: string | null;
  previousValue: Record<string, number | string | null>;
  newValue: Record<string, number | string | null>;
  changedAt: Date;
}

interface PrismaAdminBalanceAuditClient {
  balanceChangeLog: {
    createMany(args: {
      data: CreateBalanceAuditLogEntryInput[];
    }): Promise<{ count: number }>;
    findMany(args: {
      where: {
        section?: string;
        targetId?: string;
      };
      orderBy: { changedAt: "asc" | "desc" };
      take: number;
    }): Promise<BalanceChangeLogRecord[]>;
  };
}

function toBalanceAuditLogEntry(record: BalanceChangeLogRecord): BalanceAuditLogEntry {
  return {
    id: record.id,
    section: record.section,
    targetId: record.targetId,
    changedByAccountId: record.changedByAccountId,
    previousValue: record.previousValue,
    newValue: record.newValue,
    changedAt: record.changedAt
  };
}

@Injectable()
export class PrismaAdminBalanceAuditRepository implements AdminBalanceAuditRepository {
  constructor(
    @Inject(PrismaService)
    private readonly prismaService: PrismaService
  ) {}

  async createEntries(
    entries: readonly CreateBalanceAuditLogEntryInput[]
  ): Promise<void> {
    if (entries.length === 0) {
      return;
    }

    const prismaClient = this.prismaService as unknown as PrismaAdminBalanceAuditClient;

    await prismaClient.balanceChangeLog.createMany({
      data: [...entries]
    });
  }

  async listEntries(query: ListBalanceAuditLogQuery): Promise<BalanceAuditLogEntry[]> {
    const prismaClient = this.prismaService as unknown as PrismaAdminBalanceAuditClient;

    return prismaClient.balanceChangeLog
      .findMany({
        where: {
          section: query.section,
          targetId: query.targetId
        },
        orderBy: {
          changedAt: "desc"
        },
        take: query.limit
      })
      .then((records) => records.map(toBalanceAuditLogEntry));
  }
}
