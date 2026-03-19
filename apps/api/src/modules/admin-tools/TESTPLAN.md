# Admin Tools Test Plan

- Controller: reject missing admin token and accept valid token.
- Controller: expose an audit read route behind the same admin token gate.
- Service: validate section-specific request bodies before delegating.
- Integration: update crime catalog values, district payout values, and starter item prices through module-owned balance services.
- Integration: write one audit row per successfully updated balance target.
- Security: fail closed when admin access is not configured and reject unknown sections or invalid field values.
