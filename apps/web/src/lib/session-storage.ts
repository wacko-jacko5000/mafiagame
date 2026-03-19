const ACCESS_TOKEN_STORAGE_KEY = "mafia-game.access-token";

export function loadStoredAccessToken(storage: Pick<Storage, "getItem">): string | null {
  return storage.getItem(ACCESS_TOKEN_STORAGE_KEY);
}

export function persistAccessToken(
  storage: Pick<Storage, "setItem">,
  accessToken: string
): void {
  storage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
}

export function clearStoredAccessToken(storage: Pick<Storage, "removeItem">): void {
  storage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
}

export { ACCESS_TOKEN_STORAGE_KEY };
