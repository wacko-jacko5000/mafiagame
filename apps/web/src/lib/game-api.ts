import type {
  AdminBalanceAuditEntry,
  AdminBalanceSectionKey,
  AdminBalanceSectionView,
  CurrentSeasonResponse,
  AuthMeResponse,
  AuthSession,
  CrimeDefinition,
  CrimeExecutionResult,
  CustodyBuyoutResult,
  CustodyBuyoutStatus,
  District,
  DistrictPayoutClaimResult,
  DistrictWar,
  EquippedItems,
  Gang,
  GangInvite,
  GangInviteDecisionResult,
  GangMember,
  InventoryItem,
  Leaderboard,
  LeaderboardDefinition,
  MarketListing,
  MarketPurchaseResult,
  MissionCompletionResult,
  MissionDefinition,
  Player,
  PlayerAchievement,
  PlayerActivity,
  PlayerGangMembership,
  PlayerMission,
  PurchaseItemResult,
  Season,
  StickyMenuConfig,
  ShopItem
} from "./api-types";
import { apiRequest } from "./api-client";

interface AuthCredentials {
  email: string;
  password: string;
}

interface AdminAuditQuery {
  section?: AdminBalanceSectionKey;
  targetId?: string;
  limit?: number;
}

interface CreateSeasonInput {
  name: string;
  startsAt: string | null;
  endsAt: string | null;
}

interface StickyMenuUpdateInput {
  header: {
    enabled: boolean;
    resourceKeys: StickyMenuConfig["header"]["resourceKeys"];
  };
  primaryItems: StickyMenuConfig["primaryItems"];
  moreItems: StickyMenuConfig["moreItems"];
}

interface CreateCrimeInput {
  id: string;
  name: string;
  unlockLevel: number;
  difficulty: "easy" | "medium" | "hard" | "very_hard";
  cashRewardMin: number;
  cashRewardMax: number;
  respectReward: number;
}

interface CreateShopItemInput {
  id: string;
  name: string;
  kind: "weapon" | "drug" | "car" | "house";
  weaponCategory?: "handguns" | "smg" | "assault_rifle" | "sniper" | "special";
  unlockLevel: number;
  price: number;
  respectBonus?: number;
  parkingSlots?: number;
  damageBonus?: number;
  effectResource?: "energy" | "health";
  effectAmount?: number;
}

type AdminBalanceUpdatePayload =
  | {
      section: "crimes";
      body: {
        crimes: Array<{
          id: string;
          energyCost: number;
          successRate: number;
          cashRewardMin: number;
          cashRewardMax: number;
          respectReward: number;
        }>;
      };
    }
  | {
      section: "districts";
      body: {
        districts: Array<{
          id: string;
          payoutAmount: number;
          payoutCooldownMinutes: number;
        }>;
      };
    }
  | {
      section: "shop-items";
      body: {
        items: Array<{
          id: string;
          name?: string;
          unlockLevel?: number;
          price?: number;
          respectBonus?: number | null;
          parkingSlots?: number | null;
          damageBonus?: number | null;
          effectResource?: "energy" | "health" | null;
          effectAmount?: number | null;
        }>;
      };
    }
  | {
      section: "custody";
      body: {
        entries: Array<{
          statusType: "jail" | "hospital";
          escalationEnabled?: boolean;
          escalationPercentage?: number;
          minimumPrice?: number | null;
          roundingRule?: "ceil";
          levels?: Array<{
            level: number;
            basePricePerMinute: number;
          }>;
        }>;
      };
    }
  | {
      section: "custody";
      body: {
        entries: Array<{
          statusType: "jail" | "hospital";
          escalationEnabled?: boolean;
          escalationPercentage?: number;
          minimumPrice?: number | null;
          roundingRule?: "ceil";
          levels?: Array<{
            level: number;
            basePricePerMinute: number;
          }>;
        }>;
      };
    };

