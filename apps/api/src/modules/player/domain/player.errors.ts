export class InvalidPlayerDisplayNameError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidPlayerDisplayNameError";
  }
}

export class PlayerDisplayNameTakenError extends Error {
  constructor(displayName: string) {
    super(`Player display name "${displayName}" is already taken.`);
    this.name = "PlayerDisplayNameTakenError";
  }
}

export class PlayerNotFoundError extends Error {
  constructor(playerId: string) {
    super(`Player "${playerId}" was not found.`);
    this.name = "PlayerNotFoundError";
  }
}

export class InvalidPlayerResourceDeltaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidPlayerResourceDeltaError";
  }
}

export class AccountAlreadyHasPlayerError extends Error {
  constructor() {
    super("Authenticated account already owns a player.");
    this.name = "AccountAlreadyHasPlayerError";
  }
}
