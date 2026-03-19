# Crime Rules

- Crime formulas must be catalog-driven and centrally documented.
- Crime execution resolves entirely on the backend.
- Starter crime definitions live in a centralized static catalog inside the crime module.
- A crime must validate player existence, crime existence, and available energy before execution.
- Crime affordability must use the player module's current lazily regenerated energy state, not stale stored energy.
- A crime must validate that the player is not actively jailed or hospitalized before execution.
- Energy is always consumed on an attempt.
- Success awards cash and respect.
- Failure awards no cash or respect.
- Failure consequences are explicit per crime and currently allow only `none`, `jail`, or `hospital`.
