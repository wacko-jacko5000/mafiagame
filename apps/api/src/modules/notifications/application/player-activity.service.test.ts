import { describe, expect, it, vi } from "vitest";

import { PlayerService } from "../../player/application/player.service";
import { PlayerActivityService } from "./player-activity.service";
import type { PlayerActivityRepository } from "./player-activity.repository";

function createPlayerServiceMock() {
  return {
    getPlayerById: vi.fn()
  } as unknown as PlayerService;
}

function createPlayerActivityRepositoryMock(): PlayerActivityRepository {
  return {
    createActivity: vi.fn(),
    listByPlayerId: vi.fn(),
    markAsRead: vi.fn()
  };
}

describe("PlayerActivityService", () => {
  it("lists activity for a player in descending order", async () => {
    const playerId = crypto.randomUUID();
    const playerService = createPlayerServiceMock();
    const repository = createPlayerActivityRepositoryMock();

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
        type: "achievement_unlocked",
        title: "Achievement unlocked",
        body: "First Crime: Complete your first crime attempt.",
        createdAt: new Date("2026-03-18T10:00:00.000Z"),
        readAt: null
      }
    ]);

    const service = new PlayerActivityService(playerService, repository);
    const activities = await service.listPlayerActivity(playerId, 10);

    expect(repository.listByPlayerId).toHaveBeenCalledWith(playerId, 10);
    expect(activities[0]?.type).toBe("achievement_unlocked");
  });

  it("marks an activity item as read", async () => {
    const playerId = crypto.randomUUID();
    const activityId = crypto.randomUUID();
    const playerService = createPlayerServiceMock();
    const repository = createPlayerActivityRepositoryMock();

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
    vi.mocked(repository.markAsRead).mockResolvedValue({
      id: activityId,
      playerId,
      type: "market_item_sold",
      title: "Item sold",
      body: "Your Rusty Knife sold for $900.",
      createdAt: new Date("2026-03-18T10:00:00.000Z"),
      readAt: new Date("2026-03-18T10:05:00.000Z")
    });

    const service = new PlayerActivityService(playerService, repository);
    const activity = await service.markActivityRead(playerId, activityId);

    expect(activity.readAt).not.toBeNull();
  });
});
