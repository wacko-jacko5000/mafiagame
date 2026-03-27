import type { AuthActor } from "../../auth/domain/auth.types";
import { AdminBalanceService } from "../application/admin-balance.service";
import type { AdminBalanceAuditResponseBody, AdminBalanceIndexResponseBody, AdminBalanceSectionResponseBody } from "./admin-balance.contracts";
export declare class AdminBalanceController {
    private readonly adminBalanceService;
    constructor(adminBalanceService: AdminBalanceService);
    getAllSections(): Promise<AdminBalanceIndexResponseBody>;
    getAuditLog(section?: string, targetId?: string, limit?: string): Promise<AdminBalanceAuditResponseBody>;
    getSection(section: string): Promise<AdminBalanceSectionResponseBody>;
    updateSection(section: string, body: unknown, actor?: AuthActor): Promise<AdminBalanceSectionResponseBody>;
}
