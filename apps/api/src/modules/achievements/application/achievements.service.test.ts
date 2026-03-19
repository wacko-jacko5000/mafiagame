import { describe, expect, it, vi } from "vitest";

import { DomainEventsService } from "../../../platform/domain-events/domain-events.service";
import { PlayerService } from "../../player/application/player.service";
import { AchievementsService } from "./achievements.service";
import type { AchievementsRepository } from "./achievements.repository";

function createPlayerServiceMock() {
  return {
    getPlayerById: vi.fn()
  } as unknown as PlayerService;
}

function createDomainEventsServiceMock() {
  return {
    publish: vi.fn()
  } as unknown as DomainEventsService;
}

function createAchievementsRepositoryMock(): AchievementsRepository {
  return {
    createAchievement: vi.fn(),
    listByPlayerId: vi.fn(),
    updateProgress: vi.fn()
  };
}

describe("AchievementsService", () => {
  it("lists the starter achievement catalog", () => {
    const service = new AchievementsService(
      createPlayerServiceMock(),
      createDomainEventsServiceMock(),
      createAchievementsRepositoryMock()
    );

    expect(service.listAchievements().map((achievement) => achievement.id)).toEqual([
      "complete_first_crime",
      "buy_first_item",
      "win_first_combat",
      "claim_first_district",
      "sell_first_item"
    ]);
  });

  it("lists player achievements with explicit zero-progress defaults", async () => {
    const playerId = crypto.randomUUID();
    const playerService = createPlayerServiceMock();
    const repository = createAchievementsRepositoryMock();

    vi.mocked(playerService.getPlayerById).mockResolvedValue({
      id: playerId,
      displayName: "Boss",
      cash: 2500,
      respect: 0,
      energy: 100,
      health: 100,
      jailedUntil: null,
      hospitalizedUntil: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    vi.mocked(repository.listByPlayerId).mockResolvedValue([
      {
        id: crypto.randomUUID(),
        playerId,
        achievementId: "buy_first_item",
        progress: 1,
        targetProgress: 1,
        unlockedAt: new Date("2026-03-18T10:00:00.000Z")
      }
    ]);

    const domainEventsService = createDomainEventsServiceMock();
    const service = new AchievementsService(playerService, domainEventsService, repository);
    const result = await service.listPlayerAchievements(playerId);

    expect(result).toHaveLength(5);
    expect(result[0]).toMatchObject({
      achievementId: "complete_first_crime",
      progress: 0,
      targetProgress: 1,
      unlockedAt: null
    });
    expect(result[1]).toMatchObject({
      achievementId: "buy_first_item",
      progress: 1,
      targetProgress: 1
    });
  });

  it("creates and unlocks a new achievement when the first matching event arrives", async () => {
    const repository = createAchievementsRepositoryMock();
    vi.mocked(repository.listByPlayerId).mockResolvedValue([]);
    vi.mocked(repository.createAchievement).mockResolvedValue({
      id: crypto.randomUUID(),
      playerId: "player-1",
      achievementId: "sell_first_item",
      progress: 1,
      targetProgress: 1,
      unlockedAt: new Date("2026-03-18T10:00:00.000Z")
    });

    const domainEventsService = createDomainEventsServiceMock();
    const service = new AchievementsService(
      createPlayerServiceMock(),
      domainEventsService,
      repository
    );

    await service.recordProgress("player-1", "market_item_sold_count");

    expect(repository.createAchievement).toHaveBeenCalledWith({
      playerId: "player-1",
      achievementId: "sell_first_item",
      progress: 1,
      targetProgress: 1,
      unlockedAt: expect.any(Date)
    });
    expect(domainEventsService.publish).toHaveBeenCalledWith({
      type: "achievements.unlocked",
      occurredAt: expect.any(Date),
      playerId: "player-1",
      achievementId: "sell_first_item",
      achievementName: "First Sale",
      achievementDescription: "Sell your first item on the market."
    });
  });

  it("does not re-unlock an already unlocked achievement", async () => {
    const unlockedAt = new Date("2026-03-18T10:00:00.000Z");
    const repository = createAchievementsRepositoryMock();
    vi.mocked(repository.listByPlayerId).mockResolvedValue([
      {
        id: "achievement-row-1",
        playerId: "player-1",
        achievementId: "sell_first_item",
        progress: 1,
        targetProgress: 1,
        unlockedAt
      }
    ]);

    const domainEventsService = createDomainEventsServiceMock();
    const service = new AchievementsService(
      createPlayerServiceMock(),
      domainEventsService,
      repository
    );

    await service.recordProgress("player-1", "market_item_sold_count");

    expect(repository.updateProgress).not.toHaveBeenCalled();
    expect(repository.createAchievement).not.toHaveBeenCalled();
    expect(domainEventsService.publish).not.toHaveBeenCalled();
  });

  it("ignores non-positive progress increments", async () => {
    const repository = createAchievementsRepositoryMock();
    const service = new AchievementsService(
      createPlayerServiceMock(),
      createDomainEventsServiceMock(),
      repository
    );

    await service.recordProgress("player-1", "combat_won_count", 0);

    expect(repository.listByPlayerId).not.toHaveBeenCalled();
  });
});
