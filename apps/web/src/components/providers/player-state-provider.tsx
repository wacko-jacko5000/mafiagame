"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import type { Player } from "../../lib/api-types";
import { gameApi } from "../../lib/game-api";
import { useSession } from "./session-provider";

interface PlayerStateContextValue {
  player: Player | null;
  isLoading: boolean;
  refreshPlayer(): Promise<void>;
}

const PlayerStateContext = createContext<PlayerStateContextValue | null>(null);

export function PlayerStateProvider({
  children
}: Readonly<{ children: React.ReactNode }>) {
  const { accessToken, account } = useSession();
  const playerId = account?.player?.id ?? null;
  const [player, setPlayer] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function refreshPlayer(): Promise<void> {
    if (!playerId) {
      setPlayer(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const nextPlayer = await gameApi.players.getById(playerId);
      setPlayer(nextPlayer);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!accessToken || !playerId) {
      setPlayer(null);
      setIsLoading(false);
      return;
    }

    void refreshPlayer();
  }, [accessToken, playerId]);

  const value = useMemo<PlayerStateContextValue>(
    () => ({
      player,
      isLoading,
      refreshPlayer
    }),
    [player, isLoading]
  );

  return <PlayerStateContext.Provider value={value}>{children}</PlayerStateContext.Provider>;
}

export function usePlayerState(): PlayerStateContextValue {
  const context = useContext(PlayerStateContext);

  if (!context) {
    throw new Error("usePlayerState must be used within PlayerStateProvider.");
  }

  return context;
}

export function useOptionalPlayerState(): PlayerStateContextValue | null {
  return useContext(PlayerStateContext);
}
