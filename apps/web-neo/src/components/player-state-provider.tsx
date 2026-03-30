"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

import type { Player } from "../lib/game-api";
import { gameApi } from "../lib/game-api";
import { getErrorMessage } from "../lib/formatters";
import { useSession } from "./session-provider";

interface PlayerStateContextValue {
  player: Player | null;
  isLoading: boolean;
  error: string | null;
  refreshPlayer(): Promise<void>;
}

const PlayerStateContext = createContext<PlayerStateContextValue | null>(null);

export function PlayerStateProvider({
  children
}: Readonly<{ children: ReactNode }>) {
  const session = useSession();
  const [player, setPlayer] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refreshPlayer() {
    if (!session.account?.player?.id) {
      setPlayer(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const nextPlayer = await gameApi.players.getById(session.account.player.id);
      setPlayer(nextPlayer);
    } catch (nextError) {
      setError(getErrorMessage(nextError, "Unable to load player state."));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (session.status !== "authenticated" || !session.account?.player) {
      setPlayer(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    void refreshPlayer();
  }, [session.account?.player, session.status]);

  const value = useMemo<PlayerStateContextValue>(
    () => ({
      player,
      isLoading,
      error,
      refreshPlayer
    }),
    [error, isLoading, player]
  );

  return <PlayerStateContext.Provider value={value}>{children}</PlayerStateContext.Provider>;
}

export function usePlayerState() {
  const context = useContext(PlayerStateContext);

  if (!context) {
    throw new Error("usePlayerState must be used within PlayerStateProvider.");
  }

  return context;
}
