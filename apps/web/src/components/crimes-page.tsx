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

      setResult(outcome.success ? outcome : null);
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
            <h2>SUCCESS</h2>
            <dl className="stats-grid compact">
              <div>
                <dt>Crime</dt>
                <dd>{result.crimeId}</dd>
              </div>
              <div>
                <dt>Cash won</dt>
                <dd>{formatMoney(result.cashAwarded)}</dd>
              </div>
              <div>
                <dt>Respect gained</dt>
                <dd>{result.respectAwarded}</dd>
              </div>
            </dl>
            <button className="button" type="button" onClick={() => setResult(null)}>
              Continue
            </button>
          </section>
        </div>
      ) : null}

      {error ? <p className="notice notice-error">{error}</p> : null}

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
