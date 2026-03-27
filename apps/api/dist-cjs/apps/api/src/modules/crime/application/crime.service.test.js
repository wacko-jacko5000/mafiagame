"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const crime_service_1 = require("./crime.service");
function createPlayerServiceMock() {
    return {
        getPlayerById: vitest_1.vi.fn(),
        getPlayerByIdAt: vitest_1.vi.fn(),
        applyResourceDelta: vitest_1.vi.fn()
    };
}
function createJailServiceMock() {
    return {
        getStatus: vitest_1.vi.fn(),
        jailPlayer: vitest_1.vi.fn()
    };
}
function createHospitalServiceMock() {
    return {
        getStatus: vitest_1.vi.fn(),
        hospitalizePlayer: vitest_1.vi.fn()
    };
}
function createDomainEventsServiceMock() {
    return {
        publish: vitest_1.vi.fn()
    };
}
(0, vitest_1.describe)("CrimeService", () => {
    (0, vitest_1.it)("lists the full crime progression catalog", () => {
        const service = new crime_service_1.CrimeService(createPlayerServiceMock(), createJailServiceMock(), createHospitalServiceMock(), createDomainEventsServiceMock(), () => 0.5);
        (0, vitest_1.expect)(service.listCrimes()).toHaveLength(84);
        (0, vitest_1.expect)(service.listCrimes()[0]?.id).toBe("pickpocket");
        (0, vitest_1.expect)(service.listCrimes().at(-1)?.id).toBe("ultimate-power-play");
    });
    (0, vitest_1.it)("executes a successful unlocked crime and applies rewards through the player service", async () => {
        const playerService = createPlayerServiceMock();
        const jailService = createJailServiceMock();
        const hospitalService = createHospitalServiceMock();
        vitest_1.vi.mocked(jailService.getStatus).mockResolvedValue({
            playerId: crypto.randomUUID(),
            active: false,
            until: null,
            remainingSeconds: 0
        });
        vitest_1.vi.mocked(hospitalService.getStatus).mockResolvedValue({
            playerId: crypto.randomUUID(),
            active: false,
            until: null,
            remainingSeconds: 0
        });
        vitest_1.vi.mocked(playerService.getPlayerByIdAt).mockResolvedValue({
            id: crypto.randomUUID(),
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
        vitest_1.vi.mocked(playerService.applyResourceDelta).mockResolvedValue({
            id: crypto.randomUUID(),
            displayName: "Don Luca",
            cash: 2600,
            respect: 1,
            energy: 90,
            health: 100,
            jailedUntil: null,
            hospitalizedUntil: null,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        const service = new crime_service_1.CrimeService(playerService, jailService, hospitalService, createDomainEventsServiceMock(), () => 0.3);
        const result = await service.executeCrime(crypto.randomUUID(), "pickpocket");
        (0, vitest_1.expect)(result.success).toBe(true);
        (0, vitest_1.expect)(result.cashAwarded).toBeGreaterThanOrEqual(50);
        (0, vitest_1.expect)(playerService.applyResourceDelta).toHaveBeenCalledWith(vitest_1.expect.any(String), vitest_1.expect.objectContaining({
            energy: -10,
            respect: 1
        }), vitest_1.expect.any(Date));
    });
    (0, vitest_1.it)("rejects execution for level-locked crimes", async () => {
        const playerId = crypto.randomUUID();
        const playerService = createPlayerServiceMock();
        const jailService = createJailServiceMock();
        const hospitalService = createHospitalServiceMock();
        vitest_1.vi.mocked(jailService.getStatus).mockResolvedValue({
            playerId,
            active: false,
            until: null,
            remainingSeconds: 0
        });
        vitest_1.vi.mocked(hospitalService.getStatus).mockResolvedValue({
            playerId,
            active: false,
            until: null,
            remainingSeconds: 0
        });
        vitest_1.vi.mocked(playerService.getPlayerByIdAt).mockResolvedValue({
            id: playerId,
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
        const service = new crime_service_1.CrimeService(playerService, jailService, hospitalService, createDomainEventsServiceMock(), () => 0.3);
        await (0, vitest_1.expect)(service.executeCrime(playerId, "steal-phone")).rejects.toMatchObject({
            status: 400
        });
    });
    (0, vitest_1.it)("returns a jail failure result and still consumes energy", async () => {
        const playerId = crypto.randomUUID();
        const playerService = createPlayerServiceMock();
        const jailService = createJailServiceMock();
        const hospitalService = createHospitalServiceMock();
        vitest_1.vi.mocked(jailService.getStatus).mockResolvedValue({
            playerId,
            active: false,
            until: null,
            remainingSeconds: 0
        });
        vitest_1.vi.mocked(hospitalService.getStatus).mockResolvedValue({
            playerId,
            active: false,
            until: null,
            remainingSeconds: 0
        });
        vitest_1.vi.mocked(playerService.getPlayerByIdAt).mockResolvedValue({
            id: playerId,
            displayName: "Don Luca",
            cash: 2500,
            respect: 100,
            energy: 100,
            health: 100,
            jailedUntil: null,
            hospitalizedUntil: null,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        vitest_1.vi.mocked(playerService.applyResourceDelta).mockResolvedValue({
            id: playerId,
            displayName: "Don Luca",
            cash: 2500,
            respect: 100,
            energy: 86,
            health: 100,
            jailedUntil: null,
            hospitalizedUntil: null,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        vitest_1.vi.mocked(jailService.jailPlayer).mockResolvedValue({
            playerId,
            active: true,
            until: new Date("2026-03-16T20:05:00.000Z"),
            remainingSeconds: 300
        });
        const service = new crime_service_1.CrimeService(playerService, jailService, hospitalService, createDomainEventsServiceMock(), () => 0.9);
        const result = await service.executeCrime(playerId, "shoplift-candy");
        (0, vitest_1.expect)(result).toEqual({
            crimeId: "shoplift-candy",
            success: false,
            energySpent: 14,
            cashAwarded: 0,
            respectAwarded: 0,
            consequence: {
                type: "jail",
                activeUntil: new Date("2026-03-16T20:05:00.000Z")
            }
        });
    });
    (0, vitest_1.it)("returns a hospital failure result when the crime consequence says hospital", async () => {
        const playerId = crypto.randomUUID();
        const playerService = createPlayerServiceMock();
        const jailService = createJailServiceMock();
        const hospitalService = createHospitalServiceMock();
        vitest_1.vi.mocked(jailService.getStatus).mockResolvedValue({
            playerId,
            active: false,
            until: null,
            remainingSeconds: 0
        });
        vitest_1.vi.mocked(hospitalService.getStatus).mockResolvedValue({
            playerId,
            active: false,
            until: null,
            remainingSeconds: 0
        });
        vitest_1.vi.mocked(playerService.getPlayerByIdAt).mockResolvedValue({
            id: playerId,
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
        vitest_1.vi.mocked(playerService.applyResourceDelta).mockResolvedValue({
            id: playerId,
            displayName: "Don Luca",
            cash: 2500,
            respect: 0,
            energy: 78,
            health: 100,
            jailedUntil: null,
            hospitalizedUntil: null,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        vitest_1.vi.mocked(hospitalService.hospitalizePlayer).mockResolvedValue({
            playerId,
            active: true,
            until: new Date("2026-03-16T20:08:00.000Z"),
            remainingSeconds: 900
        });
        const service = new crime_service_1.CrimeService(playerService, jailService, hospitalService, createDomainEventsServiceMock(), () => 0.9);
        const result = await service.executeCrime(playerId, "mug-civilian");
        (0, vitest_1.expect)(result.consequence).toEqual({
            type: "hospital",
            activeUntil: new Date("2026-03-16T20:08:00.000Z")
        });
    });
});
