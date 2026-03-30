import { apiRequest } from "./api-client";

export interface AuthenticatedAccount {
  id: string;
  email: string;
  isAdmin: boolean;
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
  nextLevel: number | null;
  respectToNextLevel: number | null;
  progressPercent: number;
  energy: number;
  heat: number;
  health: number;
  jailedUntil: string | null;
  hospitalizedUntil: string | null;
}

export interface PlayerActivity {
  id: string;
  type: string;
  title: string;
  body: string;
  createdAt: string;
  readAt: string | null;
}

export interface CrimeDefinition {
  id: string;
  name: string;
  requiredLevel: number;
  energyCost: number;
  successRate: number;
  cashRewardMin: number;
  cashRewardMax: number;
  respectReward: number;
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

export interface CustodyBuyoutStatus {
  statusType: "jail" | "hospital";
  active: boolean;
  until: string | null;
  remainingSeconds: number;
  reason: string | null;
  currentPricePerMinute: number | null;
  minimumPrice: number | null;
  buyoutPrice: number | null;
}

export interface CustodyBuyoutResult {
  buyoutPrice: number;
  player: Player;
}

export interface MissionDefinition {
  id: string;
  name: string;
  description: string;
  requiredLevel: number;
  rewardCash: number;
  rewardRespect: number;
}

export interface PlayerMission {
  id: string;
  status: "active" | "completed";
  progress: number;
  targetProgress: number;
  definition: MissionDefinition;
}

export interface Season {
  id: string;
  name: string;
  status: "draft" | "active" | "inactive";
  startsAt: string | null;
  endsAt: string | null;
}

export interface CurrentSeasonResponse {
  season: Season | null;
}

export interface Gang {
  id: string;
  name: string;
  memberCount: number;
}

export interface GangMember {
  role: "leader" | "member";
}

export interface PlayerGangMembership {
  membership: GangMember;
  gang: Gang;
}

export interface District {
  id: string;
  name: string;
  payout: {
    amount: number;
    cooldownMinutes: number;
    nextClaimAvailableAt: string | null;
  };
  controller: {
    gangName: string;
  } | null;
  activeWar: {
    attackerGangName: string;
    defenderGangName: string;
  } | null;
}

export interface ShopItem {
  id: string;
  name: string;
  type: "weapon" | "armor" | "consumable" | "vehicle" | "property";
  category: string;
  price: number;
  unlockLevel: number;
  isUnlocked: boolean;
  respectBonus?: number | null;
  weaponStats: {
    damageBonus: number;
  } | null;
}

export interface PurchaseInventoryItemResult {
  playerCashAfterPurchase: number;
}

export interface PurchaseConsumableItemResult {
  playerCashAfterPurchase: number;
  playerEnergyAfterPurchase: number;
  playerHealthAfterPurchase: number;
}

export type PurchaseItemResult =
  | PurchaseInventoryItemResult
  | PurchaseConsumableItemResult;

export interface LeaderboardDefinition {
  id: string;
  name: string;
  description: string;
  defaultLimit: number;
}

export interface LeaderboardEntry {
  rank: number;
  displayName: string;
  metricValue: number;
}

export interface Leaderboard {
  id: string;
  name: string;
  entries: LeaderboardEntry[];
}

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
  missions: {
    listCurrent(accessToken: string) {
      return apiRequest<PlayerMission[]>("/api/me/missions", { accessToken });
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
  activity: {
    listCurrent(accessToken: string, limit = 8) {
      return apiRequest<PlayerActivity[]>(`/api/me/activity?limit=${limit}`, {
        accessToken
      });
    }
  },
  seasons: {
    listCurrent() {
      return apiRequest<CurrentSeasonResponse>("/api/seasons/current");
    }
  },
  gangs: {
    getMembershipByPlayer(playerId: string) {
      return apiRequest<PlayerGangMembership | null>(
        `/api/players/${playerId}/gang-membership`
      );
    }
  },
  territory: {
    listDistricts() {
      return apiRequest<District[]>("/api/districts");
    }
  },
  inventory: {
    listShopItems(accessToken: string) {
      return apiRequest<ShopItem[]>("/api/me/shop/items", { accessToken });
    },
    purchase(accessToken: string, itemId: string) {
      return apiRequest<PurchaseItemResult>(`/api/me/shop/${itemId}/purchase`, {
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
