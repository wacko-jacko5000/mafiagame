"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import type {
  District,
  Player,
  PlayerAchievement,
  PlayerActivity,
  PlayerGangMembership,
  PlayerMission,
  Season
} from "../lib/api-types";
import { ApiError } from "../lib/api-client";
import { formatDateTime, formatMoney } from "../lib/formatters";
import { gameApi } from "../lib/game-api";
import {
  summarizeAchievements,
  summarizeMissions,
  summarizeTerritory
} from "../lib/game-state";
import { AppShell } from "./app-shell";
import { useSession } from "./providers/session-provider";

export function DashboardPage() {
  const { accessToken, account } = useSession();
  const [player, setPlayer] = useState<Player | null>(null);
  const [activity, setActivity] = useState<PlayerActivity[]>([]);
  const [missions, setMissions] = useState<PlayerMission[]>([]);
  const [achievements, setAchievements] = useState<PlayerAchievement[]>([]);
  const [currentSeason, setCurrentSeason] = useState<Season | null>(null);
  const [gangMembership, setGangMembership] = useState<PlayerGangMembership | null>(null);
  const [districts, setDistricts] = useState<District[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!accessToken || !account?.player?.id) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const [
          nextPlayer,
          nextActivity,
          nextMissions,
          nextAchievements,
          currentSeasonResponse,
          nextGangMembership,
          nextDistricts
        ] = await Promise.all([
          gameApi.players.getById(account.player.id),
          gameApi.activity.listCurrent(accessToken, 5),
          gameApi.missions.listCurrent(accessToken),
          gameApi.achievements.listPlayer(account.player.id),
          gameApi.seasons.listCurrent(),
          gameApi.gangs.getMembershipByPlayer(account.player.id),
          gameApi.territory.listDistricts()
        ]);

        setPlayer(nextPlayer);
        setActivity(nextActivity);
        setMissions(nextMissions);
        setAchievements(nextAchievements);
        setCurrentSeason(currentSeasonResponse.season);
        setGangMembership(nextGangMembership);
        setDistricts(nextDistricts);
      } catch (nextError) {
        setError(
          nextError instanceof ApiError
            ? nextError.message
            : "Unable to load dashboard data."
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadData();
  }, [accessToken, account?.player?.id]);

  const missionSummary = useMemo(() => summarizeMissions(missions), [missions]);
  const achievementSummary = useMemo(
    () => summarizeAchievements(achievements),
    [achievements]
  );
  const territorySummary = useMemo(
    () => summarizeTerritory(districts, gangMembership?.gang.id ?? null),
    [districts, gangMembership?.gang.id]
  );
  const worldSummary = useMemo(
    () => ({
      claimedCount: districts.filter((district) => district.controller !== null).length,
      activeWarCount: districts.filter((district) => district.activeWar !== null).length
    }),
    [districts]
  );
  const pendingInviteCount = useMemo(
    () => activity.filter((entry) => entry.type === "gangs.invite_received").length,
    [activity]
  );

  return (
    <AppShell
      title="Dashboard"
      subtitle="Tester overview for current player state, progression, gang status, and territory pressure."
    >
      {error ? <p className="notice notice-error">{error}</p> : null}

      <section className="dashboard-grid">
        <article className="panel">
          <p className="eyebrow">Player</p>
          <h2>{player?.displayName ?? "Loading player"}</h2>
          <dl className="stats-grid">
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
              <dt>Health</dt>
              <dd>{player?.health ?? "..."}</dd>
            </div>
            <div>
              <dt>Jailed until</dt>
              <dd>{formatDateTime(player?.jailedUntil ?? null)}</dd>
            </div>
            <div>
              <dt>Hospitalized until</dt>
              <dd>{formatDateTime(player?.hospitalizedUntil ?? null)}</dd>
            </div>
          </dl>
        </article>

        <article className="panel">
          <p className="eyebrow">Current season</p>
          <h2>{currentSeason?.name ?? "No active season"}</h2>
          <p className="muted">
            {currentSeason
              ? `Runs from ${formatDateTime(currentSeason.startsAt)} to ${formatDateTime(currentSeason.endsAt)}.`
              : "The season system is enabled, but no season is active right now."}
          </p>
        </article>

        <article className="panel">
          <p className="eyebrow">Gang</p>
          <h2>{gangMembership?.gang.name ?? "Ungrouped"}</h2>
          <dl className="stats-grid compact">
            <div>
              <dt>Role</dt>
              <dd>{gangMembership?.membership.role ?? "none"}</dd>
            </div>
            <div>
              <dt>Members</dt>
              <dd>{gangMembership?.gang.memberCount ?? 0}</dd>
            </div>
            <div>
              <dt>Invite signals</dt>
              <dd>{pendingInviteCount}</dd>
            </div>
          </dl>
        </article>

        <article className="panel">
          <p className="eyebrow">Territory</p>
          <h2>{gangMembership ? "Gang pressure" : "World pressure"}</h2>
          <dl className="stats-grid compact">
            <div>
              <dt>Controlled districts</dt>
              <dd>
                {gangMembership ? territorySummary.controlledCount : worldSummary.claimedCount}
              </dd>
            </div>
            <div>
              <dt>Claimable payouts</dt>
              <dd>{gangMembership ? territorySummary.claimablePayoutCount : 0}</dd>
            </div>
            <div>
              <dt>Active wars</dt>
              <dd>
                {gangMembership ? territorySummary.activeWarCount : worldSummary.activeWarCount}
              </dd>
            </div>
          </dl>
        </article>

        <article className="panel">
          <p className="eyebrow">Missions</p>
          <h2>Current contracts</h2>
          <dl className="stats-grid compact">
            <div>
              <dt>Active</dt>
              <dd>{missionSummary.activeCount}</dd>
            </div>
            <div>
              <dt>Completed</dt>
              <dd>{missionSummary.completedCount}</dd>
            </div>
            <div>
              <dt>Ready to turn in</dt>
              <dd>{missionSummary.readyToCompleteCount}</dd>
            </div>
          </dl>
        </article>

        <article className="panel">
          <p className="eyebrow">Achievements</p>
          <h2>Progress snapshot</h2>
          <dl className="stats-grid compact">
            <div>
              <dt>Unlocked</dt>
              <dd>{achievementSummary.unlockedCount}</dd>
            </div>
            <div>
              <dt>In progress</dt>
              <dd>{achievementSummary.inProgressCount}</dd>
            </div>
            <div>
              <dt>Closest unlock</dt>
              <dd>{achievementSummary.nextUp?.definition.name ?? "No tracked progress"}</dd>
            </div>
          </dl>
        </article>
      </section>

      <section className="panel">
        <p className="eyebrow">Quick routes</p>
        <h2>Playtest coverage</h2>
        <div className="shortcut-list">
          <Link className="shortcut-card" href="/gangs">
            Create or inspect a gang, handle invites, and see current membership.
          </Link>
          <Link className="shortcut-card" href="/territory">
            Check district control, payout timers, and war state.
          </Link>
          <Link className="shortcut-card" href="/market">
            List owned items, browse active listings, and buy or cancel trades.
          </Link>
          <Link className="shortcut-card" href="/achievements">
            Review unlocked achievements and tracked progress.
          </Link>
          <Link className="shortcut-card" href="/missions">
            Accept and complete missions from current progress state.
          </Link>
          <Link className="shortcut-card" href="/activity">
            Read the persistent activity feed generated by backend events.
          </Link>
        </div>
      </section>

      <section className="panel">
        <p className="eyebrow">Recent activity</p>
        <h2>Latest feed entries</h2>
        {isLoading ? (
          <p className="muted">Loading activity...</p>
        ) : activity.length > 0 ? (
          <ul className="list">
            {activity.map((entry) => (
              <li key={entry.id} className="list-item">
                <div>
                  <strong>{entry.title}</strong>
                  <p className="muted">{entry.body}</p>
                </div>
                <span className="meta">{formatDateTime(entry.createdAt)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">No activity has been generated for this player yet.</p>
        )}
      </section>
    </AppShell>
  );
}
