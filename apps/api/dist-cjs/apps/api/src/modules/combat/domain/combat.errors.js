"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TargetHospitalizedError = exports.AttackerHospitalizedError = exports.AttackerJailedError = exports.SelfAttackNotAllowedError = void 0;
class SelfAttackNotAllowedError extends Error {
    constructor() {
        super("Players cannot attack themselves.");
        this.name = "SelfAttackNotAllowedError";
    }
}
exports.SelfAttackNotAllowedError = SelfAttackNotAllowedError;
class AttackerJailedError extends Error {
    constructor(until) {
        super(`Attacker cannot initiate combat while jailed until ${until.toISOString()}.`);
        this.name = "AttackerJailedError";
    }
}
exports.AttackerJailedError = AttackerJailedError;
class AttackerHospitalizedError extends Error {
    constructor(until) {
        super(`Attacker cannot initiate combat while hospitalized until ${until.toISOString()}.`);
        this.name = "AttackerHospitalizedError";
    }
}
exports.AttackerHospitalizedError = AttackerHospitalizedError;
class TargetHospitalizedError extends Error {
    constructor(until) {
        super(`Target cannot be attacked while hospitalized until ${until.toISOString()}.`);
        this.name = "TargetHospitalizedError";
    }
}
exports.TargetHospitalizedError = TargetHospitalizedError;
