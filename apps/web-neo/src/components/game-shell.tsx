"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useState } from "react";

import { formatMoney } from "../lib/formatters";
import { usePlayerState } from "./player-state-provider";
import { useSession } from "./session-provider";

const navItems = [
  { href: "/", label: "Home", short: "Home" },
  { href: "/crimes", label: "Crimes", short: "Crimes" },
  { href: "/missions", label: "Missions", short: "Jobs" },
  { href: "/shop", label: "Shop", short: "Shop" },
  { href: "/more", label: "More", short: "More" }
] as const;

const moreItems = [
  { href: "/activity", label: "Activity" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/territory", label: "Territory" },
  { href: "/gangs", label: "Gangs" }
] as const;

export function GameShell({
  title,
  subtitle,
  children
}: Readonly<{
  title: string;
  subtitle: string;
  children: ReactNode;
}>) {
  const pathname = usePathname();
  const session = useSession();
  const { player } = usePlayerState();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const resourceCards = [
    { label: "Respect", shortLabel: "RP", accent: "is-respect", value: player ? String(player.currentRespect) : "..." },
    { label: "Energy", shortLabel: "EN", accent: "is-energy", value: player ? String(player.energy) : "..." },
    { label: "Health", shortLabel: "HP", accent: "is-health", value: player ? String(player.health) : "..." }
  ];

  return (
    <main className="neo-shell shell-shell">
      <div className="ambient ambient-left" />
      <div className="ambient ambient-right" />
      <div className="grid-lines" />

      <header className="mobile-topbar panel">
        <div>
          <p className="section-label">Neon Frontend</p>
          <div className="mobile-title-row">
            <h2>{title}</h2>
            <div className="mobile-cash-pill">
              <span>Cash</span>
              <strong>{player ? formatMoney(player.cash) : "..."}</strong>
            </div>
          </div>
        </div>
        <div className="resource-strip">
          {resourceCards.map((resource) => (
            <div className={`resource-pill ${resource.accent}`} key={resource.label}>
              <span>{resource.shortLabel}</span>
              <strong>{resource.value}</strong>
            </div>
          ))}
        </div>
      </header>

      <div className="desktop-shell">
        <header className="panel shell-header">
          <div>
            <p className="kicker">Separate Frontend</p>
            <h1 className="shell-title">{title}</h1>
            <p className="hero-text">{subtitle}</p>
          </div>
          <div className="shell-account">
            <div>
              <strong>{session.account?.player?.displayName ?? "No player"}</strong>
              <p className="muted">{session.account?.email}</p>
            </div>
            <button className="ghost-button" onClick={() => session.logout()} type="button">
              Disconnect
            </button>
          </div>
        </header>

        <nav className="panel desktop-nav">
          {navItems
            .filter((item) => item.href !== "/more")
            .map((item) => (
              <Link
                key={item.href}
                className={isActive(pathname, item.href) ? "nav-link is-active" : "nav-link"}
                href={item.href}
              >
                {item.label}
              </Link>
            ))}
          {moreItems.map((item) => (
            <Link
              key={item.href}
              className={isActive(pathname, item.href) ? "nav-link is-active" : "nav-link"}
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <section className="game-content">{children}</section>

      {isMoreOpen ? (
        <>
          <button
            aria-label="Close more menu"
            className="sticky-more-backdrop"
            onClick={() => setIsMoreOpen(false)}
            type="button"
          />
          <section className="sticky-more-sheet panel">
            <div className="sheet-header">
              <div>
                <p className="section-label">Navigation</p>
                <h2>More</h2>
              </div>
              <button className="ghost-button" onClick={() => setIsMoreOpen(false)} type="button">
                Close
              </button>
            </div>
            <div className="sheet-grid">
              {moreItems.map((item) => (
                <Link
                  key={item.href}
                  className="sheet-link"
                  href={item.href}
                  onClick={() => setIsMoreOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </section>
        </>
      ) : null}

      <nav className="mobile-bottom-nav">
        {navItems.map((item) =>
          item.href === "/more" ? (
            <button
              key={item.href}
              className={isMoreOpen ? "mobile-nav-link active" : "mobile-nav-link"}
              onClick={() => setIsMoreOpen((current) => !current)}
              type="button"
            >
              <span>{item.short}</span>
            </button>
          ) : (
            <Link
              key={item.href}
              className={isActive(pathname, item.href) ? "mobile-nav-link active" : "mobile-nav-link"}
              href={item.href}
            >
              <span>{item.short}</span>
            </Link>
          )
        )}
      </nav>
    </main>
  );
}

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
