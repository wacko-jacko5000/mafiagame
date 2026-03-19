import { getRuntimeFoundationConfig } from "@mafia-game/config";

export function getApiBaseUrl(): string {
  const configuredOrigin = process.env.NEXT_PUBLIC_API_ORIGIN?.trim();

  if (configuredOrigin) {
    return configuredOrigin;
  }

  const apiPort = getRuntimeFoundationConfig().api.defaultPort;

  if (typeof window !== "undefined") {
    const { protocol, hostname } = window.location;

    return `${protocol}//${hostname}:${apiPort}`;
  }

  return `http://localhost:${apiPort}`;
}

export function getApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getApiBaseUrl()}${normalizedPath}`;
}

export function getApiHealthUrl(): string {
  const runtimeConfig = getRuntimeFoundationConfig();
  return getApiUrl(`/${runtimeConfig.api.globalPrefix}${runtimeConfig.api.healthPath}`);
}
