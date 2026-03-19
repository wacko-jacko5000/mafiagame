import type {
  AuthMeResponse,
  AuthSession,
  CrimeDefinition,
  CrimeExecutionResult,
  EquippedItems,
  InventoryItem,
  Leaderboard,
  LeaderboardDefinition,
  MissionCompletionResult,
  MissionDefinition,
  Player,
  PlayerActivity,
  PlayerMission,
  PurchaseItemResult,
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
  }
};
