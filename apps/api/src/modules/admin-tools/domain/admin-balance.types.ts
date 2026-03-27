export const adminBalanceSections = ["crimes", "districts", "shop-items", "custody"] as const;

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
  category: string;
  delivery: "inventory" | "instant";
  price: number;
  equipSlot: string | null;
  consumableEffects: Array<{
    type: "resource";
    resource: "energy" | "health";
    amount: number;
  }> | null;
}

export interface CustodyBuyoutLevelBalanceEntry {
  level: number;
  rank: string;
  basePricePerMinute: number;
}

export interface CustodyBalanceEntry {
  id: "jail" | "hospital";
  name: string;
  escalationEnabled: boolean;
  escalationPercentage: number;
  minimumPrice: number | null;
  roundingRule: "ceil";
  levels: CustodyBuyoutLevelBalanceEntry[];
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
    }
  | {
      section: "custody";
      label: "Custody Buyouts";
      editableFields: readonly [
        "basePricePerMinute",
        "escalationEnabled",
        "escalationPercentage",
        "minimumPrice",
        "roundingRule"
      ];
      entries: CustodyBalanceEntry[];
    };
