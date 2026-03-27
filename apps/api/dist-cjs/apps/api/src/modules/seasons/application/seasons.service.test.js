"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const vitest_1 = require("vitest");
const seasons_service_1 = require("./seasons.service");
function createSeasonsRepositoryMock() {
    return {
        listSeasons: vitest_1.vi.fn(),
        findSeasonById: vitest_1.vi.fn(),
        findCurrentSeason: vitest_1.vi.fn(),
        createSeason: vitest_1.vi.fn(),
        activateSeason: vitest_1.vi.fn(),
        deactivateSeason: vitest_1.vi.fn()
    };
}
(0, vitest_1.describe)("SeasonsService", () => {
    let repository;
    let service;
    (0, vitest_1.beforeEach)(() => {
        repository = createSeasonsRepositoryMock();
        service = new seasons_service_1.SeasonsService(repository);
    });
    (0, vitest_1.it)("creates a draft season with a normalized name", async () => {
        vitest_1.vi.mocked(repository.createSeason).mockResolvedValueOnce({
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
        (0, vitest_1.expect)(repository.createSeason).toHaveBeenCalledWith({
            name: "Season One",
            startsAt: null,
            endsAt: null
        });
    });
    (0, vitest_1.it)("rejects invalid season windows", async () => {
        await (0, vitest_1.expect)(service.createSeason({
            name: "Season One",
            startsAt: new Date("2026-04-10T00:00:00.000Z"),
            endsAt: new Date("2026-04-01T00:00:00.000Z")
        })).rejects.toBeInstanceOf(common_1.BadRequestException);
    });
    (0, vitest_1.it)("auto-deactivates a previous active season when activating a new one", async () => {
        const seasonId = crypto.randomUUID();
        vitest_1.vi.mocked(repository.findSeasonById).mockResolvedValueOnce({
            id: seasonId,
            name: "Season Two",
            status: "draft",
            startsAt: null,
            endsAt: null,
            activatedAt: null,
            deactivatedAt: null,
            createdAt: new Date("2026-03-18T00:00:00.000Z")
        });
        vitest_1.vi.mocked(repository.activateSeason).mockResolvedValueOnce({
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
        (0, vitest_1.expect)(repository.activateSeason).toHaveBeenCalledWith(seasonId, vitest_1.expect.any(Date));
        (0, vitest_1.expect)(season.status).toBe("active");
    });
    (0, vitest_1.it)("rejects deactivation for a season that is not active", async () => {
        const seasonId = crypto.randomUUID();
        vitest_1.vi.mocked(repository.findSeasonById).mockResolvedValueOnce({
            id: seasonId,
            name: "Season Three",
            status: "draft",
            startsAt: null,
            endsAt: null,
            activatedAt: null,
            deactivatedAt: null,
            createdAt: new Date("2026-03-18T00:00:00.000Z")
        });
        await (0, vitest_1.expect)(service.deactivateSeason(seasonId)).rejects.toBeInstanceOf(common_1.ConflictException);
    });
    (0, vitest_1.it)("throws when requesting a missing season", async () => {
        vitest_1.vi.mocked(repository.findSeasonById).mockResolvedValueOnce(null);
        await (0, vitest_1.expect)(service.getSeasonById(crypto.randomUUID())).rejects.toBeInstanceOf(common_1.NotFoundException);
    });
});
