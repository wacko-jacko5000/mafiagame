"use client";

import { useEffect, useMemo, useState } from "react";

import type { District, PlayerGangMembership } from "../lib/api-types";
import { ApiError } from "../lib/api-client";
import { formatDateTime, formatMoney } from "../lib/formatters";
import { gameApi } from "../lib/game-api";
import { summarizeTerritory } from "../lib/game-state";
import { AppShell } from "./app-shell";
import { useSession } from "./providers/session-provider";

export function TerritoryPage() {
  const { account } = useSession();
  const playerId = account?.player?.id ?? null;
  const [gangMembership, setGangMembership] = useState<PlayerGangMembership | null>(null);
  const [districts, setDistricts] = useState<District[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionKey, setActionKey] = useState<string | null>(null);

  async function loadData() {
    if (!playerId) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [nextMembership, nextDistricts] = await Promise.all([
        gameApi.gangs.getMembershipByPlayer(playerId),
        gameApi.territory.listDistricts()
      ]);

      setGangMembership(nextMembership);
      setDistricts(nextDistricts);
    } catch (nextError) {
      setError(nextError instanceof ApiError ? nextError.message : "Unable to load territory.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, [playerId]);

  async function runAction(nextActionKey: string, action: () => Promise<string | null>) {
    setActionKey(nextActionKey);
    setError(null);
    setNotice(null);

    try {
      const nextNotice = await action();
      await loadData();
      if (nextNotice) {
        setNotice(nextNotice);
      }
    } catch (nextError) {
      setError(nextError instanceof ApiError ? nextError.message : "Unable to update territory.");
    } finally {
      setActionKey(null);
    }
  }

  const gangId = gangMembership?.gang.id ?? null;
  const isLeader = gangMembership?.membership.role === "leader";
  const summary = useMemo(() => summarizeTerritory(districts, gangId), [districts, gangId]);

  return (
    <AppShell
      title="Territory"
      subtitle="Surface district ownership, payout timers, and the minimal war state already supported by the backend."
    >
      {error ? <p className="notice notice-error">{error}</p> : null}
      {notice ? <p className="notice">{notice}</p> : null}

      <section className="dashboard-grid">
        <article className="panel">
          <p className="eyebrow">Gang status</p>
          <h2>{gangMembership ? gangMembership.gang.name : "No gang linked"}</h2>
          <p className="muted">
            {gangMembership
              ? `${gangMembership.membership.role} actions are used for claim, payout, and war starts.`
              : "Join or create a gang before attempting territory actions."}
          </p>
        </article>

        <article className="panel">
          <p className="eyebrow">Summary</p>
          <h2>District control</h2>
          <dl className="stats-grid compact">
            <div>
              <dt>Controlled</dt>
              <dd>{summary.controlledCount}</dd>
            </div>
            <div>
              <dt>Claimable payouts</dt>
              <dd>{summary.claimablePayoutCount}</dd>
            </div>
            <div>
              <dt>Active wars</dt>
              <dd>{summary.activeWarCount}</dd>
            </div>
          </dl>
        </article>
      </section>

      <section className="panel">
        <p className="eyebrow">Districts</p>
        <h2>World state</h2>
        {isLoading ? (
          <p className="muted">Loading districts...</p>
        ) : (
          <div className="card-grid">
            {districts.map((district) => {
              const isControlledByPlayerGang = district.controller?.gangId === gangId;
              const canClaim = Boolean(isLeader && gangId && !district.controller && !district.activeWar);
              const canClaimPayout = Boolean(isLeader && gangId && isControlledByPlayerGang);
              const canStartWar = Boolean(
                isLeader &&
                  gangId &&
                  district.controller &&
                  !isControlledByPlayerGang &&
                  !district.activeWar
              );

              return (
                <article key={district.id} className="subpanel stack compact-stack">
                  <div>
                    <h3>{district.name}</h3>
                    <p className="muted">
                      Controller: {district.controller ? district.controller.gangName : "Unclaimed"}
                    </p>
                  </div>
                  <dl className="stats-grid compact">
                    <div>
                      <dt>Payout</dt>
                      <dd>{formatMoney(district.payout.amount)}</dd>
                    </div>
                    <div>
                      <dt>Cooldown</dt>
                      <dd>{district.payout.cooldownMinutes}m</dd>
                    </div>
                    <div>
                      <dt>Next payout</dt>
                      <dd>
                        {district.payout.nextClaimAvailableAt
                          ? formatDateTime(district.payout.nextClaimAvailableAt)
                          : district.controller
                            ? "Ready now"
                            : "Unavailable"}
                      </dd>
                    </div>
                    <div>
                      <dt>War</dt>
                      <dd>
                        {district.activeWar
                          ? `${district.activeWar.attackerGangName} vs ${district.activeWar.defenderGangName}`
                          : "No active war"}
                      </dd>
                    </div>
                  </dl>
                  <div className="inline-actions">
                    <button
                      className="button"
                      disabled={!canClaim || actionKey === `claim-${district.id}`}
                      type="button"
                      onClick={() =>
                        playerId && gangId
                          ? void runAction(`claim-${district.id}`, async () => {
                              await gameApi.territory.claimDistrict(district.id, playerId, gangId);
                              return `${district.name} claimed for ${gangMembership?.gang.name}.`;
                            })
                          : undefined
                      }
                    >
                      {actionKey === `claim-${district.id}` ? "Claiming..." : "Claim"}
                    </button>
                    <button
                      className="button button-secondary"
                      disabled={!canClaimPayout || actionKey === `payout-${district.id}`}
                      type="button"
                      onClick={() =>
                        playerId && gangId
                          ? void runAction(`payout-${district.id}`, async () => {
                              const result = await gameApi.territory.claimPayout(
                                district.id,
                                playerId,
                                gangId
                              );
                              return `Collected ${formatMoney(result.payoutAmount)} from ${district.name}.`;
                            })
                          : undefined
                      }
                    >
                      {actionKey === `payout-${district.id}` ? "Collecting..." : "Claim payout"}
                    </button>
                    <button
                      className="button button-secondary"
                      disabled={!canStartWar || actionKey === `war-${district.id}`}
                      type="button"
                      onClick={() =>
                        playerId && gangId
                          ? void runAction(`war-${district.id}`, async () => {
                              await gameApi.territory.startWar(district.id, playerId, gangId);
                              return `Started a war for ${district.name}.`;
                            })
                          : undefined
                      }
                    >
                      {actionKey === `war-${district.id}` ? "Starting..." : "Start war"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </AppShell>
  );
}
