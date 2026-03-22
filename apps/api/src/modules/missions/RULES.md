# Missions Rules

- Mission definitions are static and centralized for this phase.
- Mission progression remains mission-owned and is defined as 3 explicit missions per level for levels 1-21.
- Mission progress derives from explicit typed in-process domain events, not direct cross-module service calls.
- Mission objective evaluation may also read current module-owned state when the goal is inherently state-based, such as current cash, respect, equipment, gang membership, or district control.
- Only accepted missions track progress.
- Mission acceptance must reject players whose derived level is below the mission `unlockLevel`.
- Completion requires `progress >= targetProgress`.
- Rewards are granted through player-owned resource state, not direct mission table writes.
- Completed missions in this progression layer are one-off and cannot be accepted again.
- Event handling is synchronous and in-process for now; brokers, retries, outbox patterns, and workers are intentionally deferred.
