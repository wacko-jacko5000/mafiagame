"use client";

import { useEffect, useMemo, useState } from "react";

import type { CustodyBuyoutStatus } from "../lib/game-api";
import { gameApi } from "../lib/game-api";
import { formatMoney, getErrorMessage } from "../lib/formatters";
import { usePlayerState } from "./player-state-provider";
import { useSession } from "./session-provider";

type ActiveCustodyType = "jail" | "hospital";

const statusLabels: Record<ActiveCustodyType, string> = {
  jail: "Jail",
  hospital: "Hospital"
};

const actionLabels: Record<ActiveCustodyType, string> = {
  jail: "Buy Out",
  hospital: "Buy Discharge"
};

export function CustodyOverlay() {
  const { accessToken } = useSession();
  const { player, refreshPlayer } = usePlayerState();
  const activeStatusType: ActiveCustodyType | null = player?.jailedUntil
    ? "jail"
    : player?.hospitalizedUntil
      ? "hospital"
      : null;
  const [status, setStatus] = useState<CustodyBuyoutStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nowTick, setNowTick] = useState(() => Date.now());

  useEffect(() => {
    if (!accessToken || !activeStatusType) {
      setStatus(null);
      setError(null);
      return;
    }

    const activeAccessToken = accessToken;
    let cancelled = false;

    async function loadStatus() {
      try {
        const nextStatus =
          activeStatusType === "jail"
            ? await gameApi.jail.getCurrentStatus(activeAccessToken)
            : await gameApi.hospital.getCurrentStatus(activeAccessToken);

        if (!cancelled) {
          setStatus(nextStatus);
          setError(null);
        }
      } catch (nextError) {
        if (!cancelled) {
          setError(getErrorMessage(nextError, "Unable to load status details."));
        }
      }
    }

    void loadStatus();
    const intervalId = window.setInterval(() => {
      void loadStatus();
    }, 30_000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [accessToken, activeStatusType]);

  useEffect(() => {
    if (!activeStatusType) {
      return;
    }

    const intervalId = window.setInterval(() => setNowTick(Date.now()), 1_000);
    return () => window.clearInterval(intervalId);
  }, [activeStatusType]);

  const remainingSeconds = useMemo(() => {
    if (!status?.active || !status.until) {
      return 0;
    }

    return Math.max(0, Math.ceil((new Date(status.until).getTime() - nowTick) / 1000));
  }, [nowTick, status]);

  const currentBuyoutPrice = useMemo(() => {
    if (!status?.active || status.currentPricePerMinute === null) {
      return status?.buyoutPrice ?? null;
    }

    return Math.ceil(
      Math.max((status.currentPricePerMinute * remainingSeconds) / 60, status.minimumPrice ?? 0)
    );
  }, [remainingSeconds, status]);

  useEffect(() => {
    if (!activeStatusType || remainingSeconds > 0) {
      return;
    }

    void refreshPlayer();
  }, [activeStatusType, refreshPlayer, remainingSeconds]);

  if (!activeStatusType || !player) {
    return null;
  }

  async function handleBuyout() {
    if (!accessToken) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (activeStatusType === "jail") {
        await gameApi.jail.buyout(accessToken);
      } else {
        await gameApi.hospital.buyout(accessToken);
      }

      await refreshPlayer();
      setStatus(null);
    } catch (nextError) {
      setError(getErrorMessage(nextError, "Buyout failed."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div aria-labelledby="custody-title" aria-modal="true" className="custody-overlay" role="dialog">
      <div className="custody-overlay-backdrop" />
      <section className="panel stack custody-overlay-card">
        <div>
          <p className="section-label">Lockout</p>
          <h2 id="custody-title">{statusLabels[activeStatusType]}</h2>
          <p className="muted">Normal gameplay remains blocked while this status is active.</p>
        </div>

        {error ? <p className="error-bar">{error}</p> : null}

        <dl className="metric-grid">
          <div className="metric-card">
            <span>Status</span>
            <strong>{statusLabels[activeStatusType]}</strong>
          </div>
          <div className="metric-card">
            <span>Reason</span>
            <strong>{status?.reason ?? "Loading..."}</strong>
          </div>
          <div className="metric-card">
            <span>Time</span>
            <strong>{formatCountdown(remainingSeconds)}</strong>
          </div>
          <div className="metric-card">
            <span>Cash</span>
            <strong>{formatMoney(player.cash)}</strong>
          </div>
          <div className="metric-card">
            <span>Buyout</span>
            <strong>{currentBuyoutPrice === null ? "Loading..." : formatMoney(currentBuyoutPrice)}</strong>
          </div>
        </dl>

        <div className="inline-row">
          <button
            className="action-button"
            disabled={
              isSubmitting ||
              currentBuyoutPrice === null ||
              player.cash < currentBuyoutPrice
            }
            onClick={() => {
              void handleBuyout();
            }}
            type="button"
          >
            {isSubmitting ? "Processing..." : actionLabels[activeStatusType]}
          </button>
        </div>
      </section>
    </div>
  );
}

function formatCountdown(totalSeconds: number) {
  const clampedSeconds = Math.max(0, totalSeconds);
  const hours = Math.floor(clampedSeconds / 3600);
  const minutes = Math.floor((clampedSeconds % 3600) / 60);
  const seconds = clampedSeconds % 60;

  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
}
