"use client";

import { useEffect, useState } from "react";

import type { PlayerMission } from "../lib/game-api";
import { gameApi } from "../lib/game-api";
import { formatMoney, getErrorMessage } from "../lib/formatters";
import { useSession } from "./session-provider";

export function MissionsPage() {
  const session = useSession();
  const [missions, setMissions] = useState<PlayerMission[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session.accessToken) {
      return;
    }

    let isMounted = true;

    async function load() {
      try {
        const nextMissions = await gameApi.missions.listCurrent(session.accessToken!);
        if (isMounted) {
          setMissions(nextMissions);
        }
      } catch (nextError) {
        if (isMounted) {
          setError(getErrorMessage(nextError, "Unable to load missions."));
        }
      }
    }

    void load();

    return () => {
      isMounted = false;
    };
  }, [session.accessToken]);

  return (
    <section className="panel page-panel">
      <p className="section-label">Progression</p>
      <h2>Mission queue</h2>
      {error ? <p className="error-bar">{error}</p> : null}
      <div className="timeline-list">
        {missions.map((mission) => (
          <div className="timeline-row" key={mission.id}>
            <div>
              <strong>{mission.definition.name}</strong>
              <p className="muted">{mission.definition.description}</p>
            </div>
            <div className="timeline-meta">
              <span>{mission.progress}/{mission.targetProgress}</span>
              <span>{formatMoney(mission.definition.rewardCash)}</span>
              <span>{mission.status}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
