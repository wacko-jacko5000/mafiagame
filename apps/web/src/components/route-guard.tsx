"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useSession } from "./providers/session-provider";

interface RouteGuardProps {
  children: React.ReactNode;
  requirePlayer?: boolean;
}

export function RouteGuard({
  children,
  requirePlayer = false
}: Readonly<RouteGuardProps>) {
  const router = useRouter();
  const session = useSession();

  useEffect(() => {
    if (session.status === "anonymous") {
      router.replace("/login");
      return;
    }

    if (
      requirePlayer &&
      session.status === "authenticated" &&
      !session.account?.player
    ) {
      router.replace("/create-player");
    }
  }, [requirePlayer, router, session.account, session.status]);

  if (session.status === "loading") {
    return (
      <main className="page-shell">
        <section className="panel">
          <p className="eyebrow">Session</p>
          <h1>Checking access</h1>
          <p className="muted">Validating the current session against the API.</p>
        </section>
      </main>
    );
  }

  if (session.status === "anonymous") {
    return null;
  }

  if (requirePlayer && !session.account?.player) {
    return null;
  }

  return <>{children}</>;
}