export const gameApi = {
  auth: {
    register(credentials: AuthCredentials) {
      return apiRequest<AuthSession>("/api/auth/register", {
        method: "POST",
        body: credentials
      });
    },
    login(credentials: AuthCredentials) {
      return apiRequest<AuthSession>("/api/auth/login", {
        method: "POST",
        body: credentials
      });
    },
    me(accessToken: string) {
      return apiRequest<AuthMeResponse>("/api/auth/me", { accessToken });
    }
  },
  players: {
    create(accessToken: string, displayName: string) {
      return apiRequest<Player>("/api/players", {
        method: "POST",
        accessToken,
        body: { displayName }
      });
    },
    getById(playerId: string) {
      return apiRequest<Player>(`/api/players/${playerId}`);
    }
  },
  crimes: {
    list() {
      return apiRequest<CrimeDefinition[]>("/api/crimes");
    },
    execute(accessToken: string, crimeId: string) {
      return apiRequest<CrimeExecutionResult>(`/api/me/crimes/${crimeId}/execute`, {
        method: "POST",
        accessToken
      });
    }
  },
  jail: {
    getCurrentStatus(accessToken: string) {
      return apiRequest<CustodyBuyoutStatus>("/api/me/jail/status", {
        accessToken
      });
    },
    buyout(accessToken: string) {
      return apiRequest<CustodyBuyoutResult>("/api/me/jail/buyout", {
        method: "POST",
        accessToken
      });
    }
  },
  hospital: {
    getCurrentStatus(accessToken: string) {
      return apiRequest<CustodyBuyoutStatus>("/api/me/hospital/status", {
        accessToken
      });
    },
    buyout(accessToken: string) {
      return apiRequest<CustodyBuyoutResult>("/api/me/hospital/buyout", {
        method: "POST",
        accessToken
      });
    }
  },
  inventory: {
    listShopItems(accessToken: string) {
      return apiRequest<ShopItem[]>("/api/me/shop/items", { accessToken });
    },
    getCurrentInventory(accessToken: string) {
      return apiRequest<InventoryItem[]>("/api/me/inventory", { accessToken });
    },
    getCurrentEquipment(accessToken: string) {
      return apiRequest<EquippedItems>("/api/me/equipment", { accessToken });
    },
    purchase(accessToken: string, itemId: string) {
      return apiRequest<PurchaseItemResult>(`/api/me/shop/${itemId}/purchase`, {
        method: "POST",
        accessToken
      });
    },
    equip(accessToken: string, inventoryItemId: string, slot: "weapon" | "armor") {
      return apiRequest<InventoryItem>(
        `/api/me/inventory/${inventoryItemId}/equip/${slot}`,
        {
          method: "POST",
          accessToken
        }
      );
    },
    unequip(accessToken: string, slot: "weapon" | "armor") {
      return apiRequest<InventoryItem | null>(`/api/me/equipment/${slot}/unequip`, {
        method: "POST",
        accessToken
      });
    }
  },
  missions: {
    listDefinitions() {
      return apiRequest<MissionDefinition[]>("/api/missions");
    },
    listCurrent(accessToken: string) {
      return apiRequest<PlayerMission[]>("/api/me/missions", { accessToken });
    },
    accept(accessToken: string, missionId: string) {
      return apiRequest<PlayerMission>(`/api/me/missions/${missionId}/accept`, {
        method: "POST",
        accessToken
      });
    },
    complete(accessToken: string, missionId: string) {
      return apiRequest<MissionCompletionResult>(`/api/me/missions/${missionId}/complete`, {
        method: "POST",
        accessToken
      });
    }
  },
  activity: {
    listCurrent(accessToken: string, limit = 25) {
      return apiRequest<PlayerActivity[]>(`/api/me/activity?limit=${limit}`, {
        accessToken
      });
    },
    markRead(accessToken: string, activityId: string) {
      return apiRequest<PlayerActivity>(`/api/me/activity/${activityId}/read`, {
        method: "POST",
        accessToken
      });
    }
  },
  leaderboard: {
    listDefinitions() {
      return apiRequest<LeaderboardDefinition[]>("/api/leaderboards");
    },
    get(leaderboardId: string, limit?: number) {
      const query = limit ? `?limit=${limit}` : "";
      return apiRequest<Leaderboard>(`/api/leaderboards/${leaderboardId}${query}`);
    }
  },
  achievements: {
    listPlayer(playerId: string) {
      return apiRequest<PlayerAchievement[]>(`/api/players/${playerId}/achievements`);
    }
  },
  seasons: {
    listCurrent() {
      return apiRequest<CurrentSeasonResponse>("/api/seasons/current");
    },
    listAll() {
      return apiRequest<Season[]>("/api/seasons");
    }
  },
  stickyMenu: {
    getConfig() {
      return apiRequest<StickyMenuConfig>("/api/sticky-menu");
    }
  },
  gangs: {
    create(playerId: string, name: string) {
      return apiRequest<Gang>("/api/gangs", {
        method: "POST",
        body: { playerId, name }
      });
    },
    get(gangId: string) {
      return apiRequest<Gang>(`/api/gangs/${gangId}`);
    },
    getMembershipByPlayer(playerId: string) {
      return apiRequest<PlayerGangMembership | null>(
        `/api/players/${playerId}/gang-membership`
      );
    },
    listMembers(gangId: string) {
      return apiRequest<GangMember[]>(`/api/gangs/${gangId}/members`);
    },
    listGangInvites(gangId: string) {
      return apiRequest<GangInvite[]>(`/api/gangs/${gangId}/invites`);
    },
    listPlayerInvites(playerId: string) {
      return apiRequest<GangInvite[]>(`/api/players/${playerId}/gang-invites`);
    },
    invitePlayer(gangId: string, invitedPlayerId: string, invitedByPlayerId: string) {
      return apiRequest<GangInvite>(`/api/gangs/${gangId}/invite/${invitedPlayerId}`, {
        method: "POST",
        body: { invitedByPlayerId }
      });
    },
    acceptInvite(inviteId: string, playerId: string) {
      return apiRequest<GangInviteDecisionResult>(`/api/gang-invites/${inviteId}/accept`, {
        method: "POST",
        body: { playerId }
      });
    },
    declineInvite(inviteId: string, playerId: string) {
      return apiRequest<GangInviteDecisionResult>(`/api/gang-invites/${inviteId}/decline`, {
        method: "POST",
        body: { playerId }
      });
    },
    leave(gangId: string, playerId: string) {
      return apiRequest<{ gangId: string; playerId: string; role: "leader" | "member"; gangDeleted: boolean }>(
        `/api/gangs/${gangId}/leave`,
        {
          method: "POST",
          body: { playerId }
        }
      );
    }
  },
  territory: {
    listDistricts() {
      return apiRequest<District[]>("/api/districts");
    },
    claimDistrict(districtId: string, playerId: string, gangId: string) {
      return apiRequest<District>(`/api/districts/${districtId}/claim`, {
        method: "POST",
        body: { playerId, gangId }
      });
    },
    claimPayout(districtId: string, playerId: string, gangId: string) {
      return apiRequest<DistrictPayoutClaimResult>(`/api/districts/${districtId}/payout/claim`, {
        method: "POST",
        body: { playerId, gangId }
      });
    },
    startWar(districtId: string, playerId: string, attackerGangId: string) {
      return apiRequest<DistrictWar>(`/api/districts/${districtId}/war/start`, {
        method: "POST",
        body: { playerId, attackerGangId }
      });
    }
  },
  market: {
    listListings() {
      return apiRequest<MarketListing[]>("/api/market/listings");
    },
    createListing(playerId: string, inventoryItemId: string, price: number) {
      return apiRequest<MarketListing>("/api/market/listings", {
        method: "POST",
        body: { playerId, inventoryItemId, price }
      });
    },
    buyListing(listingId: string, buyerPlayerId: string) {
      return apiRequest<MarketPurchaseResult>(`/api/market/listings/${listingId}/buy`, {
        method: "POST",
        body: { buyerPlayerId }
      });
    },
    cancelListing(listingId: string, playerId: string) {
      return apiRequest<MarketListing>(`/api/market/listings/${listingId}/cancel`, {
        method: "POST",
        body: { playerId }
      });
    }
  },
  admin: {
    listBalance(accessToken: string) {
      return apiRequest<{ sections: AdminBalanceSectionView[] }>("/api/admin/balance", {
        accessToken
      });
    },
    listAudit(
      accessToken: string,
      query: AdminAuditQuery = {}
    ) {
      const searchParams = new URLSearchParams();

      if (query.section) {
        searchParams.set("section", query.section);
      }

      if (query.targetId) {
        searchParams.set("targetId", query.targetId);
      }

      if (query.limit) {
        searchParams.set("limit", String(query.limit));
      }

      const suffix = searchParams.size > 0 ? `?${searchParams.toString()}` : "";

      return apiRequest<{ entries: AdminBalanceAuditEntry[] }>(
        `/api/admin/balance/audit${suffix}`,
        {
          accessToken
        }
      );
    },
    updateBalance(
      payload: AdminBalanceUpdatePayload,
      accessToken: string
    ) {
      return apiRequest<AdminBalanceSectionView>(
        `/api/admin/balance/${payload.section}`,
        {
          method: "PATCH",
          accessToken,
          body: payload.body
        }
      );
    },
    createCrime(input: CreateCrimeInput, accessToken: string) {
      return apiRequest<AdminBalanceSectionView>("/api/admin/balance/crimes", {
        method: "POST",
        accessToken,
        body: input
      });
    },
    createShopItem(input: CreateShopItemInput, accessToken: string) {
      return apiRequest<AdminBalanceSectionView>("/api/admin/balance/shop-items", {
        method: "POST",
        accessToken,
        body: input
      });
    },
    archiveShopItem(itemId: string, accessToken: string) {
      return apiRequest<AdminBalanceSectionView>(`/api/admin/balance/shop-items/${itemId}/archive`, {
        method: "POST",
        accessToken
      });
    },
    createSeason(input: CreateSeasonInput, accessToken: string) {
      return apiRequest<Season>("/api/admin/seasons", {
        method: "POST",
        accessToken,
        body: input
      });
    },
    activateSeason(seasonId: string, accessToken: string) {
      return apiRequest<Season>(`/api/admin/seasons/${seasonId}/activate`, {
        method: "POST",
        accessToken
      });
    },
    deactivateSeason(seasonId: string, accessToken: string) {
      return apiRequest<Season>(`/api/admin/seasons/${seasonId}/deactivate`, {
        method: "POST",
        accessToken
      });
    },
    getStickyMenu(accessToken: string) {
      return apiRequest<StickyMenuConfig>("/api/admin/sticky-menu", {
        accessToken
      });
    },
    updateStickyMenu(input: StickyMenuUpdateInput, accessToken: string) {
      return apiRequest<StickyMenuConfig>("/api/admin/sticky-menu", {
        method: "PATCH",
        accessToken,
        body: input
      });
    }
  }
};
