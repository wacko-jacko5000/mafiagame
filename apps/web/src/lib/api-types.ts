export interface AuthenticatedAccount {
  id: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  player: {
    id: string;
    displayName: string;
  } | null;
}

export interface AuthSession {
  accessToken: string;
  account: AuthenticatedAccount;
}

export interface AuthMeResponse {
  account: AuthenticatedAccount;
}

export interface Player {
  id: string;
  displayName: string;
  cash: number;
  baseRespect: number;
  assetRespectBonus: number;
  level: number;
  rank: string;
  currentRespect: number;
  currentLevelMinRespect: number;
  nextLevel: number | null;
  nextRank: string | null;
  nextLevelRespectRequired: number | null;
  respectToNextLevel: number | null;
  progressPercent: number;
  energy: number;
  heat: number;
  heatUpdatedAt: string;
  health: number;
  parkingSlots: number;
  ownedVehicleCount: number;
  availableVehicleSlots: number;
  jailedUntil: string | null;
  hospitalizedUntil: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustodyBuyoutStatus {
  statusType: "jail" | "hospital";
  active: boolean;
  until: string | null;
  remainingSeconds: number;
  reason: string | null;
  entryCountSinceLevelReset: number;
  repeatCountSinceLevelReset: number;
  basePricePerMinute: number | null;
  currentPricePerMinute: number | null;
  escalationEnabled: boolean;
  escalationPercentage: number;
  minimumPrice: number | null;
  roundingRule: "ceil";
  buyoutPrice: number | null;
}

export interface CustodyBuyoutResult {
  buyoutPrice: number;
  player: Player;
}

export interface CrimeDefinition {
  id: string;
  name: string;
  unlockLevel: number;
  requiredLevel: number;
  energyCost: number;
  successRate: number;
  cashRewardMin: number;
  cashRewardMax: number;
  respectReward: number;
  failureConsequence: {
    type: "none" | "jail" | "hospital";
    durationSeconds?: number;
  };
}

export interface CrimeExecutionResult {
  crimeId: string;
  success: boolean;
  energySpent: number;
  cashAwarded: number;
  respectAwarded: number;
  consequence: {
    type: "none" | "jail" | "hospital";
    activeUntil: string | null;
  };
}

export type EquipmentSlot = "weapon" | "armor";
export type ShopItemCategory =
  | "handguns"
  | "smg"
  | "assault_rifle"
  | "sniper"
  | "special"
  | "armor"
  | "drugs"
  | "garage"
  | "realestate";

export interface ShopItem {
  id: string;
  name: string;
  type: "weapon" | "armor" | "consumable" | "vehicle" | "property";
  category: ShopItemCategory;
  price: number;
  delivery: "inventory" | "instant";
  equipSlot: EquipmentSlot | null;
  unlockLevel: number;
  unlockRank: string;
  respectBonus?: number | null;
  parkingSlots?: number | null;
  weaponStats: {
    damageBonus: number;
  } | null;
  armorStats: {
    damageReduction: number;
  } | null;
  consumableEffects: Array<{
    type: "resource";
    resource: "energy" | "health";
    amount: number;
  }> | null;
  isUnlocked: boolean;
  isLocked: boolean;
}

export interface InventoryItem {
  id: string;
  playerId: string;
  itemId: string;
  name: string;
  type: "weapon" | "armor" | "vehicle" | "property";
  category: ShopItemCategory;
  price: number;
  equipSlot: EquipmentSlot | null;
  unlockLevel: number;
  respectBonus?: number | null;
  parkingSlots?: number | null;
  equippedSlot: EquipmentSlot | null;
  marketListingId: string | null;
  weaponStats: {
    damageBonus: number;
  } | null;
  armorStats: {
    damageReduction: number;
  } | null;
  acquiredAt: string;
}

export interface PurchaseInventoryItemResult {
  delivery: "inventory";
  playerCashAfterPurchase: number;
  playerEnergyAfterPurchase: null;
  playerHealthAfterPurchase: null;
  ownedItem: InventoryItem;
  consumedItem: null;
}

export interface PurchaseConsumableItemResult {
  delivery: "instant";
  playerCashAfterPurchase: number;
  playerEnergyAfterPurchase: number;
  playerHealthAfterPurchase: number;
  ownedItem: null;
  consumedItem: ShopItem;
}

export type PurchaseItemResult =
  | PurchaseInventoryItemResult
  | PurchaseConsumableItemResult;

export interface EquippedItems {
  weapon: InventoryItem | null;
  armor: InventoryItem | null;
}

export interface MissionDefinition {
  id: string;
  name: string;
  description: string;
  objectiveType: string;
  unlockLevel: number;
  requiredLevel: number;
  objectiveTarget: number;
  rewardCash: number;
  rewardRespect: number;
  isRepeatable: boolean;
  itemType?: "weapon" | "armor";
}

export interface PlayerMission {
  id: string;
  playerId: string;
  missionId: string;
  status: "active" | "completed";
  progress: number;
  targetProgress: number;
  acceptedAt: string;
  completedAt: string | null;
  definition: MissionDefinition;
}

export interface MissionCompletionResult {
  mission: PlayerMission;
  rewards: {
    cash: number;
    respect: number;
  };
  playerResources: {
    cash: number;
    respect: number;
    energy: number;
    health: number;
  };
}

export interface PlayerActivity {
  id: string;
  playerId: string;
  type: string;
  title: string;
  body: string;
  createdAt: string;
  readAt: string | null;
}

export interface LeaderboardDefinition {
  id: string;
  name: string;
  description: string;
  metricKey: string;
  defaultLimit: number;
  maxLimit: number;
}

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  displayName: string;
  metricValue: number;
}

