# Auth Module

## Purpose

Own identity, sessions, and authorization boundaries for the platform.

## Responsibilities

- Authenticate accounts with email + password.
- Issue revocable bearer-backed sessions for prototype and early alpha use.
- Separate platform account identity from game-specific player state.
- Resolve authenticated account and current-player ownership for downstream modules.

## Entities and value objects

- `AccountIdentity`
- `Session`
- `AccessScope`
- `Account`
- `AccountSession`

## Dependencies

- None upstream for domain rules.

## Events

- Out: `auth.session.started`, `auth.session.ended`
- In: none

## API surface

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `AuthGuard` / `OptionalAuthGuard` for downstream controllers

## Test expectations

- Credential validation and password hashing
- Duplicate registration and invalid credential rejection
- Authenticated account resolution and current-player visibility
