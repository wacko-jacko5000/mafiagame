# LLM Guide

## Read this first

1. `docs/VISION.md`
2. `docs/ARCHITECTURE.md`
3. `docs/DEPENDENCY_MAP.md`
4. `docs/RUNTIME_SETUP.md` for runtime/bootstrap work
5. the target module's `README.md`, `RULES.md`, `API.md`, and `TESTPLAN.md`

## Working rules

- Identify the owning module before editing code.
- Keep business rules in backend/shared domain code.
- Update documentation in the same change as behavior.
- Make cross-module dependencies explicit.
- Prefer extending catalogs and contracts over ad hoc conditionals.

## Safe assumptions

- Backend API is authoritative.
- Realtime is eventual presentation of committed state.
- Mobile clients will consume the same backend contracts later.

## Unsafe assumptions

- Do not assume a React page owns business rules.
- Do not assume admin-only toggles can bypass audits or docs.
- Do not invent hidden timers, bonuses, or exceptions.
