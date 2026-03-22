"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import type { StickyMenuConfig } from "../lib/api-types";
import { formatMoney } from "../lib/formatters";
import { gameApi } from "../lib/game-api";
import {
  defaultStickyMenuConfig,
  isStickyMenuDestinationActive,
  stickyHeaderResourceLabels,
  stickyMenuRegistry
} from "../lib/sticky-menu";
import { useSession } from "./providers/session-provider";
import { useOptionalPlayerState } from "./providers/player-state-provider";

const navigationItems = [
  { href: "/", label: "Dashboard" },
  { href: "/admin", label: "Admin" },
  { href: "/gangs", label: "Gangs" },
  { href: "/territory", label: "Territory" },
  { href: "/market", label: "Market" },
  { href: "/shop", label: "Shop" },
  { href: "/achievements", label: "Achievements" },
  { href: "/crimes", label: "Crimes" },
  { href: "/inventory", label: "Inventory" },
  { href: "/missions", label: "Missions" },
  { href: "/activity", label: "Activity" },
  { href: "/leaderboard", label: "Leaderboard" }
] as const;

export function AppShell({
  title,
  subtitle,
  mobileNavigation = true,
  children
}: Readonly<{
  title: string;
  subtitle: string;
  mobileNavigation?: boolean;
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const { account, logout } = useSession();
  const playerState = useOptionalPlayerState();
  const player = playerState?.player ?? null;
  const [stickyMenuConfig, setStickyMenuConfig] = useState<StickyMenuConfig>(
    defaultStickyMenuConfig
  );
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const visibleNavigationItems = navigationItems.filter(
    (item) => item.href !== "/admin" || account?.isAdmin
  );
  const headerResourceValues = player
    ? {
        cash: formatMoney(player.cash),
        respect: String(player.currentRespect),
        energy: String(player.energy),
        health: String(player.health),
        rank: `Lv ${player.level} ${player.rank}`
      }
    : null;

  useEffect(() => {
    if (!mobileNavigation) {
      return;
    }

    let isMounted = true;

    async function loadStickyMenu() {
      try {
        const config = await gameApi.stickyMenu.getConfig();

        if (isMounted) {
          setStickyMenuConfig(config);
        }
      } catch {
        if (isMounted) {
          setStickyMenuConfig(defaultStickyMenuConfig);
        }
      }
    }

    void loadStickyMenu();

    return () => {
      isMounted = false;
    };
  }, [mobileNavigation]);

  useEffect(() => {
    setIsMoreOpen(false);
  }, [pathname]);

  return (
    <main
      className={
        mobileNavigation ? "page-shell app-shell app-shell-mobile" : "page-shell app-shell"
      }
    >
      {mobileNavigation && stickyMenuConfig.header.enabled ? (
        <header className="mobile-game-header">
          <div className="mobile-game-header-row">
            <div>
              <p className="eyebrow">Game</p>
              <h2>{title}</h2>
            </div>
            <button
              className="button button-secondary mobile-logout-button"
              type="button"
              onClick={() => {
                logout();
                router.replace("/login");
              }}
            >
              Log out
            </button>
          </div>
          <div className="mobile-resource-strip" aria-label="Player resources">
            {stickyMenuConfig.header.resourceKeys.map((resourceKey) => (
              <div key={resourceKey} className="mobile-resource-pill">
                <span>{stickyHeaderResourceLabels[resourceKey]}</span>
                <strong>{headerResourceValues?.[resourceKey] ?? "..."}</strong>
              </div>
            ))}
          </div>
        </header>
      ) : null}

      <div className={mobileNavigation ? "desktop-shell desktop-shell-hidden-mobile" : "desktop-shell"}>
        <header className="panel app-header">
          <div>
            <p className="eyebrow">Internal Prototype</p>
            <h1>{title}</h1>
            <p className="muted">{subtitle}</p>
          </div>

          <div className="account-summary">
            <div>
              <strong>{account?.player?.displayName ?? "Unassigned player"}</strong>
              <span>{account?.email}</span>
            </div>
            <button
              className="button button-secondary"
              type="button"
              onClick={() => {
                logout();
                router.replace("/login");
              }}
            >
              Log out
            </button>
          </div>
        </header>

        <nav className="panel nav-panel" aria-label="Game navigation">
          {visibleNavigationItems.map((item) => (
            <Link
              key={item.href}
              className={pathname === item.href ? "nav-link active" : "nav-link"}
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className={mobileNavigation ? "app-content app-content-with-mobile-nav" : "app-content"}>
        {children}
      </div>

      {mobileNavigation ? (
        <>
          {isMoreOpen ? (
            <button
              aria-label="Close More menu"
              className="sticky-more-backdrop"
              type="button"
              onClick={() => setIsMoreOpen(false)}
            />
          ) : null}

          {isMoreOpen ? (
            <section className="sticky-more-sheet" aria-label="More destinations">
              <div className="split-row">
                <div>
                  <p className="eyebrow">Navigation</p>
                  <h2>More</h2>
                </div>
                <button
                  className="button button-secondary"
                  type="button"
                  onClick={() => setIsMoreOpen(false)}
                >
                  Close
                </button>
              </div>
              <div className="sticky-more-grid">
                {stickyMenuConfig.moreItems.map((key) => {
                  const item = stickyMenuRegistry[key];

                  return item.href ? (
                    <Link key={key} className="sticky-more-link" href={item.href}>
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  ) : null;
                })}
              </div>
            </section>
          ) : null}

          <nav className="mobile-bottom-nav" aria-label="Primary mobile navigation">
            {stickyMenuConfig.primaryItems.map((key) => {
              const item = stickyMenuRegistry[key];
              const isActive = isStickyMenuDestinationActive(key, pathname);

              if (key === "more") {
                return (
                  <button
                    key={key}
                    className={isMoreOpen ? "mobile-nav-link active" : "mobile-nav-link"}
                    type="button"
                    onClick={() => setIsMoreOpen((current) => !current)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                );
              }

              if (!item.href) {
                return null;
              }

              return (
                <Link
                  key={key}
                  className={isActive ? "mobile-nav-link active" : "mobile-nav-link"}
                  href={item.href}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </>
      ) : null}
    </main>
  );
}
