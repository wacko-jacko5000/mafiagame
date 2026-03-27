import { PrismaService } from "../../../platform/database/prisma.service";
import type { AdminBalanceAuditRepository, BalanceAuditLogEntry, CreateBalanceAuditLogEntryInput, ListBalanceAuditLogQuery } from "../application/admin-balance-audit.repository";
export declare class PrismaAdminBalanceAuditRepository implements AdminBalanceAuditRepository {
    private readonly prismaService;
    constructor(prismaService: PrismaService);
    createEntries(entries: readonly CreateBalanceAuditLogEntryInput[]): Promise<void>;
    listEntries(query: ListBalanceAuditLogQuery): Promise<BalanceAuditLogEntry[]>;
}
