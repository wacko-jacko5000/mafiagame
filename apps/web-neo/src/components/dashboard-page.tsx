"use client";

import { useEffect, useMemo, useState } from "react";

import type {
  CurrentSeasonResponse,
  District,
  Leaderboard,
  PlayerActivity,
  PlayerGangMembership,
  PlayerMission,
  ShopItem
} from "../lib/game-api";
import { gameApi } from "../lib/game-api";
import { formatDateTime, formatMoney, getErrorMessage } from "../lib/formatters";
import { usePlayerState } from "./player-state-provider";
import { useSession } from "./session-provider";

interface DashboardState {
  missions: PlayerMission[];
  activity: PlayerActivity[];
  season: CurrentSeasonResponse["season"];
  gangMembership: PlayerGangMembership | null;
  districts: District[];
  shopItems: ShopItem[];
  leaderboard: Leaderboard | null;
}

export function DashboardPage() {
  const session = useSession();
  const { player } = usePlayerState();
  const [data, setData] = useState<DashboardState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session.accessToken || !session.account?.player) {
      return;
    }

    const accessToken = session.accessToken;
    const playerId = session.account.player.id;
    let isMounted = true;

    async function load() {
      try {
        const leaderboardDefinitions = await gameApi.leaderboard.listDefinitions();
        const primaryLeaderboard = leaderboardDefinitions[0] ?? null;

        const [missions, activity, season, gangMembership, districts, shopItems, leaderboard] =
          await Promise.all([
            gameApi.missions.listCurrent(accessToken),
            gameApi.activity.listCurrent(accessToken, 6),
            gameApi.seasons.listCurrent(),
            gameApi.gangs.getMembershipByPlayer(playerId),
            gameApi.territory.listDistricts(),
            gameApi.inventory.listShopItems(accessToken),
            primaryLeaderboard
              ? gameApi.leaderboard.get(primaryLeaderboard.id, primaryLeaderboard.defaultLimit)
              : Promise.resolve(null)
          ]);

        if (isMounted) {
          setData({
            missions,
            activity,
            season: season.season,
            gangMembership,
            districts,
            shopItems,
            leaderboard
          });
        }
      } catch (nextError) {
        if (isMounted) {
          setError(getErrorMessage(nextError, "Unable to load dashboard."));
        }
      }
    }

    void load();

    return () => {
      isMounted = false;
    };
  }, [session.accessToken, session.account?.player]);

  const worldStats = useMemo(
    () => ({
      controlledDistricts: data?.districts.filter((district) => district.controller).length ?? 0,
      activeWars: data?.districts.filter((district) => district.activeWar).length ?? 0,
      premiumShopItems: data?.shopItems.filter((item) => item.isUnlocked).slice(0, 3) ?? []
    }),
    [data]
  );

  return (
    <section className="dashboard-grid">
      {error ? <p className="error-bar">{error}</p> : null}

      <article className="panel summary-panel">
        <p className="section-label">Empire Core</p>
        <div className="metric-grid">
          <MetricCard label="Cash" value={formatMoney(player?.cash ?? 0)} />
          <MetricCard label="Respect" value={String(player?.currentRespect ?? 0)} />
          <MetricCard label="Energy" value={String(player?.energy ?? 0)} />
          <MetricCard label="Health" value={String(player?.health ?? 0)} />
        </div>
        <div className="progress-band">
          <div>
            <p className="mini-label">Rank</p>
            <strong>
              {player?.rank ?? "Loading"} · Level {player?.level ?? "--"}
            </strong>
          </div>
          <div>
            <p className="mini-label">Progress</p>
            <strong>{player?.progressPercent ?? 0}% to {player?.nextLevel ?? "max"}</strong>
          </div>
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{ width: `${Math.max(player?.progressPercent ?? 0, 8)}%` }}
            />
          </div>
        </div>
      </article>

      <article className="panel season-panel">
        <p className="section-label">City Pressure</p>
        <h2>{data?.season?.name ?? "No active season"}</h2>
        <p className="muted">
          {data?.season
            ? `Active until ${formatDateTime(data.season.endsAt)}`
            : "The backend supports seasons, but none are live right now."}
        </p>
        <div className="city-pulse">
          <StatChip label="Controlled districts" value={String(worldStats.controlledDistricts)} />
          <StatChip label="Live wars" value={String(worldStats.activeWars)} />
          <StatChip label="Gang" value={data?.gangMembership?.gang.name ?? "Unaffiliated"} />
        </div>
      </article>

      <article className="panel">
        <p className="section-label">Operations Board</p>
        <h2>Current missions</h2>
        <div className="timeline-list">
          {(data?.missions ?? []).slice(0, 4).map((mission) => (
            <div className="timeline-row" key={mission.id}>
              <div>
                <strong>{mission.definition.name}</strong>
                <p className="muted">{mission.definition.description}</p>
              </div>
              <div className="timeline-meta">
                <span>{mission.progress}/{mission.targetProgress}</span>
                <span>{mission.status}</span>
              </div>
            </div>
          ))}
        </div>
      </article>

      <article className="panel">
        <p className="section-label">Black Market</p>
        <h2>Unlocked gear worth grabbing</h2>
        <div className="card-list">
          {worldStats.premiumShopItems.map((item) => (
            <div className="interactive-card" key={item.id}>
              <div>
                <strong>{item.name}</strong>
                <p className="muted">{item.type} · lvl {item.unlockLevel}</p>
              </div>
              <div className="card-footer">
                <span>{formatMoney(item.price)}</span>
              </div>
            </div>
          ))}
        </div>
      </article>

      <article className="panel">
        <p className="section-label">Territory Scan</p>
        <h2>District pressure map</h2>
        <div className="timeline-list">
          {(data?.districts ?? []).slice(0, 4).map((district) => (
            <div className="timeline-row" key={district.id}>
              <div>
                <strong>{district.name}</strong>
                <p className="muted">
                  {district.controller ? `Held by ${district.controller.gangName}` : "Open for capture"}
                </p>
              </div>
              <div className="timeline-meta">
                <span>{formatMoney(district.payout.amount)}</span>
                <span>{district.activeWar ? "War live" : "Stable"}</span>
              </div>
            </div>
          ))}
        </div>
      </article>

      <article className="panel">
        <p className="section-label">City Feed</p>
        <h2>Recent activity</h2>
        <div className="timeline-list">
          {(data?.activity ?? []).map((entry) => (
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
      </article>

      <article className="panel">
        <p className="section-label">Leaderboard</p>
        <h2>{data?.leaderboard?.name ?? "Awaiting ranking data"}</h2>
        <div className="leaderboard-list">
          {(data?.leaderboard?.entries ?? []).slice(0, 5).map((entry) => (
            <div className="leaderboard-row" key={`${entry.rank}-${entry.displayName}`}>
              <span>#{entry.rank}</span>
              <strong>{entry.displayName}</strong>
              <span>{entry.metricValue}</span>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat-chip">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
