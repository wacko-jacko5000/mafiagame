# Admin Tools Test Plan

- Controller: reject missing authentication and non-admin accounts.
- Controller: expose an audit read route behind the same admin-role gate.
- Controller: expose sticky menu public reads without admin auth and protect sticky menu writes behind the admin-role gate.
- Service: validate section-specific request bodies before delegating.
- Service: reject duplicate sticky menu placements, unsafe keys, missing `more` coupling, and oversized primary nav layouts.
- Integration: update crime catalog values, district payout values, and starter item prices through module-owned balance services.
- Integration: persist sticky menu config and hydrate defaults when no row exists yet.
- Integration: write one audit row per successfully updated balance target.
- Security: fail closed for non-admin accounts and reject unknown sections or invalid field values.
