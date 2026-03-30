"use client";

import { useEffect, useState } from "react";

import type { PlayerActivity } from "../lib/game-api";
import { gameApi } from "../lib/game-api";
import { formatDateTime, getErrorMessage } from "../lib/formatters";
import { useSession } from "./session-provider";

export function ActivityPage() {
  const session = useSession();
  const [activity, setActivity] = useState<PlayerActivity[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session.accessToken) {
      return;
    }

    let isMounted = true;

    async function load() {
      try {
        const nextActivity = await gameApi.activity.listCurrent(session.accessToken!, 20);
        if (isMounted) {
          setActivity(nextActivity);
        }
      } catch (nextError) {
        if (isMounted) {
          setError(getErrorMessage(nextError, "Unable to load activity."));
        }
      }
    }

    void load();

    return () => {
      isMounted = false;
    };
  }, [session.accessToken]);

  return (
    <section className="panel page-panel">
      <p className="section-label">Feed</p>
      <h2>Street activity</h2>
      {error ? <p className="error-bar">{error}</p> : null}
      <div className="timeline-list">
        {activity.map((entry) => (
          <div className="timeline-row" key={entry.id}>
            <div>
              <strong>{entry.title}</strong>
              <p className="muted">{entry.body}</p>
            </div>
            <div className="timeline-meta">
              <span>{formatDateTime(entry.createdAt)}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
