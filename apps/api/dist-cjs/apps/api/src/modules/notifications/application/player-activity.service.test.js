"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const player_activity_service_1 = require("./player-activity.service");
function createPlayerServiceMock() {
    return {
        getPlayerById: vitest_1.vi.fn()
    };
}
function createPlayerActivityRepositoryMock() {
    return {
        createActivity: vitest_1.vi.fn(),
        listByPlayerId: vitest_1.vi.fn(),
        markAsRead: vitest_1.vi.fn()
    };
}
(0, vitest_1.describe)("PlayerActivityService", () => {
    (0, vitest_1.it)("lists activity for a player in descending order", async () => {
        const playerId = crypto.randomUUID();
        const playerService = createPlayerServiceMock();
        const repository = createPlayerActivityRepositoryMock();
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
                type: "achievement_unlocked",
                title: "Achievement unlocked",
                body: "First Crime: Complete your first crime attempt.",
                createdAt: new Date("2026-03-18T10:00:00.000Z"),
                readAt: null
            }
        ]);
        const service = new player_activity_service_1.PlayerActivityService(playerService, repository);
        const activities = await service.listPlayerActivity(playerId, 10);
        (0, vitest_1.expect)(repository.listByPlayerId).toHaveBeenCalledWith(playerId, 10);
        (0, vitest_1.expect)(activities[0]?.type).toBe("achievement_unlocked");
    });
    (0, vitest_1.it)("marks an activity item as read", async () => {
        const playerId = crypto.randomUUID();
        const activityId = crypto.randomUUID();
        const playerService = createPlayerServiceMock();
        const repository = createPlayerActivityRepositoryMock();
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
        vitest_1.vi.mocked(repository.markAsRead).mockResolvedValue({
            id: activityId,
            playerId,
            type: "market_item_sold",
            title: "Item sold",
            body: "Your Rusty Knife sold for $900.",
            createdAt: new Date("2026-03-18T10:00:00.000Z"),
            readAt: new Date("2026-03-18T10:05:00.000Z")
        });
        const service = new player_activity_service_1.PlayerActivityService(playerService, repository);
        const activity = await service.markActivityRead(playerId, activityId);
        (0, vitest_1.expect)(activity.readAt).not.toBeNull();
    });
});
