"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const vitest_1 = require("vitest");
const auth_service_1 = require("./auth.service");
function createRepositoryMock() {
    return {
        createAccount: vitest_1.vi.fn(),
        createSession: vitest_1.vi.fn(),
        findAccountByEmail: vitest_1.vi.fn(),
        findAccountById: vitest_1.vi.fn(),
        markAccountAsAdmin: vitest_1.vi.fn(),
        findAccountByActiveSessionTokenHash: vitest_1.vi.fn()
    };
}
(0, vitest_1.describe)("AuthService", () => {
    (0, vitest_1.it)("registers an account and creates a session", async () => {
        const repository = createRepositoryMock();
        const accountId = crypto.randomUUID();
        vitest_1.vi.mocked(repository.findAccountByEmail).mockResolvedValueOnce(null);
        vitest_1.vi.mocked(repository.createAccount).mockResolvedValueOnce({
            id: accountId,
            email: "test@example.com",
            passwordHash: "stored-hash",
            isAdmin: false,
            createdAt: new Date("2026-03-18T20:00:00.000Z"),
            updatedAt: new Date("2026-03-18T20:00:00.000Z"),
            player: null
        });
        vitest_1.vi.mocked(repository.findAccountById).mockResolvedValueOnce({
            id: accountId,
            email: "test@example.com",
            passwordHash: "stored-hash",
            isAdmin: false,
            createdAt: new Date("2026-03-18T20:00:00.000Z"),
            updatedAt: new Date("2026-03-18T20:00:00.000Z"),
            player: null
        });
        const service = new auth_service_1.AuthService(repository, {
            get: vitest_1.vi.fn().mockReturnValue(undefined)
        });
        const result = await service.register({
            email: "test@example.com",
            password: "password123"
        });
        (0, vitest_1.expect)(repository.createAccount).toHaveBeenCalledWith(vitest_1.expect.objectContaining({ isAdmin: false }));
        (0, vitest_1.expect)(result.accessToken).toHaveLength(64);
        (0, vitest_1.expect)(repository.createSession).toHaveBeenCalledOnce();
        (0, vitest_1.expect)(result.account.email).toBe("test@example.com");
    });
    (0, vitest_1.it)("rejects duplicate registration", async () => {
        const repository = createRepositoryMock();
        vitest_1.vi.mocked(repository.findAccountByEmail).mockResolvedValueOnce({
            id: crypto.randomUUID(),
            email: "test@example.com",
            passwordHash: "stored-hash",
            isAdmin: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            player: null
        });
        const service = new auth_service_1.AuthService(repository, {
            get: vitest_1.vi.fn().mockReturnValue(undefined)
        });
        await (0, vitest_1.expect)(service.register({
            email: "test@example.com",
            password: "password123"
        })).rejects.toBeInstanceOf(common_1.ConflictException);
    });
    (0, vitest_1.it)("authenticates a valid session token", async () => {
        const repository = createRepositoryMock();
        const accountId = crypto.randomUUID();
        const playerId = crypto.randomUUID();
        vitest_1.vi.mocked(repository.findAccountByActiveSessionTokenHash).mockResolvedValueOnce({
            id: accountId,
            email: "test@example.com",
            passwordHash: "stored-hash",
            isAdmin: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            player: {
                id: playerId,
                displayName: "Don Luca"
            }
        });
        const service = new auth_service_1.AuthService(repository, {
            get: vitest_1.vi.fn().mockReturnValue(undefined)
        });
        const actor = await service.authenticate("token-123");
        (0, vitest_1.expect)(actor).toEqual({
            accountId,
            email: "test@example.com",
            isAdmin: true,
            playerId
        });
    });
    (0, vitest_1.it)("rejects invalid login credentials", async () => {
        const repository = createRepositoryMock();
        vitest_1.vi.mocked(repository.findAccountByEmail).mockResolvedValueOnce(null);
        const service = new auth_service_1.AuthService(repository, {
            get: vitest_1.vi.fn().mockReturnValue(undefined)
        });
        await (0, vitest_1.expect)(service.login({
            email: "missing@example.com",
            password: "password123"
        })).rejects.toBeInstanceOf(common_1.UnauthorizedException);
    });
    (0, vitest_1.it)("bootstraps admin accounts from ADMIN_EMAILS", async () => {
        const repository = createRepositoryMock();
        const accountId = crypto.randomUUID();
        vitest_1.vi.mocked(repository.findAccountByEmail).mockResolvedValueOnce(null);
        vitest_1.vi.mocked(repository.createAccount).mockResolvedValueOnce({
            id: accountId,
            email: "boss@example.com",
            passwordHash: "stored-hash",
            isAdmin: true,
            createdAt: new Date("2026-03-18T20:00:00.000Z"),
            updatedAt: new Date("2026-03-18T20:00:00.000Z"),
            player: null
        });
        vitest_1.vi.mocked(repository.findAccountById).mockResolvedValueOnce({
            id: accountId,
            email: "boss@example.com",
            passwordHash: "stored-hash",
            isAdmin: true,
            createdAt: new Date("2026-03-18T20:00:00.000Z"),
            updatedAt: new Date("2026-03-18T20:00:00.000Z"),
            player: null
        });
        const service = new auth_service_1.AuthService(repository, {
            get: vitest_1.vi.fn().mockReturnValue("boss@example.com")
        });
        await service.register({
            email: "boss@example.com",
            password: "password123"
        });
        (0, vitest_1.expect)(repository.createAccount).toHaveBeenCalledWith(vitest_1.expect.objectContaining({ isAdmin: true }));
    });
});
