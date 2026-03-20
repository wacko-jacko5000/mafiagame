"use client";

import { useEffect, useState } from "react";

import type {
  Leaderboard,
  LeaderboardDefinition,
  PlayerGangMembership
} from "../lib/api-types";
import { ApiError } from "../lib/api-client";
import { formatMoney } from "../lib/formatters";
import { gameApi } from "../lib/game-api";
import { AppShell } from "./app-shell";
import { useSession } from "./providers/session-provider";

export function LeaderboardPage() {
  const { account } = useSession();
  const playerId = account?.player?.id ?? null;
  const [definitions, setDefinitions] = useState<LeaderboardDefinition[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [leaderboard, setLeaderboard] = useState<Leaderboard | null>(null);
  const [gangMembership, setGangMembership] = useState<PlayerGangMembership | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionKey, setActionKey] = useState<string | null>(null);

  useEffect(() => {
    async function loadDefinitions() {
      setIsLoading(true);
      setError(null);

      try {
        const [nextDefinitions, nextGangMembership] = await Promise.all([
          gameApi.leaderboard.listDefinitions(),
          playerId ? gameApi.gangs.getMembershipByPlayer(playerId) : Promise.resolve(null)
        ]);
        const initialId = nextDefinitions[0]?.id ?? "";
        setDefinitions(nextDefinitions);
        setSelectedId(initialId);
        setGangMembership(nextGangMembership);

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
  }, [playerId]);

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

  async function handleInvite(targetPlayerId: string, displayName: string) {
    if (!gangMembership || !playerId) {
      return;
    }

    const nextActionKey = `invite-${targetPlayerId}`;
    setActionKey(nextActionKey);
    setError(null);
    setNotice(null);

    try {
      await gameApi.gangs.invitePlayer(gangMembership.gang.id, targetPlayerId, playerId);
      setNotice(`Invite sent to ${displayName}.`);
    } catch (nextError) {
      setError(
        nextError instanceof ApiError
          ? nextError.message
          : "Unable to send the gang invite."
      );
    } finally {
      setActionKey(null);
    }
  }

  const canInvite = gangMembership?.membership.role === "leader";

  return (
    <AppShell
      title="Leaderboard"
      subtitle="Public rankings backed by persisted state, plus a practical invite surface for gang leaders."
    >
      {error ? <p className="notice notice-error">{error}</p> : null}
      {notice ? <p className="notice">{notice}</p> : null}

      <section className="panel">
        <div className="split-row">
          <div>
            <p className="eyebrow">Public rankings</p>
            <h2>{leaderboard?.name ?? "Leaderboard"}</h2>
            <p className="muted">{leaderboard?.description}</p>
            {canInvite ? (
              <p className="muted">
                Leader mode is active. Use invite to send gang offers from this list.
              </p>
            ) : null}
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
                <div className="inline-actions">
                  <span className="metric">
                    {leaderboard.metricKey === "cash"
                      ? formatMoney(entry.metricValue)
                      : entry.metricValue}
                  </span>
                  {canInvite && entry.playerId !== playerId ? (
                    <button
                      className="button button-secondary"
                      disabled={actionKey === `invite-${entry.playerId}`}
                      type="button"
                      onClick={() => void handleInvite(entry.playerId, entry.displayName)}
                    >
                      {actionKey === `invite-${entry.playerId}` ? "Inviting..." : "Invite"}
                    </button>
                  ) : null}
                </div>
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
