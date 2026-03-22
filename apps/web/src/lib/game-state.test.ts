import { describe, expect, it } from "vitest";

import type {
  CrimeDefinition,
  District,
  InventoryItem,
  MarketListing,
  MissionDefinition,
  PlayerAchievement,
  PlayerMission,
  ShopItem
} from "./api-types";
import {
  getUnlockedCrimes,
  getUnlockedMissionDefinitions,
  getUnlockedShopItems,
  getListableInventoryItems,
  getOwnMarketListings,
  summarizeAchievements,
  summarizeMissions,
  summarizeTerritory
} from "./game-state";

describe("game-state helpers", () => {
  it("summarizes achievement progress and picks the closest locked entry", () => {
    const achievements: PlayerAchievement[] = [
      {
        playerId: "player-1",
        achievementId: "a-1",
        progress: 1,
        targetProgress: 1,
        unlockedAt: "2026-03-19T12:00:00.000Z",
        definition: {
          id: "a-1",
          name: "Unlocked",
          description: "Done",
          triggerType: "test",
          targetCount: 1
        }
      },
      {
        playerId: "player-1",
        achievementId: "a-2",
        progress: 4,
        targetProgress: 5,
        unlockedAt: null,
        definition: {
          id: "a-2",
          name: "Almost there",
          description: "Soon",
          triggerType: "test",
          targetCount: 5
        }
      }
    ];

    expect(summarizeAchievements(achievements)).toMatchObject({
      unlockedCount: 1,
      inProgressCount: 1,
      nextUp: { achievementId: "a-2" }
    });
  });

  it("counts active, completed, and ready-to-complete missions", () => {
    const missions: PlayerMission[] = [
      {
        id: "pm-1",
        playerId: "player-1",
        missionId: "m-1",
        status: "active",
        progress: 3,
        targetProgress: 3,
        acceptedAt: "2026-03-19T12:00:00.000Z",
        completedAt: null,
        definition: {
          id: "m-1",
          name: "Active",
          description: "Ready",
          objectiveType: "test",
          unlockLevel: 1,
          requiredLevel: 1,
          objectiveTarget: 3,
          rewardCash: 100,
          rewardRespect: 1,
          isRepeatable: false
        }
      },
      {
        id: "pm-2",
        playerId: "player-1",
        missionId: "m-2",
        status: "completed",
        progress: 1,
        targetProgress: 1,
        acceptedAt: "2026-03-19T12:00:00.000Z",
        completedAt: "2026-03-19T12:05:00.000Z",
        definition: {
          id: "m-2",
          name: "Completed",
          description: "Done",
          objectiveType: "test",
          unlockLevel: 1,
          requiredLevel: 1,
          objectiveTarget: 1,
          rewardCash: 50,
          rewardRespect: 1,
          isRepeatable: false
        }
      }
    ];

    expect(summarizeMissions(missions)).toEqual({
      activeCount: 1,
      completedCount: 1,
      readyToCompleteCount: 1
    });
  });

  it("summarizes territory ownership and claimable payouts for a gang", () => {
    const districts: District[] = [
      {
        id: "d-1",
        name: "North",
        payout: {
          amount: 1000,
          cooldownMinutes: 60,
          lastClaimedAt: null,
          nextClaimAvailableAt: null
        },
        createdAt: "2026-03-18T00:00:00.000Z",
        controller: {
          gangId: "gang-1",
          gangName: "Night Owls",
          capturedAt: "2026-03-18T00:00:00.000Z"
        },
        activeWar: null
      },
      {
        id: "d-2",
        name: "South",
        payout: {
          amount: 1000,
          cooldownMinutes: 60,
          lastClaimedAt: "2026-03-19T00:00:00.000Z",
          nextClaimAvailableAt: "2026-03-19T01:00:00.000Z"
        },
        createdAt: "2026-03-18T00:00:00.000Z",
        controller: {
          gangId: "gang-2",
          gangName: "Rivals",
          capturedAt: "2026-03-18T00:00:00.000Z"
        },
        activeWar: {
          id: "war-1",
          districtId: "d-2",
          attackerGangId: "gang-1",
          attackerGangName: "Night Owls",
          defenderGangId: "gang-2",
          defenderGangName: "Rivals",
          startedByPlayerId: "player-1",
          status: "pending",
          createdAt: "2026-03-19T00:30:00.000Z",
          resolvedAt: null,
          winningGangId: null,
          winningGangName: null
        }
      }
    ];

    expect(summarizeTerritory(districts, "gang-1")).toEqual({
      controlledCount: 1,
      activeWarCount: 1,
      claimablePayoutCount: 1
    });
  });

  it("filters market-eligible inventory items and owned listings", () => {
    const inventory: InventoryItem[] = [
      {
        id: "i-1",
        playerId: "player-1",
        itemId: "weapon-1",
        name: "Knife",
        type: "weapon",
        category: "handguns",
        price: 100,
        equipSlot: "weapon",
        unlockLevel: 1,
        equippedSlot: null,
        marketListingId: null,
        weaponStats: {
          damageBonus: 4
        },
        armorStats: null,
        acquiredAt: "2026-03-18T00:00:00.000Z"
      },
      {
        id: "i-2",
        playerId: "player-1",
        itemId: "armor-1",
        name: "Vest",
        type: "armor",
        category: "armor",
        price: 200,
        equipSlot: "armor",
        unlockLevel: 1,
        equippedSlot: null,
        marketListingId: "listing-1",
        weaponStats: null,
        armorStats: {
          damageReduction: 3
        },
        acquiredAt: "2026-03-18T00:00:00.000Z"
      }
    ];
    const listings: MarketListing[] = [
      {
        id: "listing-1",
        inventoryItemId: "i-2",
        sellerPlayerId: "player-1",
        buyerPlayerId: null,
        itemId: "armor-1",
        itemName: "Vest",
        itemType: "armor",
        price: 300,
        status: "active",
        createdAt: "2026-03-19T00:00:00.000Z",
        soldAt: null
      }
    ];

    expect(getListableInventoryItems(inventory).map((item) => item.id)).toEqual(["i-1"]);
    expect(getOwnMarketListings(listings, "player-1").map((listing) => listing.id)).toEqual([
      "listing-1"
    ]);
  });

  it("returns only unlocked crimes, missions, and shop items for the current level", () => {
    const crimes: CrimeDefinition[] = [
      {
        id: "crime-1",
        name: "Pickpocket",
        unlockLevel: 1,
        requiredLevel: 1,
        energyCost: 10,
        successRate: 0.8,
        cashRewardMin: 100,
        cashRewardMax: 200,
        respectReward: 1,
        failureConsequence: { type: "none" }
      },
      {
        id: "crime-2",
        name: "Safe Crack",
        unlockLevel: 4,
        requiredLevel: 4,
        energyCost: 18,
        successRate: 0.55,
        cashRewardMin: 300,
        cashRewardMax: 450,
        respectReward: 4,
        failureConsequence: { type: "jail", durationSeconds: 120 }
      }
    ];
    const missions: MissionDefinition[] = [
      {
        id: "mission-1",
        name: "Complete 5 crimes",
        description: "Starter mission",
        objectiveType: "crime_count",
        unlockLevel: 1,
        requiredLevel: 1,
        objectiveTarget: 5,
        rewardCash: 500,
        rewardRespect: 10,
        isRepeatable: false
      },
      {
        id: "mission-2",
        name: "Buy your first weapon",
        description: "Weapon unlock mission",
        objectiveType: "buy_items",
        unlockLevel: 3,
        requiredLevel: 3,
        objectiveTarget: 1,
        rewardCash: 1000,
        rewardRespect: 15,
        isRepeatable: false,
        itemType: "weapon"
      }
    ];
    const shopItems: ShopItem[] = [
      {
        id: "weapon-1",
        name: "Pocket Pistol",
        type: "weapon",
        category: "handguns",
        price: 500,
        equipSlot: "weapon",
        unlockLevel: 1,
        unlockRank: "Thug",
        weaponStats: { damageBonus: 2 },
        armorStats: null,
        isUnlocked: true,
        isLocked: false
      },
      {
        id: "armor-1",
        name: "Street Vest",
        type: "armor",
        category: "armor",
        price: 1200,
        equipSlot: "armor",
        unlockLevel: 5,
        unlockRank: "Soldier",
        weaponStats: null,
        armorStats: { damageReduction: 3 },
        isUnlocked: false,
        isLocked: true
      }
    ];

    expect(getUnlockedCrimes(crimes, 2).map((crime) => crime.id)).toEqual(["crime-1"]);
    expect(getUnlockedMissionDefinitions(missions, 2).map((mission) => mission.id)).toEqual([
      "mission-1"
    ]);
    expect(getUnlockedShopItems(shopItems, 2).map((item) => item.id)).toEqual(["weapon-1"]);
  });
});
