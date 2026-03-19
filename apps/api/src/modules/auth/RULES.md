# Auth Rules

- Authentication does not create player progression automatically without an explicit player bootstrap flow.
- Auth owns account identity and session validation; it does not own player progression state.
- This phase uses revocable opaque bearer sessions, not OAuth, social login, password recovery, or 2FA.
- Admin access must be role-based and auditable.
- Session state must be revocable without requiring client trust.
