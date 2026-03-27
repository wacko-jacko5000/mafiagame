import { type AdminBalanceAuditRepository } from "./admin-balance-audit.repository";
import { CrimeBalanceService } from "../../crime/application/crime-balance.service";
import { InventoryBalanceService } from "../../inventory/application/inventory-balance.service";
import { CustodyBalanceService } from "../../custody/application/custody-balance.service";
import { TerritoryBalanceService } from "../../territory/application/territory-balance.service";
import { type AdminBalanceSectionView } from "../domain/admin-balance.types";
export declare class AdminBalanceService {
    private readonly adminBalanceAuditRepository;
    private readonly crimeBalanceService;
    private readonly territoryBalanceService;
    private readonly inventoryBalanceService;
    private readonly custodyBalanceService;
    constructor(adminBalanceAuditRepository: AdminBalanceAuditRepository, crimeBalanceService: CrimeBalanceService, territoryBalanceService: TerritoryBalanceService, inventoryBalanceService: InventoryBalanceService, custodyBalanceService: CustodyBalanceService);
    getAllSections(): Promise<AdminBalanceSectionView[]>;
    getSection(section: string): Promise<AdminBalanceSectionView>;
    updateSection(section: string, payload: unknown, changedByAccountId: string | null): Promise<AdminBalanceSectionView>;
    getAuditLog(query: {
        section?: string;
        targetId?: string;
        limit?: string;
    }): Promise<{
        id: string;
        section: "crimes" | "districts" | "shop-items" | "custody";
        targetId: string;
        changedByAccountId: string | null;
        previousValue: Record<string, string | number | null>;
        newValue: Record<string, string | number | null>;
        changedAt: string;
    }[]>;
    private parseSection;
    private parsePayload;
    private toAuditEntryView;
    private recordAuditEntries;
    private getAuditValue;
}
