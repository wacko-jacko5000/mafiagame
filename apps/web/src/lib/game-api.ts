import type {
  CurrentSeasonResponse,
  AuthMeResponse,
  AuthSession,
  CrimeDefinition,
  CrimeExecutionResult,
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
  ShopItem
} from "./api-types";
import { apiRequest } from "./api-client";

interface AuthCredentials {
  email: string;
  password: string;
}

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
  inventory: {
    listShopItems() {
      return apiRequest<ShopItem[]>("/api/shop/items");
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
  }
};
