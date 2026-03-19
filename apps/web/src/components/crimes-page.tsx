"use client";

import { useEffect, useState } from "react";

import type { CrimeDefinition, CrimeExecutionResult, Player } from "../lib/api-types";
import { ApiError } from "../lib/api-client";
import {
  formatDateTime,
  formatMoney,
  formatPercent,
  formatRelativeDuration
} from "../lib/formatters";
import { gameApi } from "../lib/game-api";
import { AppShell } from "./app-shell";
import { useSession } from "./providers/session-provider";

export function CrimesPage() {
  const { accessToken, account } = useSession();
  const [player, setPlayer] = useState<Player | null>(null);
  const [crimes, setCrimes] = useState<CrimeDefinition[]>([]);
  const [result, setResult] = useState<CrimeExecutionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCrimeId, setActiveCrimeId] = useState<string | null>(null);

  async function loadData() {
    if (!accessToken || !account?.player?.id) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [nextCrimes, nextPlayer] = await Promise.all([
        gameApi.crimes.list(),
        gameApi.players.getById(account.player.id)
      ]);

      setCrimes(nextCrimes);
      setPlayer(nextPlayer);
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
      const nextPlayer = await gameApi.players.getById(account.player.id);

      setResult(outcome);
      setPlayer(nextPlayer);
    } catch (nextError) {
      try {
        const nextPlayer = await gameApi.players.getById(account.player.id);
        setPlayer(nextPlayer);
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
      <section className="dashboard-grid">
        <article className="panel">
          <p className="eyebrow">Current state</p>
          <h2>Resources before the next move</h2>
          <dl className="stats-grid compact">
            <div>
              <dt>Cash</dt>
              <dd>{player ? formatMoney(player.cash) : "..."}</dd>
            </div>
            <div>
              <dt>Respect</dt>
              <dd>{player?.respect ?? "..."}</dd>
            </div>
            <div>
              <dt>Energy</dt>
              <dd>{player?.energy ?? "..."}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>
                {player?.jailedUntil
                  ? `Jailed until ${formatDateTime(player.jailedUntil)}`
                  : player?.hospitalizedUntil
                    ? `Hospitalized until ${formatDateTime(player.hospitalizedUntil)}`
                    : "Ready"}
              </dd>
            </div>
          </dl>
        </article>

        <article className="panel">
          <p className="eyebrow">Last attempt</p>
          <h2>Outcome</h2>
          {result ? (
            <dl className="stats-grid compact">
              <div>
                <dt>Crime</dt>
                <dd>{result.crimeId}</dd>
              </div>
              <div>
                <dt>Result</dt>
                <dd>{result.success ? "Success" : "Failed"}</dd>
              </div>
              <div>
                <dt>Cash</dt>
                <dd>{formatMoney(result.cashAwarded)}</dd>
              </div>
              <div>
                <dt>Respect</dt>
                <dd>{result.respectAwarded}</dd>
              </div>
              <div>
                <dt>Consequence</dt>
                <dd>
                  {result.consequence.type === "none"
                    ? "None"
                    : `${result.consequence.type} until ${formatDateTime(result.consequence.activeUntil)}`}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="muted">Execute a crime to see the latest backend outcome.</p>
          )}
        </article>
      </section>

      {error ? <p className="notice notice-error">{error}</p> : null}

      <section className="panel">
        <p className="eyebrow">Catalog</p>
        <h2>Starter crimes</h2>
        {isLoading ? (
          <p className="muted">Loading crimes...</p>
        ) : (
          <div className="card-grid">
            {crimes.map((crime) => (
              <article key={crime.id} className="subpanel">
                <h3>{crime.name}</h3>
                <dl className="stats-grid compact">
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
                  className="button"
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
