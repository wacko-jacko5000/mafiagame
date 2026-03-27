"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrimeUnavailableWhileHospitalizedError = exports.CrimeUnavailableWhileJailedError = exports.InsufficientCrimeEnergyError = exports.CrimeLevelLockedError = exports.CrimeNotFoundError = void 0;
class CrimeNotFoundError extends Error {
    constructor(crimeId) {
        super(`Crime "${crimeId}" was not found.`);
        this.name = "CrimeNotFoundError";
    }
}
exports.CrimeNotFoundError = CrimeNotFoundError;
class CrimeLevelLockedError extends Error {
    constructor(crimeName, unlockLevel) {
        super(`Crime "${crimeName}" unlocks at level ${unlockLevel}.`);
        this.name = "CrimeLevelLockedError";
    }
}
exports.CrimeLevelLockedError = CrimeLevelLockedError;
class InsufficientCrimeEnergyError extends Error {
    constructor(crimeId) {
        super(`Player does not have enough energy to execute "${crimeId}".`);
        this.name = "InsufficientCrimeEnergyError";
    }
}
exports.InsufficientCrimeEnergyError = InsufficientCrimeEnergyError;
class CrimeUnavailableWhileJailedError extends Error {
    constructor(until) {
        super(`Player cannot execute crimes while jailed until ${until.toISOString()}.`);
        this.name = "CrimeUnavailableWhileJailedError";
    }
}
exports.CrimeUnavailableWhileJailedError = CrimeUnavailableWhileJailedError;
class CrimeUnavailableWhileHospitalizedError extends Error {
    constructor(until) {
        super(`Player cannot execute crimes while hospitalized until ${until.toISOString()}.`);
        this.name = "CrimeUnavailableWhileHospitalizedError";
    }
}
exports.CrimeUnavailableWhileHospitalizedError = CrimeUnavailableWhileHospitalizedError;
