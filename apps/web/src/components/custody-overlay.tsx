"use client";

import { useEffect, useMemo, useState } from "react";

import type { CustodyBuyoutStatus } from "../lib/api-types";
import { ApiError } from "../lib/api-client";
import { formatMoney } from "../lib/formatters";
import { gameApi } from "../lib/game-api";
import { usePlayerState } from "./providers/player-state-provider";
import { useSession } from "./providers/session-provider";

type ActiveCustodyType = "jail" | "hospital";

const statusLabels: Record<ActiveCustodyType, string> = {
  jail: "Jail",
  hospital: "Hospital"
};

const actionLabels: Record<ActiveCustodyType, string> = {
  jail: "Buy out of jail",
  hospital: "Buy discharge"
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
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nowTick, setNowTick] = useState(() => Date.now());
  const [hasRequestedExpiryRefresh, setHasRequestedExpiryRefresh] = useState(false);

  useEffect(() => {
    if (!accessToken || !activeStatusType) {
      setStatus(null);
      setIsLoading(false);
      setIsSubmitting(false);
      setError(null);
      return;
    }

    const currentType = activeStatusType;
    const currentAccessToken = accessToken;
    let cancelled = false;

    async function loadStatus() {
      setIsLoading(true);

      try {
        const nextStatus =
          currentType === "jail"
            ? await gameApi.jail.getCurrentStatus(currentAccessToken)
            : await gameApi.hospital.getCurrentStatus(currentAccessToken);

        if (!cancelled) {
          setStatus(nextStatus);
          setError(null);
          setHasRequestedExpiryRefresh(false);
        }
      } catch (nextError) {
        if (!cancelled) {
          setError(
            nextError instanceof ApiError
              ? nextError.message
              : "Unable to load status details."
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
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
  }, [accessToken, activeStatusType, player?.updatedAt]);

  useEffect(() => {
    if (!activeStatusType) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setNowTick(Date.now());
    }, 1_000);

    return () => {
      window.clearInterval(intervalId);
    };
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
      Math.max(
        (status.currentPricePerMinute * remainingSeconds) / 60,
        status.minimumPrice ?? 0
      )
    );
  }, [remainingSeconds, status]);

  useEffect(() => {
    if (!activeStatusType || remainingSeconds > 0 || hasRequestedExpiryRefresh) {
      return;
    }

    setHasRequestedExpiryRefresh(true);
    void refreshPlayer();
  }, [activeStatusType, hasRequestedExpiryRefresh, refreshPlayer, remainingSeconds]);

  if (!activeStatusType || !player) {
    return null;
  }

  async function handleBuyout() {
    if (!accessToken) {
      setError("Authentication is required.");
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
      setError(
        nextError instanceof ApiError ? nextError.message : "Buyout failed."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const buttonDisabled =
    !accessToken ||
    isSubmitting ||
    isLoading ||
    currentBuyoutPrice === null ||
    player.cash < currentBuyoutPrice;

  return (
    <div className="custody-overlay" role="dialog" aria-modal="true" aria-labelledby="custody-title">
      <div className="custody-overlay-backdrop" />
      <section className="panel stack custody-overlay-card">
        <div>
          <p className="eyebrow">Lockout</p>
          <h2 id="custody-title">{statusLabels[activeStatusType]}</h2>
          <p className="muted">
            Normal gameplay remains blocked while this status is active.
          </p>
        </div>

        {error ? <p className="notice notice-error">{error}</p> : null}

        <dl className="stats-grid compact">
          <div>
            <dt>Status</dt>
            <dd>{statusLabels[activeStatusType]}</dd>
          </div>
          <div>
            <dt>Reason</dt>
            <dd>{status?.reason ?? "Loading..."}</dd>
          </div>
          <div>
            <dt>Time remaining</dt>
            <dd>{formatCountdown(remainingSeconds)}</dd>
          </div>
          <div>
            <dt>Current cash</dt>
            <dd>{formatMoney(player.cash)}</dd>
          </div>
          <div>
            <dt>Buyout price</dt>
            <dd>{currentBuyoutPrice === null ? "Loading..." : formatMoney(currentBuyoutPrice)}</dd>
          </div>
          <div>
            <dt>Price per minute</dt>
            <dd>
              {status?.currentPricePerMinute === null || status?.currentPricePerMinute === undefined
                ? "Loading..."
                : formatPerMinute(status.currentPricePerMinute)}
            </dd>
          </div>
        </dl>

        {currentBuyoutPrice !== null && player.cash < currentBuyoutPrice ? (
          <p className="notice notice-error">
            You do not have enough cash to buy out immediately.
          </p>
        ) : null}

        <div className="inline-actions">
          <button
            className="button"
            type="button"
            disabled={buttonDisabled}
            onClick={() => {
              void handleBuyout();
            }}
          >
            {isSubmitting ? "Processing..." : actionLabels[activeStatusType]}
          </button>
        </div>
      </section>
    </div>
  );
}

function formatCountdown(totalSeconds: number): string {
  const clampedSeconds = Math.max(0, totalSeconds);
  const hours = Math.floor(clampedSeconds / 3600);
  const minutes = Math.floor((clampedSeconds % 3600) / 60);
  const seconds = clampedSeconds % 60;

  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
}

function formatPerMinute(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2
  }).format(value);
}
