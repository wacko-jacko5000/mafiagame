import { BadRequestException, ConflictException, NotFoundException } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { SeasonsRepository } from "./seasons.repository";
import { SeasonsService } from "./seasons.service";

function createSeasonsRepositoryMock(): SeasonsRepository {
  return {
    listSeasons: vi.fn(),
    findSeasonById: vi.fn(),
    findCurrentSeason: vi.fn(),
    createSeason: vi.fn(),
    activateSeason: vi.fn(),
    deactivateSeason: vi.fn()
  };
}

describe("SeasonsService", () => {
  let repository: SeasonsRepository;
  let service: SeasonsService;

  beforeEach(() => {
    repository = createSeasonsRepositoryMock();
    service = new SeasonsService(repository);
  });

  it("creates a draft season with a normalized name", async () => {
    vi.mocked(repository.createSeason).mockResolvedValueOnce({
      id: crypto.randomUUID(),
      name: "Season One",
      status: "draft",
      startsAt: null,
      endsAt: null,
      activatedAt: null,
      deactivatedAt: null,
      createdAt: new Date("2026-03-18T00:00:00.000Z")
    });

    await service.createSeason({
      name: "  Season One  ",
      startsAt: null,
      endsAt: null
    });

    expect(repository.createSeason).toHaveBeenCalledWith({
      name: "Season One",
      startsAt: null,
      endsAt: null
    });
  });

  it("rejects invalid season windows", async () => {
    await expect(
      service.createSeason({
        name: "Season One",
        startsAt: new Date("2026-04-10T00:00:00.000Z"),
        endsAt: new Date("2026-04-01T00:00:00.000Z")
      })
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("auto-deactivates a previous active season when activating a new one", async () => {
    const seasonId = crypto.randomUUID();
    vi.mocked(repository.findSeasonById).mockResolvedValueOnce({
      id: seasonId,
      name: "Season Two",
      status: "draft",
      startsAt: null,
      endsAt: null,
      activatedAt: null,
      deactivatedAt: null,
      createdAt: new Date("2026-03-18T00:00:00.000Z")
    });
    vi.mocked(repository.activateSeason).mockResolvedValueOnce({
      id: seasonId,
      name: "Season Two",
      status: "active",
      startsAt: null,
      endsAt: null,
      activatedAt: new Date("2026-03-18T21:30:00.000Z"),
      deactivatedAt: null,
      createdAt: new Date("2026-03-18T00:00:00.000Z")
    });

    const season = await service.activateSeason(seasonId);

    expect(repository.activateSeason).toHaveBeenCalledWith(
      seasonId,
      expect.any(Date)
    );
    expect(season.status).toBe("active");
  });

  it("rejects deactivation for a season that is not active", async () => {
    const seasonId = crypto.randomUUID();
    vi.mocked(repository.findSeasonById).mockResolvedValueOnce({
      id: seasonId,
      name: "Season Three",
      status: "draft",
      startsAt: null,
      endsAt: null,
      activatedAt: null,
      deactivatedAt: null,
      createdAt: new Date("2026-03-18T00:00:00.000Z")
    });

    await expect(service.deactivateSeason(seasonId)).rejects.toBeInstanceOf(
      ConflictException
    );
  });

  it("throws when requesting a missing season", async () => {
    vi.mocked(repository.findSeasonById).mockResolvedValueOnce(null);

    await expect(service.getSeasonById(crypto.randomUUID())).rejects.toBeInstanceOf(
      NotFoundException
    );
  });
});
