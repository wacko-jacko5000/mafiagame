"use client";

import { useEffect, useState } from "react";

import type { CrimeDefinition, CrimeExecutionResult } from "../lib/api-types";
import { ApiError } from "../lib/api-client";
import {
  formatMoney,
  formatPercent,
  formatRelativeDuration
} from "../lib/formatters";
import { gameApi } from "../lib/game-api";
import { getUnlockedCrimes } from "../lib/game-state";
import { AppShell } from "./app-shell";
import { usePlayerState } from "./providers/player-state-provider";
import { useSession } from "./providers/session-provider";

export function CrimesPage() {
  const { accessToken, account } = useSession();
  const { player, refreshPlayer } = usePlayerState();
  const [crimes, setCrimes] = useState<CrimeDefinition[]>([]);
  const [result, setResult] = useState<CrimeExecutionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCrimeId, setActiveCrimeId] = useState<string | null>(null);
  const visibleCrimes = getUnlockedCrimes(crimes, player?.level ?? null);

  async function loadData() {
    if (!accessToken || !account?.player?.id) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const nextCrimes = await gameApi.crimes.list();

      setCrimes(nextCrimes);
    } catch (nextError) {
      setError(
        nextError instanceof ApiError
          ? nextError.message
          : "Unable to load crimes."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, [accessToken, account?.player?.id]);

  async function handleExecute(crimeId: string) {
    if (!accessToken || !account?.player?.id) {
      return;
    }

    setActiveCrimeId(crimeId);
    setError(null);

    try {
      const outcome = await gameApi.crimes.execute(accessToken, crimeId);
      await refreshPlayer();

      setResult(outcome);
    } catch (nextError) {
      try {
        await refreshPlayer();
      } catch {
        // Keep the original action error as the primary UI signal.
      }

      setError(
        nextError instanceof ApiError
          ? nextError.message
          : "Unable to execute the selected crime."
      );
    } finally {
      setActiveCrimeId(null);
    }
  }

  return (
    <AppShell
      title="Crimes"
      subtitle="List starter crimes and execute them through the authenticated actor route."
    >
      {result ? (
        <div
          aria-label="Dismiss crime outcome"
          className="custody-overlay"
          onClick={() => setResult(null)}
        >
          <span className="custody-overlay-backdrop" />
          <section
            className="panel stack custody-overlay-card crime-success-panel crime-success-overlay-card"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="eyebrow">Outcome</p>
            <h2>{result.success ? "SUCCESS" : "FAILED"}</h2>
            <dl className="stats-grid compact">
              <div>
                <dt>Crime</dt>
                <dd>{crimes.find((c) => c.id === result.crimeId)?.name ?? result.crimeId}</dd>
              </div>
              {result.success ? (
                <>
                  <div>
                    <dt>Cash won</dt>
                    <dd>{formatMoney(result.cashAwarded)}</dd>
                  </div>
                  <div>
                    <dt>Respect gained</dt>
                    <dd>{result.respectAwarded}</dd>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <dt>Energy spent</dt>
                    <dd>{result.energySpent}</dd>
                  </div>
                  {result.consequence.type !== "none" && result.consequence.activeUntil ? (
                    <div>
                      <dt>Consequence</dt>
                      <dd>
                        {result.consequence.type === "jail" ? "Sent to jail" : "Sent to hospital"}{" "}
                        until{" "}
                        {new Date(result.consequence.activeUntil).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </dd>
                    </div>
                  ) : null}
                </>
              )}
            </dl>
            <button className="button" type="button" onClick={() => setResult(null)}>
              Continue
            </button>
          </section>
        </div>
      ) : null}

      {error ? <p className="notice notice-error">{error}</p> : null}

      {player ? (
        <section className="panel">
          <p className="eyebrow">Heat Level</p>
          <p className="muted" style={{ marginBottom: "0.5rem" }}>
            Heat reduces your crime success rate. It builds up with each crime and decays over time.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                flex: 1,
                height: "10px",
                background: "var(--color-surface-raised, #2a2a2a)",
                borderRadius: "5px",
                overflow: "hidden"
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${Math.min(100, player.heat ?? 0)}%`,
                  background:
                    (player.heat ?? 0) >= 75
                      ? "#e53e3e"
                      : (player.heat ?? 0) >= 40
                        ? "#dd6b20"
                        : "#38a169",
                  transition: "width 0.3s ease"
                }}
              />
            </div>
            <span style={{ minWidth: "3rem", textAlign: "right" }}>{player.heat ?? 0} / 100</span>
          </div>
        </section>
      ) : null}

      <section className="panel">
        <p className="eyebrow">Catalog</p>
        <h2>Starter crimes</h2>
        {isLoading ? (
          <p className="muted">Loading crimes...</p>
        ) : visibleCrimes.length === 0 ? (
          <p className="muted">No crimes are unlocked at your current level yet.</p>
        ) : (
          <div className="card-grid crime-card-grid">
            {visibleCrimes.map((crime) => (
              <article key={crime.id} className="subpanel crime-card">
                <h3>{crime.name}</h3>
                <dl className="stats-grid compact crime-stats-grid">
                  <div>
                    <dt>Energy cost</dt>
                    <dd>{crime.energyCost}</dd>
                  </div>
                  <div>
                    <dt>Success rate</dt>
                    <dd>{formatPercent(crime.successRate)}</dd>
                  </div>
                  <div>
                    <dt>Reward range</dt>
                    <dd>
                      {formatMoney(crime.cashRewardMin)} to {formatMoney(crime.cashRewardMax)}
                    </dd>
                  </div>
                  <div>
                    <dt>Respect</dt>
                    <dd>{crime.respectReward}</dd>
                  </div>
                  <div>
                    <dt>Failure</dt>
                    <dd>
                      {crime.failureConsequence.type === "none"
                        ? "None"
                        : `${crime.failureConsequence.type} (${formatRelativeDuration(
                            crime.failureConsequence.durationSeconds
                          )})`}
                    </dd>
                  </div>
                </dl>
                <button
                  className="button crime-card-button"
                  disabled={activeCrimeId === crime.id}
                  type="button"
                  onClick={() => void handleExecute(crime.id)}
                >
                  {activeCrimeId === crime.id ? "Executing..." : "Execute"}
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
