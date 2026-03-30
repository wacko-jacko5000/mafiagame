"use client";

import { useEffect, useState } from "react";

import type { CrimeDefinition, CrimeExecutionResult } from "../lib/game-api";
import { gameApi } from "../lib/game-api";
import { formatDateTime, formatMoney, getErrorMessage } from "../lib/formatters";
import { usePlayerState } from "./player-state-provider";
import { useSession } from "./session-provider";

export function CrimesPage() {
  const session = useSession();
  const { refreshPlayer } = usePlayerState();
  const [crimes, setCrimes] = useState<CrimeDefinition[]>([]);
  const [result, setResult] = useState<CrimeExecutionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const nextCrimes = await gameApi.crimes.list();

        if (isMounted) {
          setCrimes(nextCrimes);
        }
      } catch (nextError) {
        if (isMounted) {
          setError(getErrorMessage(nextError, "Unable to load crimes."));
        }
      }
    }

    void load();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleCrime(crimeId: string) {
    if (!session.accessToken) {
      return;
    }

    setIsBusy(crimeId);
    setError(null);

    try {
      const outcome = await gameApi.crimes.execute(session.accessToken, crimeId);
      await refreshPlayer();
      setResult(outcome);
    } catch (nextError) {
      try {
        await refreshPlayer();
      } catch {
        // Preserve action error.
      }

      setError(getErrorMessage(nextError, "Crime failed."));
    } finally {
      setIsBusy(null);
    }
  }

  return (
    <section className="panel page-panel">
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
            <p className="section-label">Outcome</p>
            <h2>{result.success ? "SUCCESS" : "FAILED"}</h2>
            <div className="card-list">
              <div className="metric-card">
                <span>Crime</span>
                <strong>{crimes.find((crime) => crime.id === result.crimeId)?.name ?? result.crimeId}</strong>
              </div>
              {result.success ? (
                <>
                  <div className="metric-card">
                    <span>Cash won</span>
                    <strong>{formatMoney(result.cashAwarded)}</strong>
                  </div>
                  <div className="metric-card">
                    <span>Respect</span>
                    <strong>{result.respectAwarded}</strong>
                  </div>
                </>
              ) : (
                <>
                  <div className="metric-card">
                    <span>Energy spent</span>
                    <strong>{result.energySpent}</strong>
                  </div>
                  {result.consequence.type !== "none" && result.consequence.activeUntil ? (
                    <div className="metric-card">
                      <span>Consequence</span>
                      <strong>
                        {result.consequence.type === "jail" ? "Sent to jail" : "Sent to hospital"} until{" "}
                        {formatDateTime(result.consequence.activeUntil)}
                      </strong>
                    </div>
                  ) : null}
                </>
              )}
            </div>
            <button className="action-button" onClick={() => setResult(null)} type="button">
              Continue
            </button>
          </section>
        </div>
      ) : null}

      <p className="section-label">Street Actions</p>
      <h2>Crime board</h2>
      {error ? <p className="error-bar">{error}</p> : null}
      <div className="card-list">
        {crimes.map((crime) => (
          <div className="interactive-card" key={crime.id}>
            <div>
              <strong>{crime.name}</strong>
              <p className="muted">
                Level {crime.requiredLevel} · {crime.energyCost} energy · {Math.round(crime.successRate * 100)}% success
              </p>
            </div>
            <div className="card-footer">
              <span>{formatMoney(crime.cashRewardMin)}-{formatMoney(crime.cashRewardMax)}</span>
              <button
                className="mini-button"
                disabled={isBusy === crime.id}
                onClick={() => {
                  void handleCrime(crime.id);
                }}
                type="button"
              >
                {isBusy === crime.id ? "Running..." : "Run"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
