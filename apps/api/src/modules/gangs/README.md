# Gangs Module

## Purpose

Own gang creation, membership persistence, invite rules, simple gang roles, and member listing.

## Responsibilities

- Manage gang creation and membership.
- Manage gang invites and invite resolution.
- Enforce simple role and permission rules for `leader` and `member`.
- Expose gang summaries and member listings.

## Entities and value objects

- `Gang`
- `GangMember`
- `GangInvite`
- `GangRole`

## Dependencies

- `player`

## Events

- Out: `gangs.created`, `gangs.member.joined`, `gangs.member.left`, `gangs.invite.created`, `gangs.invite.accepted`, `gangs.invite.declined`
- In: none in this phase

## Temporary note

- Invite creation now also publishes a narrow `gangs.invite_received` internal event for the activity feed.
- Gang chat, invite reminders, officer permissions, and richer social messaging remain deferred.

## API surface

- Gang creation endpoint
- Join and leave membership endpoints
- Invite creation and invite resolution endpoints
- Gang summary and member listing queries

## Test expectations

- Membership invariants
- One-gang-per-player enforcement
- Leader-only invite enforcement
- One-pending-invite-per-player enforcement
- Leader leave behavior without role transfer
