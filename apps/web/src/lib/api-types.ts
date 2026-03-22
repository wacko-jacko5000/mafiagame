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
  health: number;
  jailedUntil: string | null;
  hospitalizedUntil: string | null;
  createdAt: string;
  updatedAt: string;
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
  | "armor";

export interface ShopItem {
  id: string;
  name: string;
  type: "weapon" | "armor";
  category: ShopItemCategory;
  price: number;
  equipSlot: EquipmentSlot;
  unlockLevel: number;
  unlockRank: string;
  weaponStats: {
    damageBonus: number;
  } | null;
  armorStats: {
    damageReduction: number;
  } | null;
  isUnlocked: boolean;
  isLocked: boolean;
}

export interface InventoryItem {
  id: string;
  playerId: string;
  itemId: string;
  name: string;
  type: "weapon" | "armor";
  category: ShopItemCategory;
  price: number;
  equipSlot: EquipmentSlot;
  unlockLevel: number;
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

export interface PurchaseItemResult {
  playerCashAfterPurchase: number;
  ownedItem: InventoryItem;
}

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

export type AdminBalanceSectionKey = "crimes" | "districts" | "shop-items";

export type StickyMenuDestinationKey =
  | "home"
  | "crimes"
  | "missions"
  | "shop"
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
