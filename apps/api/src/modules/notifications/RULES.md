# Notifications Rules

- Activity entries are advisory and must never become the sole source of gameplay truth.
- Feed creation must stay event-driven and explicit; not every gameplay event belongs in the feed.
- Phase 1 entries must stay simple enough for web and future mobile clients to render without templating logic.
- `readAt` is the only read-state tracked in this phase; preferences, channels, and delivery attempts are deferred.
