export interface BalanceAuditLogEntry {
  id: string;
  section: string;
  targetId: string;
  changedByAccountId: string | null;
  previousValue: Record<string, number | string | null>;
  newValue: Record<string, number | string | null>;
  changedAt: Date;
}

export interface CreateBalanceAuditLogEntryInput {
  section: string;
  targetId: string;
  changedByAccountId: string | null;
  previousValue: Record<string, number | string | null>;
  newValue: Record<string, number | string | null>;
}

export interface ListBalanceAuditLogQuery {
  section?: string;
  targetId?: string;
  limit: number;
}

export const ADMIN_BALANCE_AUDIT_REPOSITORY = Symbol("ADMIN_BALANCE_AUDIT_REPOSITORY");

export interface AdminBalanceAuditRepository {
  createEntries(entries: readonly CreateBalanceAuditLogEntryInput[]): Promise<void>;
  listEntries(query: ListBalanceAuditLogQuery): Promise<BalanceAuditLogEntry[]>;
}
