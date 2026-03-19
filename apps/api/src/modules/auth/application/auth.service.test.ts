import { ConflictException, UnauthorizedException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";

import { AuthService } from "./auth.service";
import type { AuthRepository } from "./auth.repository";

function createRepositoryMock(): AuthRepository {
  return {
    createAccount: vi.fn(),
    createSession: vi.fn(),
    findAccountByEmail: vi.fn(),
    findAccountById: vi.fn(),
    findAccountByActiveSessionTokenHash: vi.fn()
  };
}

describe("AuthService", () => {
  it("registers an account and creates a session", async () => {
    const repository = createRepositoryMock();
    const accountId = crypto.randomUUID();
    vi.mocked(repository.findAccountByEmail).mockResolvedValueOnce(null);
    vi.mocked(repository.createAccount).mockResolvedValueOnce({
      id: accountId,
      email: "test@example.com",
      passwordHash: "stored-hash",
      createdAt: new Date("2026-03-18T20:00:00.000Z"),
      updatedAt: new Date("2026-03-18T20:00:00.000Z"),
      player: null
    });
    vi.mocked(repository.findAccountById).mockResolvedValueOnce({
      id: accountId,
      email: "test@example.com",
      passwordHash: "stored-hash",
      createdAt: new Date("2026-03-18T20:00:00.000Z"),
      updatedAt: new Date("2026-03-18T20:00:00.000Z"),
      player: null
    });

    const service = new AuthService(repository);
    const result = await service.register({
      email: "test@example.com",
      password: "password123"
    });

    expect(result.accessToken).toHaveLength(64);
    expect(repository.createSession).toHaveBeenCalledOnce();
    expect(result.account.email).toBe("test@example.com");
  });

  it("rejects duplicate registration", async () => {
    const repository = createRepositoryMock();
    vi.mocked(repository.findAccountByEmail).mockResolvedValueOnce({
      id: crypto.randomUUID(),
      email: "test@example.com",
      passwordHash: "stored-hash",
      createdAt: new Date(),
      updatedAt: new Date(),
      player: null
    });

    const service = new AuthService(repository);

    await expect(
      service.register({
        email: "test@example.com",
        password: "password123"
      })
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("authenticates a valid session token", async () => {
    const repository = createRepositoryMock();
    const accountId = crypto.randomUUID();
    const playerId = crypto.randomUUID();
    vi.mocked(repository.findAccountByActiveSessionTokenHash).mockResolvedValueOnce({
      id: accountId,
      email: "test@example.com",
      passwordHash: "stored-hash",
      createdAt: new Date(),
      updatedAt: new Date(),
      player: {
        id: playerId,
        displayName: "Don Luca"
      }
    });

    const service = new AuthService(repository);
    const actor = await service.authenticate("token-123");

    expect(actor).toEqual({
      accountId,
      email: "test@example.com",
      playerId
    });
  });

  it("rejects invalid login credentials", async () => {
    const repository = createRepositoryMock();
    vi.mocked(repository.findAccountByEmail).mockResolvedValueOnce(null);

    const service = new AuthService(repository);

    await expect(
      service.login({
        email: "missing@example.com",
        password: "password123"
      })
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
