"use client";

import type { ReactNode } from "react";

import { CustodyOverlay } from "./custody-overlay";
import { GameShell } from "./game-shell";
import { PlayerStateProvider } from "./player-state-provider";
import { useSession } from "./session-provider";

export function ProtectedView({
  title,
  subtitle,
  children
}: Readonly<{
  title: string;
  subtitle: string;
  children: ReactNode;
}>) {
  const session = useSession();

  if (session.status === "loading") {
    return (
      <main className="neo-shell">
        <section className="panel centered-panel">
          <p className="section-label">Booting</p>
          <h1>Restoring session</h1>
        </section>
      </main>
    );
  }

  if (session.status !== "authenticated" || !session.account?.player) {
    return (
      <main className="neo-shell">
        <section className="panel centered-panel">
          <p className="section-label">Restricted</p>
          <h1>Open the home screen to log in first.</h1>
        </section>
      </main>
    );
  }

  return (
    <PlayerStateProvider>
      <GameShell subtitle={subtitle} title={title}>
        {children}
        <CustodyOverlay />
      </GameShell>
    </PlayerStateProvider>
  );
}
