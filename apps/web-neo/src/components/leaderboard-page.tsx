"use client";

import { useEffect, useState } from "react";

import type { Leaderboard } from "../lib/game-api";
import { gameApi } from "../lib/game-api";
import { getErrorMessage } from "../lib/formatters";

export function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<Leaderboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const definitions = await gameApi.leaderboard.listDefinitions();
        const primary = definitions[0];

        if (!primary) {
          return;
        }

        const nextLeaderboard = await gameApi.leaderboard.get(primary.id, primary.defaultLimit);

        if (isMounted) {
          setLeaderboard(nextLeaderboard);
        }
      } catch (nextError) {
        if (isMounted) {
          setError(getErrorMessage(nextError, "Unable to load leaderboard."));
        }
      }
    }

    void load();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="panel page-panel">
      <p className="section-label">Status</p>
      <h2>{leaderboard?.name ?? "Leaderboard"}</h2>
      {error ? <p className="error-bar">{error}</p> : null}
      <div className="leaderboard-list">
        {(leaderboard?.entries ?? []).map((entry) => (
          <div className="leaderboard-row" key={`${entry.rank}-${entry.displayName}`}>
            <span>#{entry.rank}</span>
            <strong>{entry.displayName}</strong>
            <span>{entry.metricValue}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
