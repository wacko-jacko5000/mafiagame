import { describe, expect, it, vi } from "vitest";

import { PlayerService } from "./player.service";
import type { PlayerRepository } from "./player.repository";

function createRepositoryMock(): PlayerRepository {
  return {
    create: vi.fn(),
    applyResourceDelta: vi.fn(),
    updateCustodyStatus: vi.fn(),
    applyCustodyEntry: vi.fn(),
    buyOutCustodyStatus: vi.fn(),
    findByAccountId: vi.fn(),
    findByDisplayName: vi.fn(),
    findById: vi.fn()
  };
}

describe("PlayerService", () => {
  it("creates a player with normalized display name and defaults", async () => {
    const repository = createRepositoryMock();
    vi.mocked(repository.findByDisplayName).mockResolvedValue(null);
    vi.mocked(repository.create).mockResolvedValue({
      id: crypto.randomUUID(),
      accountId: null,
      displayName: "Don Luca",
      cash: 2500,
      respect: 0,
      energy: 100,
      health: 100,
      jailedUntil: null,
      hospitalizedUntil: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const service = new PlayerService(repository);
    const result = await service.createPlayer({ displayName: "  Don   Luca " });

    expect(repository.create).toHaveBeenCalledWith({
      accountId: undefined,
      displayName: "Don Luca",
      cash: 2500,
      respect: 0,
      energy: 100,
      health: 100
    });
    expect(result.displayName).toBe("Don Luca");
  });

  it("rejects duplicate display names", async () => {
    const repository = createRepositoryMock();
    vi.mocked(repository.findByDisplayName).mockResolvedValue({
      id: crypto.randomUUID(),
      accountId: null,
      displayName: "Don Luca",
      cash: 2500,
      respect: 0,
      energy: 100,
      health: 100,
      jailedUntil: null,
      hospitalizedUntil: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const service = new PlayerService(repository);

    await expect(
      service.createPlayer({ displayName: "Don Luca" })
    ).rejects.toMatchObject({
      status: 409
    });
  });

  it("returns only resource fields from the player aggregate", async () => {
    const playerId = crypto.randomUUID();
    const repository = createRepositoryMock();
    vi.mocked(repository.findById).mockResolvedValue({
      id: playerId,
      accountId: null,
      displayName: "Don Luca",
      cash: 2500,
      respect: 0,
      energy: 100,
      health: 100,
      jailedUntil: null,
      hospitalizedUntil: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const service = new PlayerService(repository);

    await expect(service.getPlayerResources(playerId)).resolves.toEqual({
      cash: 2500,
      respect: 0,
      energy: 100,
      health: 100
    });
  });

  it("derives player progression from respect through the player module", async () => {
    const playerId = crypto.randomUUID();
    const repository = createRepositoryMock();
    vi.mocked(repository.findById).mockResolvedValue({
      id: playerId,
      accountId: null,
      displayName: "Don Luca",
      cash: 2500,
      respect: 900,
      energy: 100,
      health: 100,
      jailedUntil: null,
      hospitalizedUntil: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const service = new PlayerService(repository);

    await expect(service.getPlayerProgression(playerId)).resolves.toEqual({
      level: 5,
      rank: "Picciotto",
      currentRespect: 900,
      currentLevelMinRespect: 900,
      nextLevel: 6,
      nextRank: "Shoplifter",
      nextLevelRespectRequired: 1500,
      respectToNextLevel: 600,
      progressPercent: 0
    });
    expect(service.getRankNameForLevel(21)).toBe("Legendary Don");
  });

  it("applies a resource delta through the player repository", async () => {
    const playerId = crypto.randomUUID();
    const repository = createRepositoryMock();
    const now = new Date("2026-03-19T19:00:00.000Z");
    vi.mocked(repository.applyResourceDelta).mockResolvedValue({
      id: playerId,
      accountId: null,
      displayName: "Don Luca",
      cash: 2800,
      respect: 1,
      energy: 85,
      health: 100,
      jailedUntil: null,
      hospitalizedUntil: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const service = new PlayerService(repository);
    const result = await service.applyResourceDelta(playerId, {
      cash: 300,
      respect: 1,
      energy: -15
    }, now);

    expect(repository.applyResourceDelta).toHaveBeenCalledWith(
      playerId,
      {
        cash: 300,
        respect: 1,
        energy: -15
      },
      now
    );
    expect(result.energy).toBe(85);
  });

  it("reads a player aggregate through the repository at a specific time", async () => {
    const playerId = crypto.randomUUID();
    const now = new Date("2026-03-19T19:05:00.000Z");
    const repository = createRepositoryMock();
    vi.mocked(repository.findById).mockResolvedValue({
      id: playerId,
      accountId: null,
      displayName: "Don Luca",
      cash: 2500,
      respect: 0,
      energy: 15,
      health: 100,
      jailedUntil: null,
      hospitalizedUntil: null,
      createdAt: new Date("2026-03-19T19:00:00.000Z"),
      updatedAt: new Date("2026-03-19T19:00:00.000Z")
    });

    const service = new PlayerService(repository);
    const player = await service.getPlayerByIdAt(playerId, now);

    expect(repository.findById).toHaveBeenCalledWith(playerId, now);
    expect(player.energy).toBe(15);
  });

  it("updates custody timestamps through the player repository", async () => {
    const playerId = crypto.randomUUID();
    const repository = createRepositoryMock();
    const jailedUntil = new Date("2026-03-16T20:05:00.000Z");
    vi.mocked(repository.updateCustodyStatus).mockResolvedValue({
      id: playerId,
      accountId: null,
      displayName: "Don Luca",
      cash: 2500,
      respect: 0,
      energy: 100,
      health: 100,
      jailedUntil,
      hospitalizedUntil: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const service = new PlayerService(repository);
    const result = await service.updateCustodyStatus(playerId, {
      jailedUntil
    });

    expect(repository.updateCustodyStatus).toHaveBeenCalledWith(playerId, {
      jailedUntil
    });
    expect(result.jailedUntil).toEqual(jailedUntil);
  });

  it("binds a created player to the authenticated account", async () => {
    const repository = createRepositoryMock();
    const accountId = crypto.randomUUID();
    vi.mocked(repository.findByDisplayName).mockResolvedValue(null);
    vi.mocked(repository.findByAccountId).mockResolvedValue(null);
    vi.mocked(repository.create).mockResolvedValue({
      id: crypto.randomUUID(),
      accountId,
      displayName: "Don Luca",
      cash: 2500,
      respect: 0,
      energy: 100,
      health: 100,
      jailedUntil: null,
      hospitalizedUntil: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const service = new PlayerService(repository);
    await service.createPlayerForAccount({ displayName: "Don Luca" }, accountId);

    expect(repository.findByAccountId).toHaveBeenCalledWith(accountId);
    expect(repository.create).toHaveBeenCalledWith({
      accountId,
      displayName: "Don Luca",
      cash: 2500,
      respect: 0,
      energy: 100,
      health: 100
    });
  });
});
