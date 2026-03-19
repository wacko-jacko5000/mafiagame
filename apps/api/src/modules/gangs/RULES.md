# Gangs Rules

- Gang membership is persisted in gang-owned tables and must not be embedded into player records.
- A player can belong to only one gang at a time.
- Gang creation assigns the creator as `leader`.
- Gang roles are currently limited to `leader` and `member`.
- Invite state is persisted in gang-owned invite rows, not on players.
- Only gang leaders can send invites.
- A player can have only one pending gang invite at a time.
- Accepting an invite creates gang membership and marks the invite accepted.
- Declining an invite marks it declined and preserves the record.
- Leaders cannot leave while other members remain because promotion and transfer flows are not implemented yet.
- If the leader is the only member, leaving deletes the now-empty gang.
- Officer roles, invite expiry jobs, notifications, territory permission integration, gang wars, combat bonuses, shared inventory, economy, and chat are intentionally out of scope.
