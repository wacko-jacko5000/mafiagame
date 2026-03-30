"use client";

import { useEffect, useState } from "react";

import type { District } from "../lib/game-api";
import { gameApi } from "../lib/game-api";
import { formatMoney, getErrorMessage } from "../lib/formatters";

export function TerritoryPage() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const nextDistricts = await gameApi.territory.listDistricts();
        if (isMounted) {
          setDistricts(nextDistricts);
        }
      } catch (nextError) {
        if (isMounted) {
          setError(getErrorMessage(nextError, "Unable to load territory."));
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
      <p className="section-label">Map</p>
      <h2>Territory control</h2>
      {error ? <p className="error-bar">{error}</p> : null}
      <div className="timeline-list">
        {districts.map((district) => (
          <div className="timeline-row" key={district.id}>
            <div>
              <strong>{district.name}</strong>
              <p className="muted">
                {district.controller ? `Held by ${district.controller.gangName}` : "Open district"}
              </p>
            </div>
            <div className="timeline-meta">
              <span>{formatMoney(district.payout.amount)}</span>
              <span>{district.activeWar ? "War live" : "Stable"}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
