"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountAlreadyHasPlayerError = exports.InvalidPlayerResourceDeltaError = exports.PlayerNotFoundError = exports.PlayerDisplayNameTakenError = exports.InvalidPlayerDisplayNameError = void 0;
class InvalidPlayerDisplayNameError extends Error {
    constructor(message) {
        super(message);
        this.name = "InvalidPlayerDisplayNameError";
    }
}
exports.InvalidPlayerDisplayNameError = InvalidPlayerDisplayNameError;
class PlayerDisplayNameTakenError extends Error {
    constructor(displayName) {
        super(`Player display name "${displayName}" is already taken.`);
        this.name = "PlayerDisplayNameTakenError";
    }
}
exports.PlayerDisplayNameTakenError = PlayerDisplayNameTakenError;
class PlayerNotFoundError extends Error {
    constructor(playerId) {
        super(`Player "${playerId}" was not found.`);
        this.name = "PlayerNotFoundError";
    }
}
exports.PlayerNotFoundError = PlayerNotFoundError;
class InvalidPlayerResourceDeltaError extends Error {
    constructor(message) {
        super(message);
        this.name = "InvalidPlayerResourceDeltaError";
    }
}
exports.InvalidPlayerResourceDeltaError = InvalidPlayerResourceDeltaError;
class AccountAlreadyHasPlayerError extends Error {
    constructor() {
        super("Authenticated account already owns a player.");
        this.name = "AccountAlreadyHasPlayerError";
    }
}
exports.AccountAlreadyHasPlayerError = AccountAlreadyHasPlayerError;
