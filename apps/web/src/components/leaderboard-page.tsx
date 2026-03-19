"use client";

import { useEffect, useState } from "react";

import type { Leaderboard, LeaderboardDefinition } from "../lib/api-types";
import { ApiError } from "../lib/api-client";
import { formatMoney } from "../lib/formatters";
import { gameApi } from "../lib/game-api";
import { AppShell } from "./app-shell";

export function LeaderboardPage() {
  const [definitions, setDefinitions] = useState<LeaderboardDefinition[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [leaderboard, setLeaderboard] = useState<Leaderboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDefinitions() {
      setIsLoading(true);
      setError(null);

      try {
        const nextDefinitions = await gameApi.leaderboard.listDefinitions();
        const initialId = nextDefinitions[0]?.id ?? "";
        setDefinitions(nextDefinitions);
        setSelectedId(initialId);

        if (initialId) {
          const nextLeaderboard = await gameApi.leaderboard.get(initialId);
          setLeaderboard(nextLeaderboard);
        }
      } catch (nextError) {
        setError(
          nextError instanceof ApiError
            ? nextError.message
            : "Unable to load leaderboards."
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadDefinitions();
  }, []);

  async function handleChange(leaderboardId: string) {
    setSelectedId(leaderboardId);
    setIsLoading(true);
    setError(null);

    try {
      const nextLeaderboard = await gameApi.leaderboard.get(leaderboardId);
      setLeaderboard(nextLeaderboard);
    } catch (nextError) {
      setError(
        nextError instanceof ApiError
          ? nextError.message
          : "Unable to load the selected leaderboard."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AppShell
      title="Leaderboard"
      subtitle="Optional read-only slice for public rankings backed by existing persisted state."
    >
      {error ? <p className="notice notice-error">{error}</p> : null}

      <section className="panel">
        <div className="split-row">
          <div>
            <p className="eyebrow">Public rankings</p>
            <h2>{leaderboard?.name ?? "Leaderboard"}</h2>
            <p className="muted">{leaderboard?.description}</p>
          </div>

          <label className="field select-field">
            <span>Board</span>
            <select
              value={selectedId}
              onChange={(event) => void handleChange(event.target.value)}
            >
              {definitions.map((definition) => (
                <option key={definition.id} value={definition.id}>
                  {definition.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        {isLoading ? (
          <p className="muted">Loading leaderboard...</p>
        ) : leaderboard ? (
          <ol className="leaderboard-list">
            {leaderboard.entries.map((entry) => (
              <li key={`${leaderboard.id}-${entry.playerId}`} className="leaderboard-item">
                <span className="rank">#{entry.rank}</span>
                <strong>{entry.displayName}</strong>
                <span className="metric">
                  {leaderboard.metricKey === "cash" ? formatMoney(entry.metricValue) : entry.metricValue}
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="muted">No leaderboard data is available.</p>
        )}
      </section>
    </AppShell>
  );
}
