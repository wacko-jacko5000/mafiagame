"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeasonAlreadyInactiveError = exports.InvalidSeasonWindowError = exports.InvalidSeasonNameError = exports.SeasonNotFoundError = void 0;
class SeasonNotFoundError extends Error {
    constructor(seasonId) {
        super(`Season "${seasonId}" was not found.`);
        this.name = "SeasonNotFoundError";
    }
}
exports.SeasonNotFoundError = SeasonNotFoundError;
class InvalidSeasonNameError extends Error {
    constructor() {
        super("Season name must be between 1 and 64 characters.");
        this.name = "InvalidSeasonNameError";
    }
}
exports.InvalidSeasonNameError = InvalidSeasonNameError;
class InvalidSeasonWindowError extends Error {
    constructor() {
        super("Season end date must be later than the start date.");
        this.name = "InvalidSeasonWindowError";
    }
}
exports.InvalidSeasonWindowError = InvalidSeasonWindowError;
class SeasonAlreadyInactiveError extends Error {
    constructor(seasonId) {
        super(`Season "${seasonId}" is not currently active.`);
        this.name = "SeasonAlreadyInactiveError";
    }
}
exports.SeasonAlreadyInactiveError = SeasonAlreadyInactiveError;
