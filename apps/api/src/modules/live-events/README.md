# Live Events Module

## Purpose

Own scheduled and operator-driven global events that modify or focus active gameplay systems.

## Responsibilities

- Define event windows and modifiers.
- Coordinate start/stop lifecycle for live operations.
- Publish event state to territory, notifications, and future frontend surfaces.

## Entities and value objects

- `LiveEvent`
- `EventModifier`
- `EventWindow`

## Dependencies

- `admin-tools`, `notifications`

## Events

- Out: `live-events.started`, `live-events.ended`
- In: `admin-tools.event.published`

## API surface

- Live event read endpoints
- Start/stop admin commands
- Worker scheduling hooks

## Test expectations

- Window scheduling
- Modifier activation
- Replay-safe lifecycle handling
