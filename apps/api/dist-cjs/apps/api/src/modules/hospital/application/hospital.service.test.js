"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const hospital_service_1 = require("./hospital.service");
function createPlayerServiceMock() {
    return {
        getPlayerByIdAt: vitest_1.vi.fn(),
        applyCustodyEntry: vitest_1.vi.fn(),
        buyOutCustodyStatus: vitest_1.vi.fn()
    };
}
function createCustodyBalanceServiceMock() {
    return {
        buildQuote: vitest_1.vi.fn()
    };
}
function createPlayerActivityServiceMock() {
    return {
        createActivity: vitest_1.vi.fn()
    };
}
(0, vitest_1.describe)("HospitalService", () => {
    (0, vitest_1.it)("returns an active hospital status when the release time is in the future", async () => {
        const playerId = crypto.randomUUID();
        const playerService = createPlayerServiceMock();
        vitest_1.vi.mocked(playerService.getPlayerByIdAt).mockResolvedValue({
            id: playerId,
            displayName: "Don Luca",
            cash: 2500,
            respect: 0,
            energy: 100,
            health: 100,
            jailedUntil: null,
            hospitalizedUntil: new Date("2026-03-16T20:08:00.000Z"),
            createdAt: new Date(),
            updatedAt: new Date()
        });
        const custodyBalanceService = createCustodyBalanceServiceMock();
        const playerActivityService = createPlayerActivityServiceMock();
        const service = new hospital_service_1.HospitalService(custodyBalanceService, playerActivityService, playerService);
        const status = await service.getStatus(playerId, new Date("2026-03-16T20:00:30.000Z"));
        (0, vitest_1.expect)(status).toMatchObject({
            playerId,
            active: true,
            remainingSeconds: 450
        });
    });
    (0, vitest_1.it)("applies hospitalization through the player service", async () => {
        const playerId = crypto.randomUUID();
        const playerService = createPlayerServiceMock();
        vitest_1.vi.mocked(playerService.applyCustodyEntry).mockResolvedValue({
            id: playerId,
            displayName: "Don Luca",
            cash: 2500,
            respect: 0,
            energy: 100,
            health: 100,
            jailedUntil: null,
            hospitalizedUntil: new Date("2026-03-16T20:08:00.000Z"),
            createdAt: new Date(),
            updatedAt: new Date()
        });
        const custodyBalanceService = createCustodyBalanceServiceMock();
        const playerActivityService = createPlayerActivityServiceMock();
        const service = new hospital_service_1.HospitalService(custodyBalanceService, playerActivityService, playerService);
        const now = new Date("2026-03-16T20:00:00.000Z");
        const status = await service.hospitalizePlayer(playerId, 480, null, now);
        (0, vitest_1.expect)(playerService.applyCustodyEntry).toHaveBeenCalledWith(playerId, {
            statusType: "hospital",
            until: new Date("2026-03-16T20:08:00.000Z"),
            reason: null
        });
        (0, vitest_1.expect)(status.until?.toISOString()).toBe("2026-03-16T20:08:00.000Z");
    });
    (0, vitest_1.it)("blocks crime execution while the player is hospitalized", async () => {
        const playerId = crypto.randomUUID();
        const playerService = createPlayerServiceMock();
        vitest_1.vi.mocked(playerService.getPlayerByIdAt).mockResolvedValue({
            id: playerId,
            displayName: "Don Luca",
            cash: 2500,
            respect: 0,
            energy: 100,
            health: 100,
            jailedUntil: null,
            hospitalizedUntil: new Date("2026-03-16T20:08:00.000Z"),
            createdAt: new Date(),
            updatedAt: new Date()
        });
        const custodyBalanceService = createCustodyBalanceServiceMock();
        const playerActivityService = createPlayerActivityServiceMock();
        const service = new hospital_service_1.HospitalService(custodyBalanceService, playerActivityService, playerService);
        await (0, vitest_1.expect)(service.assertCrimeExecutionAllowed(playerId, new Date("2026-03-16T20:00:30.000Z"))).rejects.toMatchObject({
            status: 409
        });
    });
});
