# Missions Rules

- Mission definitions are static and centralized for this phase.
- Mission progress derives from explicit typed in-process domain events, not direct cross-module service calls.
- Only accepted missions track progress.
- Completion requires `progress >= targetProgress`.
- Rewards are granted through player-owned resource state, not direct mission table writes.
- Completed one-off missions cannot be accepted again.
- Repeatable missions can be accepted again only after their previous run is completed.
- Event handling is synchronous and in-process for now; brokers, retries, outbox patterns, and workers are intentionally deferred.
