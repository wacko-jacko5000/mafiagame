export const adminBalanceSections = ["crimes", "districts", "shop-items"] as const;

export type AdminBalanceSectionKey = (typeof adminBalanceSections)[number];

export interface AdminBalanceAuditEntry {
  id: string;
  section: AdminBalanceSectionKey;
  targetId: string;
  changedByAccountId: string | null;
  previousValue: Record<string, number | string | null>;
  newValue: Record<string, number | string | null>;
  changedAt: string;
}

export interface CrimeBalanceEntry {
  id: string;
  name: string;
  energyCost: number;
  successRate: number;
  cashRewardMin: number;
  cashRewardMax: number;
  respectReward: number;
}

export interface DistrictBalanceEntry {
  id: string;
  name: string;
  payoutAmount: number;
  payoutCooldownMinutes: number;
}

export interface ShopItemBalanceEntry {
  id: string;
  name: string;
  type: string;
  price: number;
  equipSlot: string | null;
}

export type AdminBalanceSectionView =
  | {
      section: "crimes";
      label: "Crime Catalog";
      editableFields: readonly [
        "energyCost",
        "successRate",
        "cashRewardMin",
        "cashRewardMax",
        "respectReward"
      ];
      entries: CrimeBalanceEntry[];
    }
  | {
      section: "districts";
      label: "District Payouts";
      editableFields: readonly ["payoutAmount", "payoutCooldownMinutes"];
      entries: DistrictBalanceEntry[];
    }
  | {
      section: "shop-items";
      label: "Starter Shop Items";
      editableFields: readonly ["price"];
      entries: ShopItemBalanceEntry[];
    };
