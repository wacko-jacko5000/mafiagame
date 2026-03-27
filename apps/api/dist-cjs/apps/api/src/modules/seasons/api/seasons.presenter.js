"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toSeasonResponseBody = toSeasonResponseBody;
function toSeasonResponseBody(season) {
    return {
        id: season.id,
        name: season.name,
        status: season.status,
        startsAt: season.startsAt?.toISOString() ?? null,
        endsAt: season.endsAt?.toISOString() ?? null,
        activatedAt: season.activatedAt?.toISOString() ?? null,
        deactivatedAt: season.deactivatedAt?.toISOString() ?? null,
        createdAt: season.createdAt.toISOString()
    };
}
