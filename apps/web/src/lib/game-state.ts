import type {
  District,
  InventoryItem,
  MarketListing,
  PlayerAchievement,
  PlayerMission
} from "./api-types";

export function summarizeAchievements(achievements: PlayerAchievement[]) {
  const unlocked = achievements.filter((achievement) => achievement.unlockedAt !== null);
  const inProgress = achievements
    .filter((achievement) => achievement.unlockedAt === null && achievement.progress > 0)
    .sort((left, right) => {
      const leftRatio = left.progress / Math.max(left.targetProgress, 1);
      const rightRatio = right.progress / Math.max(right.targetProgress, 1);
      return rightRatio - leftRatio;
    });

  return {
    unlockedCount: unlocked.length,
    inProgressCount: inProgress.length,
    nextUp: inProgress[0] ?? null
  };
}

export function summarizeMissions(missions: PlayerMission[]) {
  const active = missions.filter((mission) => mission.status === "active");
  const completed = missions.filter((mission) => mission.status === "completed");
  const readyToComplete = active.filter(
    (mission) => mission.progress >= mission.targetProgress
  );

  return {
    activeCount: active.length,
    completedCount: completed.length,
    readyToCompleteCount: readyToComplete.length
  };
}

export function summarizeTerritory(districts: District[], gangId: string | null) {
  const activeWarCount = districts.filter((district) => district.activeWar !== null).length;

  if (!gangId) {
    return {
      controlledCount: 0,
      activeWarCount,
      claimablePayoutCount: 0
    };
  }

  const controlled = districts.filter((district) => district.controller?.gangId === gangId);
  const claimablePayoutCount = controlled.filter(
    (district) => district.payout.nextClaimAvailableAt === null
  ).length;

  return {
    controlledCount: controlled.length,
    activeWarCount,
    claimablePayoutCount
  };
}

export function getListableInventoryItems(inventory: InventoryItem[]) {
  return inventory.filter((item) => item.marketListingId === null);
}

export function getOwnMarketListings(listings: MarketListing[], playerId: string) {
  return listings.filter((listing) => listing.sellerPlayerId === playerId);
}
