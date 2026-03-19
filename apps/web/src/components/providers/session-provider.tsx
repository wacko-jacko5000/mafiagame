"use client";

import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

import type { AuthenticatedAccount } from "../../lib/api-types";
import { ApiError } from "../../lib/api-client";
import { gameApi } from "../../lib/game-api";
import {
  clearStoredAccessToken,
  loadStoredAccessToken,
  persistAccessToken
} from "../../lib/session-storage";

type SessionStatus = "loading" | "anonymous" | "authenticated";

interface SessionContextValue {
  status: SessionStatus;
  accessToken: string | null;
  account: AuthenticatedAccount | null;
  isAuthenticated: boolean;
  hasPlayer: boolean;
  login(email: string, password: string): Promise<void>;
  register(email: string, password: string): Promise<void>;
  logout(): void;
  refreshAccount(): Promise<void>;
  createPlayer(displayName: string): Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({
  children
}: Readonly<{ children: React.ReactNode }>) {
  const [status, setStatus] = useState<SessionStatus>("loading");
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [account, setAccount] = useState<AuthenticatedAccount | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      const storedToken = loadStoredAccessToken(window.localStorage);

      if (!storedToken) {
        if (!isMounted) {
          return;
        }

        setAccessToken(null);
        setAccount(null);
        setStatus("anonymous");
        return;
      }

      try {
        const response = await gameApi.auth.me(storedToken);

        if (!isMounted) {
          return;
        }

        startTransition(() => {
          setAccessToken(storedToken);
          setAccount(response.account);
          setStatus("authenticated");
        });
      } catch {
        clearStoredAccessToken(window.localStorage);

        if (!isMounted) {
          return;
        }

        setAccessToken(null);
        setAccount(null);
        setStatus("anonymous");
      }
    }

    void restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  async function establishSession(
    action: (email: string, password: string) => Promise<{
      accessToken: string;
      account: AuthenticatedAccount;
    }>,
    email: string,
    password: string
  ): Promise<void> {
    const session = await action(email, password);
    persistAccessToken(window.localStorage, session.accessToken);
    setAccessToken(session.accessToken);
    setAccount(session.account);
    setStatus("authenticated");
  }

  async function refreshAccount(): Promise<void> {
    if (!accessToken) {
      throw new ApiError("Authentication is required.", 401);
    }

    const response = await gameApi.auth.me(accessToken);
    setAccount(response.account);
    setStatus("authenticated");
  }

  async function createPlayer(displayName: string): Promise<void> {
    if (!accessToken || !account) {
      throw new ApiError("Authentication is required.", 401);
    }

    const player = await gameApi.players.create(accessToken, displayName);

    setAccount({
      ...account,
      player: {
        id: player.id,
        displayName: player.displayName
      }
    });
    setStatus("authenticated");
  }

  const value = useMemo<SessionContextValue>(
    () => ({
      status,
      accessToken,
      account,
      isAuthenticated: status === "authenticated",
      hasPlayer: Boolean(account?.player),
      login(email, password) {
        return establishSession(
          (nextEmail, nextPassword) =>
            gameApi.auth.login({ email: nextEmail, password: nextPassword }),
          email,
          password
        );
      },
      register(email, password) {
        return establishSession(
          (nextEmail, nextPassword) =>
            gameApi.auth.register({ email: nextEmail, password: nextPassword }),
          email,
          password
        );
      },
      logout() {
        clearStoredAccessToken(window.localStorage);
        setAccessToken(null);
        setAccount(null);
        setStatus("anonymous");
      },
      refreshAccount,
      createPlayer
    }),
    [accessToken, account, status]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useSession must be used within SessionProvider.");
  }

  return context;
}
