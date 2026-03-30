const ACCESS_TOKEN_KEY = "mafia-game-neo-access-token";

export function loadStoredAccessToken(storage: Storage): string | null {
  return storage.getItem(ACCESS_TOKEN_KEY);
}

export function persistAccessToken(storage: Storage, accessToken: string): void {
  storage.setItem(ACCESS_TOKEN_KEY, accessToken);
}

export function clearStoredAccessToken(storage: Storage): void {
  storage.removeItem(ACCESS_TOKEN_KEY);
}
