"use client";

import { useEffect, useState } from "react";

import type { PlayerActivity } from "../lib/api-types";
import { ApiError } from "../lib/api-client";
import { formatDateTime } from "../lib/formatters";
import { gameApi } from "../lib/game-api";
import { AppShell } from "./app-shell";
import { useSession } from "./providers/session-provider";

export function ActivityPage() {
  const { accessToken } = useSession();
  const [activity, setActivity] = useState<PlayerActivity[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);

  async function loadData() {
    if (!accessToken) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const nextActivity = await gameApi.activity.listCurrent(accessToken, 50);
      setActivity(nextActivity);
    } catch (nextError) {
      setError(
        nextError instanceof ApiError
          ? nextError.message
          : "Unable to load activity feed."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, [accessToken]);

  async function handleMarkRead(activityId: string) {
    if (!accessToken) {
      return;
    }

    setActiveItemId(activityId);
    setError(null);

    try {
      const updatedEntry = await gameApi.activity.markRead(accessToken, activityId);
      setActivity((current) =>
        current.map((entry) => (entry.id === updatedEntry.id ? updatedEntry : entry))
      );
    } catch (nextError) {
      setError(
        nextError instanceof ApiError
          ? nextError.message
          : "Unable to update activity state."
      );
    } finally {
      setActiveItemId(null);
    }
  }

  return (
    <AppShell
      title="Activity"
      subtitle="Read the persistent player feed backed by domain events from live backend modules."
    >
      {error ? <p className="notice notice-error">{error}</p> : null}

      <section className="panel">
        <p className="eyebrow">Feed</p>
        <h2>Recent events</h2>
        {isLoading ? (
          <p className="muted">Loading activity...</p>
        ) : activity.length > 0 ? (
          <ul className="list">
            {activity.map((entry) => (
              <li
                key={entry.id}
                className={entry.readAt ? "list-item" : "list-item unread"}
              >
                <div>
                  <strong>{entry.title}</strong>
                  <p className="muted">{entry.body}</p>
                  <p className="meta">
                    {entry.type} · {formatDateTime(entry.createdAt)}
                  </p>
                </div>
                <button
                  className="button button-secondary"
                  disabled={Boolean(entry.readAt) || activeItemId === entry.id}
                  type="button"
                  onClick={() => void handleMarkRead(entry.id)}
                >
                  {entry.readAt
                    ? "Read"
                    : activeItemId === entry.id
                      ? "Updating..."
                      : "Mark read"}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">No feed entries have been recorded yet.</p>
        )}
      </section>
    </AppShell>
  );
}
