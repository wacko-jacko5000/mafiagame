"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { useSession } from "./providers/session-provider";

const navigationItems = [
  { href: "/", label: "Dashboard" },
  { href: "/gangs", label: "Gangs" },
  { href: "/territory", label: "Territory" },
  { href: "/market", label: "Market" },
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
  children
}: Readonly<{
  title: string;
  subtitle: string;
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const { account, logout } = useSession();

  return (
    <main className="page-shell app-shell">
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
        {navigationItems.map((item) => (
          <Link
            key={item.href}
            className={pathname === item.href ? "nav-link active" : "nav-link"}
            href={item.href}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {children}
    </main>
  );
}
