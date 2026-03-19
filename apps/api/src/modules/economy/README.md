# Economy Module

## Purpose

Own currency balances, transfers, faucets, sinks, and transaction audit boundaries.

## Responsibilities

- Maintain authoritative balances.
- Apply credits, debits, and transfers.
- Classify economy events by faucet and sink source.

## Entities and value objects

- `Wallet`
- `TransactionLedgerEntry`
- `MoneyDelta`

## Dependencies

- `player`

## Events

- Out: `economy.balance.changed`, `economy.transfer.completed`
- In: `crime.resolved`, `businesses.payout.completed`, `territory.payout.completed`

## API surface

- Wallet reads
- Internal credit/debit/transfer commands
- Audit/export surfaces

## Test expectations

- Ledger consistency
- Atomic transfer behavior
- Faucet/sink accounting
