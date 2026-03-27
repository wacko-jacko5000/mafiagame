"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCreateSeasonRequest = parseCreateSeasonRequest;
const common_1 = require("@nestjs/common");
function parseCreateSeasonRequest(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw new common_1.BadRequestException("Season payload must be an object.");
    }
    const { name, startsAt, endsAt } = body;
    if (typeof name !== "string") {
        throw new common_1.BadRequestException("Season name is required.");
    }
    return {
        name,
        startsAt: parseOptionalDate(startsAt, "startsAt"),
        endsAt: parseOptionalDate(endsAt, "endsAt")
    };
}
function parseOptionalDate(value, fieldName) {
    if (value === undefined || value === null || value === "") {
        return null;
    }
    if (typeof value !== "string") {
        throw new common_1.BadRequestException(`${fieldName} must be an ISO-8601 date string.`);
    }
    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
        throw new common_1.BadRequestException(`${fieldName} must be an ISO-8601 date string.`);
    }
    return parsedDate;
}
