# Auth Test Plan

- Unit: email normalization, password policy, hashing, and duplicate-registration rejection.
- Integration: register, login, and `GET /auth/me`.
- Security: invalid token, invalid credentials, and account-without-player access to `/me/*` gameplay routes.
