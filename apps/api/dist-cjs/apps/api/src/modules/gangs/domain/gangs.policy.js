"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeGangName = normalizeGangName;
exports.validateGangName = validateGangName;
exports.buildCreateGangValues = buildCreateGangValues;
const gangs_errors_1 = require("./gangs.errors");
const GANG_NAME_PATTERN = /^[A-Za-z0-9 _-]+$/;
const MIN_GANG_NAME_LENGTH = 3;
const MAX_GANG_NAME_LENGTH = 24;
function normalizeGangName(name) {
    return name.trim().replace(/\s+/g, " ");
}
function validateGangName(name) {
    const normalizedName = normalizeGangName(name);
    if (normalizedName.length < MIN_GANG_NAME_LENGTH ||
        normalizedName.length > MAX_GANG_NAME_LENGTH ||
        !GANG_NAME_PATTERN.test(normalizedName)) {
        throw new gangs_errors_1.InvalidGangNameError();
    }
    return normalizedName;
}
function buildCreateGangValues(playerId, name) {
    return {
        playerId,
        name: validateGangName(name)
    };
}
