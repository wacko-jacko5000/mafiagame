"use client";

import { useEffect, useMemo, useState } from "react";

import type {
  MissionCompletionResult,
  MissionDefinition,
  PlayerMission
} from "../lib/api-types";
import { ApiError } from "../lib/api-client";
import { formatMoney } from "../lib/formatters";
import { gameApi } from "../lib/game-api";
import { AppShell } from "./app-shell";
import { useSession } from "./providers/session-provider";

interface MissionRow {
  definition: MissionDefinition;
  playerMission: PlayerMission | null;
}

export function MissionsPage() {
  const { accessToken } = useSession();
  const [definitions, setDefinitions] = useState<MissionDefinition[]>([]);
  const [playerMissions, setPlayerMissions] = useState<PlayerMission[]>([]);
  const [completionResult, setCompletionResult] = useState<MissionCompletionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionKey, setActionKey] = useState<string | null>(null);

  async function loadData() {
    if (!accessToken) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [nextDefinitions, nextPlayerMissions] = await Promise.all([
        gameApi.missions.listDefinitions(),
        gameApi.missions.listCurrent(accessToken)
      ]);

      setDefinitions(nextDefinitions);
      setPlayerMissions(nextPlayerMissions);
    } catch (nextError) {
      setError(
        nextError instanceof ApiError
          ? nextError.message
          : "Unable to load missions."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, [accessToken]);

  const missionRows = useMemo<MissionRow[]>(() => {
    const byMissionId = new Map(playerMissions.map((mission) => [mission.missionId, mission]));

    return definitions.map((definition) => ({
      definition,
      playerMission: byMissionId.get(definition.id) ?? null
    }));
  }, [definitions, playerMissions]);

  async function handleAccept(missionId: string) {
    if (!accessToken) {
      return;
    }

    setActionKey(`accept-${missionId}`);
    setError(null);

    try {
      await gameApi.missions.accept(accessToken, missionId);
      await loadData();
    } catch (nextError) {
      setError(
        nextError instanceof ApiError
          ? nextError.message
          : "Unable to accept mission."
      );
    } finally {
      setActionKey(null);
    }
  }

  async function handleComplete(missionId: string) {
    if (!accessToken) {
      return;
    }

    setActionKey(`complete-${missionId}`);
    setError(null);

    try {
      const result = await gameApi.missions.complete(accessToken, missionId);
      setCompletionResult(result);
      await loadData();
    } catch (nextError) {
      setError(
        nextError instanceof ApiError
          ? nextError.message
          : "Unable to complete mission."
      );
    } finally {
      setActionKey(null);
    }
  }

  return (
    <AppShell
      title="Missions"
      subtitle="Use the existing mission catalog and current-player mission state to track progress."
    >
      {error ? <p className="notice notice-error">{error}</p> : null}

      <section className="dashboard-grid">
        <article className="panel">
          <p className="eyebrow">Mission state</p>
          <h2>Accepted and completed</h2>
          <dl className="stats-grid compact">
            <div>
              <dt>Catalog entries</dt>
              <dd>{definitions.length}</dd>
            </div>
            <div>
              <dt>Accepted</dt>
              <dd>{playerMissions.filter((mission) => mission.status === "active").length}</dd>
            </div>
            <div>
              <dt>Completed</dt>
              <dd>{playerMissions.filter((mission) => mission.status === "completed").length}</dd>
            </div>
          </dl>
        </article>

        <article className="panel">
          <p className="eyebrow">Last completion</p>
          <h2>Rewards</h2>
          {completionResult ? (
            <dl className="stats-grid compact">
              <div>
                <dt>Mission</dt>
                <dd>{completionResult.mission.definition.name}</dd>
              </div>
              <div>
                <dt>Cash</dt>
                <dd>{formatMoney(completionResult.rewards.cash)}</dd>
              </div>
              <div>
                <dt>Respect</dt>
                <dd>{completionResult.rewards.respect}</dd>
              </div>
            </dl>
          ) : (
            <p className="muted">Complete an eligible mission to surface the reward payload.</p>
          )}
        </article>
      </section>

      <section className="panel">
        <p className="eyebrow">Catalog</p>
        <h2>Starter missions</h2>
        {isLoading ? (
          <p className="muted">Loading missions...</p>
        ) : (
          <div className="card-grid">
            {missionRows.map(({ definition, playerMission }) => {
              const isCompleteReady =
                playerMission?.status === "active" &&
                playerMission.progress >= playerMission.targetProgress;

              return (
                <article key={definition.id} className="subpanel">
                  <h3>{definition.name}</h3>
                  <p className="muted">{definition.description}</p>
                  <dl className="stats-grid compact">
                    <div>
                      <dt>Progress</dt>
                      <dd>
                        {playerMission
                          ? `${playerMission.progress}/${playerMission.targetProgress}`
                          : `0/${definition.objectiveTarget}`}
                      </dd>
                    </div>
                    <div>
                      <dt>Rewards</dt>
                      <dd>
                        {formatMoney(definition.rewardCash)} and {definition.rewardRespect} respect
                      </dd>
                    </div>
                    <div>
                      <dt>Repeatable</dt>
                      <dd>{definition.isRepeatable ? "Yes" : "No"}</dd>
                    </div>
                    <div>
                      <dt>Status</dt>
                      <dd>{playerMission?.status ?? "not accepted"}</dd>
                    </div>
                  </dl>

                  {playerMission ? (
                    <button
                      className="button"
                      disabled={!isCompleteReady || actionKey === `complete-${definition.id}`}
                      type="button"
                      onClick={() => void handleComplete(definition.id)}
                    >
                      {actionKey === `complete-${definition.id}`
                        ? "Completing..."
                        : "Complete"}
                    </button>
                  ) : (
                    <button
                      className="button"
                      disabled={actionKey === `accept-${definition.id}`}
                      type="button"
                      onClick={() => void handleAccept(definition.id)}
                    >
                      {actionKey === `accept-${definition.id}` ? "Accepting..." : "Accept"}
                    </button>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </AppShell>
  );
}
