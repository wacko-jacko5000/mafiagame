"use client";

import { useEffect, useState } from "react";

import type { PlayerGangMembership } from "../lib/game-api";
import { gameApi } from "../lib/game-api";
import { getErrorMessage } from "../lib/formatters";
import { useSession } from "./session-provider";

export function GangsPage() {
  const session = useSession();
  const [membership, setMembership] = useState<PlayerGangMembership | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session.account?.player) {
      return;
    }

    let isMounted = true;

    async function load() {
      try {
        const nextMembership = await gameApi.gangs.getMembershipByPlayer(session.account!.player!.id);
        if (isMounted) {
          setMembership(nextMembership);
        }
      } catch (nextError) {
        if (isMounted) {
          setError(getErrorMessage(nextError, "Unable to load gang status."));
        }
      }
    }

    void load();

    return () => {
      isMounted = false;
    };
  }, [session.account?.player]);

  return (
    <section className="panel page-panel">
      <p className="section-label">Allies</p>
      <h2>Gang status</h2>
      {error ? <p className="error-bar">{error}</p> : null}
      <div className="card-list">
        <div className="interactive-card">
          <div>
            <strong>{membership?.gang.name ?? "No gang yet"}</strong>
            <p className="muted">
              {membership
                ? `${membership.membership.role} · ${membership.gang.memberCount} members`
                : "Create or join a gang from the original frontend until this page gets expanded."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
