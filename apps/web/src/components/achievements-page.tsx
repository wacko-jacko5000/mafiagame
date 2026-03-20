"use client";

import { useEffect, useMemo, useState } from "react";

import type { PlayerAchievement, Season } from "../lib/api-types";
import { ApiError } from "../lib/api-client";
import { formatDateTime } from "../lib/formatters";
import { gameApi } from "../lib/game-api";
import { summarizeAchievements } from "../lib/game-state";
import { AppShell } from "./app-shell";
import { useSession } from "./providers/session-provider";

export function AchievementsPage() {
  const { account } = useSession();
  const playerId = account?.player?.id ?? null;
  const [achievements, setAchievements] = useState<PlayerAchievement[]>([]);
  const [currentSeason, setCurrentSeason] = useState<Season | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!playerId) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const [nextAchievements, currentSeasonResponse] = await Promise.all([
          gameApi.achievements.listPlayer(playerId),
          gameApi.seasons.listCurrent()
        ]);

        setAchievements(nextAchievements);
        setCurrentSeason(currentSeasonResponse.season);
      } catch (nextError) {
        setError(
          nextError instanceof ApiError ? nextError.message : "Unable to load achievements."
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadData();
  }, [playerId]);

  const summary = useMemo(() => summarizeAchievements(achievements), [achievements]);
  const orderedAchievements = useMemo(
    () =>
      [...achievements].sort((left, right) => {
        if (left.unlockedAt && !right.unlockedAt) {
          return -1;
        }

        if (!left.unlockedAt && right.unlockedAt) {
          return 1;
        }

        const leftRatio = left.progress / Math.max(left.targetProgress, 1);
        const rightRatio = right.progress / Math.max(right.targetProgress, 1);
        return rightRatio - leftRatio;
      }),
    [achievements]
  );

  return (
    <AppShell
      title="Achievements"
      subtitle="Read-only visibility into the backend-owned achievement catalog, player progress, and unlocked state."
    >
      {error ? <p className="notice notice-error">{error}</p> : null}

      <section className="dashboard-grid">
        <article className="panel">
          <p className="eyebrow">Progress</p>
          <h2>Achievement state</h2>
          <dl className="stats-grid compact">
            <div>
              <dt>Unlocked</dt>
              <dd>{summary.unlockedCount}</dd>
            </div>
            <div>
              <dt>In progress</dt>
              <dd>{summary.inProgressCount}</dd>
            </div>
            <div>
              <dt>Next unlock</dt>
              <dd>{summary.nextUp?.definition.name ?? "No active progress"}</dd>
            </div>
          </dl>
        </article>

        <article className="panel">
          <p className="eyebrow">Current season</p>
          <h2>{currentSeason?.name ?? "No active season"}</h2>
          <p className="muted">
            {currentSeason
              ? `Runs from ${formatDateTime(currentSeason.startsAt)} to ${formatDateTime(currentSeason.endsAt)}.`
              : "The season system exists, but there is no active season right now."}
          </p>
        </article>
      </section>

      <section className="panel">
        <p className="eyebrow">Catalog</p>
        <h2>Unlocked and in progress</h2>
        {isLoading ? (
          <p className="muted">Loading achievements...</p>
        ) : orderedAchievements.length > 0 ? (
          <div className="card-grid">
            {orderedAchievements.map((achievement) => (
              <article key={achievement.achievementId} className="subpanel stack compact-stack">
                <div>
                  <h3>{achievement.definition.name}</h3>
                  <p className="muted">{achievement.definition.description}</p>
                </div>
                <dl className="stats-grid compact">
                  <div>
                    <dt>Progress</dt>
                    <dd>
                      {achievement.progress}/{achievement.targetProgress}
                    </dd>
                  </div>
                  <div>
                    <dt>Status</dt>
                    <dd>{achievement.unlockedAt ? "Unlocked" : "Tracking"}</dd>
                  </div>
                  <div>
                    <dt>Unlocked at</dt>
                    <dd>{achievement.unlockedAt ? formatDateTime(achievement.unlockedAt) : "Not yet"}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        ) : (
          <p className="muted">No achievement state is available yet.</p>
        )}
      </section>
    </AppShell>
  );
}