export interface Leaderboard {
  id: string;
  name: string;
  description: string;
  metricKey: string;
  defaultLimit: number;
  maxLimit: number;
  limit: number;
  entries: LeaderboardEntry[];
}

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  triggerType: string;
  targetCount: number;
}

export interface PlayerAchievement {
  playerId: string;
  achievementId: string;
  progress: number;
  targetProgress: number;
  unlockedAt: string | null;
  definition: AchievementDefinition;
}

export interface Season {
  id: string;
  name: string;
  status: "draft" | "active" | "inactive";
  startsAt: string | null;
  endsAt: string | null;
  activatedAt: string | null;
  deactivatedAt: string | null;
  createdAt: string;
}

export interface CurrentSeasonResponse {
  season: Season | null;
}

export interface Gang {
  id: string;
  name: string;
  createdAt: string;
  createdByPlayerId: string;
  memberCount: number;
}

export interface GangMember {
  id: string;
  gangId: string;
  playerId: string;
  displayName: string;
  role: "leader" | "member";
  joinedAt: string;
}

export interface GangInvite {
  id: string;
  gangId: string;
  gangName: string;
  invitedPlayerId: string;
  invitedPlayerDisplayName: string;
  invitedByPlayerId: string;
  invitedByPlayerDisplayName: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
}

export interface GangInviteDecisionResult {
  inviteId: string;
  status: "accepted" | "declined";
  membership: GangMember | null;
}

export interface PlayerGangMembership {
  membership: GangMember;
  gang: Gang;
}

export interface DistrictController {
  gangId: string;
  gangName: string;
  capturedAt: string;
}

export interface DistrictPayout {
  amount: number;
  cooldownMinutes: number;
  lastClaimedAt: string | null;
  nextClaimAvailableAt: string | null;
}

export interface DistrictWar {
  id: string;
  districtId: string;
  attackerGangId: string;
  attackerGangName: string;
  defenderGangId: string;
  defenderGangName: string;
  startedByPlayerId: string;
  status: "pending" | "resolved";
  createdAt: string;
  resolvedAt: string | null;
  winningGangId: string | null;
  winningGangName: string | null;
}

export interface District {
  id: string;
  name: string;
  payout: DistrictPayout;
  createdAt: string;
  controller: DistrictController | null;
  activeWar: DistrictWar | null;
}

export interface DistrictPayoutClaimResult {
  district: District;
  payoutAmount: number;
  claimedAt: string;
  paidToPlayerId: string;
  playerCashAfterClaim: number;
}

export interface MarketListing {
  id: string;
  inventoryItemId: string;
  sellerPlayerId: string;
  buyerPlayerId: string | null;
  itemId: string;
  itemName: string;
  itemType: string;
  price: number;
  status: "active" | "sold" | "cancelled";
  createdAt: string;
  soldAt: string | null;
}

export interface MarketPurchaseResult {
  listing: MarketListing;
  transferredInventoryItemId: string;
  sellerPlayerId: string;
  buyerPlayerId: string;
  buyerCashAfterPurchase: number;
  sellerCashAfterSale: number;
}

export type AdminBalanceSectionKey = "crimes" | "districts" | "shop-items" | "custody";

export type StickyMenuDestinationKey =
  | "home"
  | "crimes"
  | "missions"
  | "shop"
  | "shop-weapons"
  | "shop-drugs"
  | "shop-garage"
  | "shop-realestate"
  | "business"
  | "inventory"
  | "activity"
  | "achievements"
  | "gangs"
  | "territory"
  | "market"
  | "leaderboard"
  | "more";

export type StickyMenuLeafDestinationKey = Exclude<StickyMenuDestinationKey, "more">;
export type StickyHeaderResourceKey = "cash" | "respect" | "energy" | "health" | "rank";

export interface StickyMenuConfig {
  header: {
    enabled: boolean;
    resourceKeys: StickyHeaderResourceKey[];
  };
  primaryItems: StickyMenuDestinationKey[];
  shopItems: StickyMenuLeafDestinationKey[];
  moreItems: StickyMenuLeafDestinationKey[];
  availableDestinationKeys: StickyMenuDestinationKey[];
  availableHeaderResourceKeys: StickyHeaderResourceKey[];
  maxPrimaryItems: number;
}

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
  unlockLevel: number;
  difficulty: "easy" | "medium" | "hard" | "very_hard";
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
  unlockLevel: number;
  respectBonus?: number | null;
  parkingSlots?: number | null;
  damageBonus?: number | null;
  damageReduction?: number | null;
  effectResource?: "energy" | "health" | null;
  effectAmount?: number | null;
  isCustom?: boolean;
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
