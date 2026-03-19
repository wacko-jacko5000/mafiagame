# Economy Rules

- Every balance mutation must record a classified source.
- Transfers must be atomic and idempotent where retries are possible.
- No gameplay module may mutate currency directly outside economy-owned APIs.
