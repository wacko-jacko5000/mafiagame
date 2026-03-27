"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const achievements_service_1 = require("./achievements.service");
function createPlayerServiceMock() {
    return {
        getPlayerById: vitest_1.vi.fn()
    };
}
function createDomainEventsServiceMock() {
    return {
        publish: vitest_1.vi.fn()
    };
}
function createAchievementsRepositoryMock() {
    return {
        createAchievement: vitest_1.vi.fn(),
        listByPlayerId: vitest_1.vi.fn(),
        updateProgress: vitest_1.vi.fn()
    };
}
(0, vitest_1.describe)("AchievementsService", () => {
    (0, vitest_1.it)("lists the starter achievement catalog", () => {
        const service = new achievements_service_1.AchievementsService(createPlayerServiceMock(), createDomainEventsServiceMock(), createAchievementsRepositoryMock());
        (0, vitest_1.expect)(service.listAchievements().map((achievement) => achievement.id)).toEqual([
            "complete_first_crime",
            "buy_first_item",
            "win_first_combat",
            "claim_first_district",
            "sell_first_item"
        ]);
    });
    (0, vitest_1.it)("lists player achievements with explicit zero-progress defaults", async () => {
        const playerId = crypto.randomUUID();
        const playerService = createPlayerServiceMock();
        const repository = createAchievementsRepositoryMock();
        vitest_1.vi.mocked(playerService.getPlayerById).mockResolvedValue({
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
        vitest_1.vi.mocked(repository.listByPlayerId).mockResolvedValue([
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
        const service = new achievements_service_1.AchievementsService(playerService, domainEventsService, repository);
        const result = await service.listPlayerAchievements(playerId);
        (0, vitest_1.expect)(result).toHaveLength(5);
        (0, vitest_1.expect)(result[0]).toMatchObject({
            achievementId: "complete_first_crime",
            progress: 0,
            targetProgress: 1,
            unlockedAt: null
        });
        (0, vitest_1.expect)(result[1]).toMatchObject({
            achievementId: "buy_first_item",
            progress: 1,
            targetProgress: 1
        });
    });
    (0, vitest_1.it)("creates and unlocks a new achievement when the first matching event arrives", async () => {
        const repository = createAchievementsRepositoryMock();
        vitest_1.vi.mocked(repository.listByPlayerId).mockResolvedValue([]);
        vitest_1.vi.mocked(repository.createAchievement).mockResolvedValue({
            id: crypto.randomUUID(),
            playerId: "player-1",
            achievementId: "sell_first_item",
            progress: 1,
            targetProgress: 1,
            unlockedAt: new Date("2026-03-18T10:00:00.000Z")
        });
        const domainEventsService = createDomainEventsServiceMock();
        const service = new achievements_service_1.AchievementsService(createPlayerServiceMock(), domainEventsService, repository);
        await service.recordProgress("player-1", "market_item_sold_count");
        (0, vitest_1.expect)(repository.createAchievement).toHaveBeenCalledWith({
            playerId: "player-1",
            achievementId: "sell_first_item",
            progress: 1,
            targetProgress: 1,
            unlockedAt: vitest_1.expect.any(Date)
        });
        (0, vitest_1.expect)(domainEventsService.publish).toHaveBeenCalledWith({
            type: "achievements.unlocked",
            occurredAt: vitest_1.expect.any(Date),
            playerId: "player-1",
            achievementId: "sell_first_item",
            achievementName: "First Sale",
            achievementDescription: "Sell your first item on the market."
        });
    });
    (0, vitest_1.it)("does not re-unlock an already unlocked achievement", async () => {
        const unlockedAt = new Date("2026-03-18T10:00:00.000Z");
        const repository = createAchievementsRepositoryMock();
        vitest_1.vi.mocked(repository.listByPlayerId).mockResolvedValue([
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
        const service = new achievements_service_1.AchievementsService(createPlayerServiceMock(), domainEventsService, repository);
        await service.recordProgress("player-1", "market_item_sold_count");
        (0, vitest_1.expect)(repository.updateProgress).not.toHaveBeenCalled();
        (0, vitest_1.expect)(repository.createAchievement).not.toHaveBeenCalled();
        (0, vitest_1.expect)(domainEventsService.publish).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)("ignores non-positive progress increments", async () => {
        const repository = createAchievementsRepositoryMock();
        const service = new achievements_service_1.AchievementsService(createPlayerServiceMock(), createDomainEventsServiceMock(), repository);
        await service.recordProgress("player-1", "combat_won_count", 0);
        (0, vitest_1.expect)(repository.listByPlayerId).not.toHaveBeenCalled();
    });
});
