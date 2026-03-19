export class PlayerJailedError extends Error {
  constructor(until: Date) {
    super(`Player is jailed until ${until.toISOString()}.`);
    this.name = "PlayerJailedError";
  }
}
