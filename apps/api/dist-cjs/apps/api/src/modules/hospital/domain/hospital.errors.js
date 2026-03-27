"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerHospitalizedError = void 0;
class PlayerHospitalizedError extends Error {
    constructor(until) {
        super(`Player is hospitalized until ${until.toISOString()}.`);
        this.name = "PlayerHospitalizedError";
    }
}
exports.PlayerHospitalizedError = PlayerHospitalizedError;
