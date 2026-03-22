# Crime Rules

- Crime formulas must be catalog-driven and centrally documented.
- Crime execution resolves entirely on the backend.
- Starter crime definitions live in a centralized static catalog inside the crime module.
- Crime progression remains crime-owned and is defined as 4 explicit crimes per level for levels 1-21.
- Crime unlock state is derived from the player module's respect-based level, not persisted separately.
- A crime must validate player existence, crime existence, and available energy before execution.
- A crime must reject execution when the player's derived level is below the crime's `unlockLevel`.
- Crime affordability must use the player module's current lazily regenerated energy state, not stale stored energy.
- A crime must validate that the player is not actively jailed or hospitalized before execution.
- Energy is always consumed on an attempt.
- Success awards cash and respect.
- Failure awards no cash or respect.
- Failure consequences are explicit per crime and currently allow only `none`, `jail`, or `hospital`.
