# Achievements Rules

- Achievement definitions are static and centralized for this phase.
- Achievement progress is driven only by explicit typed in-process domain events.
- Progress is cumulative and count-based in this first phase.
- Unlocking is automatic once `progress >= targetProgress`.
- Unlocked achievements must not unlock twice.
- Achievements do not grant rewards, claim actions, badge UI metadata, hidden states, seasonal logic, analytics dashboards, or leaderboard effects in this phase.
- Event handling is synchronous and in-process for now; brokers, retries, outbox patterns, and workers are intentionally deferred.
