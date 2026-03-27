"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerJailedError = void 0;
class PlayerJailedError extends Error {
    constructor(until) {
        super(`Player is jailed until ${until.toISOString()}.`);
        this.name = "PlayerJailedError";
    }
}
exports.PlayerJailedError = PlayerJailedError;
