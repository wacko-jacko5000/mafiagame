import type {
  AdminBalanceAuditEntry,
  AdminBalanceSectionView
} from "../domain/admin-balance.types";

export interface AdminBalanceIndexResponseBody {
  sections: AdminBalanceSectionView[];
}

export type AdminBalanceSectionResponseBody = AdminBalanceSectionView;

export interface AdminBalanceAuditResponseBody {
  entries: AdminBalanceAuditEntry[];
}
