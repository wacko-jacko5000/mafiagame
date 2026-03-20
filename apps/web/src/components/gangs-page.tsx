"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { GangInvite, GangMember, PlayerGangMembership } from "../lib/api-types";
import { ApiError } from "../lib/api-client";
import { formatDateTime } from "../lib/formatters";
import { gameApi } from "../lib/game-api";
import { AppShell } from "./app-shell";
import { useSession } from "./providers/session-provider";

export function GangsPage() {
  const { account } = useSession();
  const playerId = account?.player?.id ?? null;
  const [gangMembership, setGangMembership] = useState<PlayerGangMembership | null>(null);
  const [members, setMembers] = useState<GangMember[]>([]);
  const [playerInvites, setPlayerInvites] = useState<GangInvite[]>([]);
  const [gangInvites, setGangInvites] = useState<GangInvite[]>([]);
  const [gangName, setGangName] = useState("");
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
      const [nextMembership, nextPlayerInvites] = await Promise.all([
        gameApi.gangs.getMembershipByPlayer(playerId),
        gameApi.gangs.listPlayerInvites(playerId)
      ]);

      setGangMembership(nextMembership);
      setPlayerInvites(nextPlayerInvites);

      if (!nextMembership) {
        setMembers([]);
        setGangInvites([]);
        return;
      }

      const nextMembers = await gameApi.gangs.listMembers(nextMembership.gang.id);
      setMembers(nextMembers);

      if (nextMembership.membership.role === "leader") {
        const nextGangInvites = await gameApi.gangs.listGangInvites(nextMembership.gang.id);
        setGangInvites(nextGangInvites);
      } else {
        setGangInvites([]);
      }
    } catch (nextError) {
      setError(nextError instanceof ApiError ? nextError.message : "Unable to load gang data.");
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
      setError(nextError instanceof ApiError ? nextError.message : "Unable to update gang state.");
    } finally {
      setActionKey(null);
    }
  }

  const isLeader = gangMembership?.membership.role === "leader";
  const pendingInvites = playerInvites.filter((invite) => invite.status === "pending");

  return (
    <AppShell
      title="Gangs"
      subtitle="Expose gang state, invites, and the minimum viable tester actions without inventing new client-side rules."
    >
      {error ? <p className="notice notice-error">{error}</p> : null}
      {notice ? <p className="notice">{notice}</p> : null}

      <section className="dashboard-grid">
        <article className="panel">
          <p className="eyebrow">Current state</p>
          <h2>{gangMembership ? gangMembership.gang.name : "No gang yet"}</h2>
          {isLoading ? (
            <p className="muted">Loading gang state...</p>
          ) : gangMembership ? (
            <dl className="stats-grid compact">
              <div>
                <dt>Role</dt>
                <dd>{gangMembership.membership.role}</dd>
              </div>
              <div>
                <dt>Members</dt>
                <dd>{gangMembership.gang.memberCount}</dd>
              </div>
              <div>
                <dt>Joined</dt>
                <dd>{formatDateTime(gangMembership.membership.joinedAt)}</dd>
              </div>
              <div>
                <dt>Pending invites</dt>
                <dd>{pendingInvites.length}</dd>
              </div>
            </dl>
          ) : (
            <p className="muted">
              Create a gang or accept an invite to unlock territory and social systems.
            </p>
          )}
        </article>

        <article className="panel">
          <p className="eyebrow">Invite flow</p>
          <h2>Player discovery</h2>
          <p className="muted">
            Leaders can invite players from the public leaderboard. Incoming invite decisions are handled below.
          </p>
          <Link className="button button-secondary" href="/leaderboard">
            Open leaderboard
          </Link>
        </article>
      </section>

      {!gangMembership ? (
        <section className="panel">
          <p className="eyebrow">Create gang</p>
          <h2>Start a crew</h2>
          <form
            className="stack"
            onSubmit={(event) => {
              event.preventDefault();
              if (!playerId) {
                return;
              }

              void runAction("create-gang", async () => {
                await gameApi.gangs.create(playerId, gangName);
                setGangName("");
                return "Gang created.";
              });
            }}
          >
            <label className="field">
              <span>Gang name</span>
              <input
                maxLength={24}
                placeholder="Night Owls"
                value={gangName}
                onChange={(event) => setGangName(event.target.value)}
              />
            </label>
            <button
              className="button"
              disabled={actionKey === "create-gang" || gangName.trim().length < 3}
              type="submit"
            >
              {actionKey === "create-gang" ? "Creating..." : "Create gang"}
            </button>
          </form>
        </section>
      ) : (
        <section className="panel">
          <div className="split-row">
            <div>
              <p className="eyebrow">Gang actions</p>
              <h2>Membership controls</h2>
              <p className="muted">
                Leaving is supported. Leaders can only leave when they are the last member.
              </p>
            </div>
            <button
              className="button button-secondary"
              disabled={actionKey === "leave-gang"}
              type="button"
              onClick={() =>
                playerId
                  ? void runAction("leave-gang", async () => {
                      const result = await gameApi.gangs.leave(gangMembership.gang.id, playerId);
                      return result.gangDeleted ? "Gang deleted after leaving." : "Left gang.";
                    })
                  : undefined
              }
            >
              {actionKey === "leave-gang" ? "Leaving..." : "Leave gang"}
            </button>
          </div>
        </section>
      )}

      <section className="panel">
        <p className="eyebrow">Incoming invites</p>
        <h2>Pending decisions</h2>
        {isLoading ? (
          <p className="muted">Loading invites...</p>
        ) : pendingInvites.length > 0 ? (
          <ul className="list">
            {pendingInvites.map((invite) => (
              <li key={invite.id} className="list-item">
                <div>
                  <strong>{invite.gangName}</strong>
                  <p className="muted">
                    Invited by {invite.invitedByPlayerDisplayName} on {formatDateTime(invite.createdAt)}
                  </p>
                </div>
                <div className="inline-actions">
                  <button
                    className="button"
                    disabled={actionKey === `accept-${invite.id}`}
                    type="button"
                    onClick={() =>
                      playerId
                        ? void runAction(`accept-${invite.id}`, async () => {
                            await gameApi.gangs.acceptInvite(invite.id, playerId);
                            return `Joined ${invite.gangName}.`;
                          })
                        : undefined
                    }
                  >
                    {actionKey === `accept-${invite.id}` ? "Accepting..." : "Accept"}
                  </button>
                  <button
                    className="button button-secondary"
                    disabled={actionKey === `decline-${invite.id}`}
                    type="button"
                    onClick={() =>
                      playerId
                        ? void runAction(`decline-${invite.id}`, async () => {
                            await gameApi.gangs.declineInvite(invite.id, playerId);
                            return `Declined invite from ${invite.gangName}.`;
                          })
                        : undefined
                    }
                  >
                    {actionKey === `decline-${invite.id}` ? "Declining..." : "Decline"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">No pending gang invites right now.</p>
        )}
      </section>

      {gangMembership ? (
        <>
          <section className="panel">
            <p className="eyebrow">Members</p>
            <h2>Current roster</h2>
            {members.length > 0 ? (
              <ul className="list">
                {members.map((member) => (
                  <li key={member.id} className="list-item">
                    <div>
                      <strong>{member.displayName}</strong>
                      <p className="muted">Role: {member.role}</p>
                    </div>
                    <span className="meta">{formatDateTime(member.joinedAt)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted">No membership rows were returned for this gang.</p>
            )}
          </section>

          {isLeader ? (
            <section className="panel">
              <p className="eyebrow">Outgoing invites</p>
              <h2>Leader visibility</h2>
              {gangInvites.length > 0 ? (
                <ul className="list">
                  {gangInvites.map((invite) => (
                    <li key={invite.id} className="list-item">
                      <div>
                        <strong>{invite.invitedPlayerDisplayName}</strong>
                        <p className="muted">
                          Invited by {invite.invitedByPlayerDisplayName} on {formatDateTime(invite.createdAt)}
                        </p>
                      </div>
                      <span className="status-pill">{invite.status}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted">
                  No outgoing invites yet. Use the <Link href="/leaderboard">leaderboard</Link> to send one.
                </p>
              )}
            </section>
          ) : null}
        </>
      ) : null}
    </AppShell>
  );
}
