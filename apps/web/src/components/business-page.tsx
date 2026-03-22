"use client";

import Link from "next/link";

import { AppShell } from "./app-shell";

export function BusinessPage() {
  return (
    <AppShell
      title="Business"
      subtitle="Reserved route for the next economy slice so sticky navigation can safely point to a valid destination today."
    >
      <section className="panel stack">
        <div>
          <p className="eyebrow">Placeholder</p>
          <h2>Businesses are not playable yet</h2>
          <p className="muted">
            This route is intentionally live so the admin-configured sticky menu never points to a broken URL.
          </p>
        </div>
        <div className="shortcut-list">
          <Link className="shortcut-card" href="/shop">
            Use the shop to spend cash on starter gear while the passive-income business slice is still pending.
          </Link>
          <Link className="shortcut-card" href="/market">
            Use the market for player-to-player trading until businesses are implemented.
          </Link>
        </div>
      </section>
    </AppShell>
  );
}
