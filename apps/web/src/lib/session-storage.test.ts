import { describe, expect, it } from "vitest";

import {
  ACCESS_TOKEN_STORAGE_KEY,
  clearStoredAccessToken,
  loadStoredAccessToken,
  persistAccessToken
} from "./session-storage";

function createStorageMock() {
  const values = new Map<string, string>();

  return {
    getItem(key: string) {
      return values.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      values.set(key, value);
    },
    removeItem(key: string) {
      values.delete(key);
    }
  };
}

describe("session storage", () => {
  it("persists and reloads the access token", () => {
    const storage = createStorageMock();

    persistAccessToken(storage, "token-123");

    expect(loadStoredAccessToken(storage)).toBe("token-123");
  });

  it("clears the stored access token", () => {
    const storage = createStorageMock();
    persistAccessToken(storage, "token-123");

    clearStoredAccessToken(storage);

    expect(loadStoredAccessToken(storage)).toBeNull();
    expect(ACCESS_TOKEN_STORAGE_KEY).toBe("mafia-game.access-token");
  });
});
