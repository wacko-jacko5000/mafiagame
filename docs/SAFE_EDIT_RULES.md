# Safe Edit Rules

## Never do this

- Put authoritative game formulas in React components.
- Scatter balance constants across unrelated files.
- Couple a module to another module's persistence internals.
- Change rewards or penalties without updating tests and docs.

## Always do this

- Keep module ownership obvious.
- Prefer explicit naming for events, commands, and policies.
- Add comments only where the rule would otherwise be ambiguous.
- Document every non-obvious cross-module dependency.

## Escalation triggers

- Schema changes affecting multiple modules.
- New timed systems requiring worker semantics.
- Economy changes that alter faucets or sinks.
- Cross-client contract changes affecting future mobile support.
