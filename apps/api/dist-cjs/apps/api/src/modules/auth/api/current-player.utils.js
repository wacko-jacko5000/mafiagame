"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireCurrentPlayerId = requireCurrentPlayerId;
const common_1 = require("@nestjs/common");
function requireCurrentPlayerId(actor) {
    if (!actor) {
        throw new common_1.UnauthorizedException("Authentication is required.");
    }
    if (!actor.playerId) {
        throw new common_1.ConflictException("Authenticated account does not own a player yet.");
    }
    return actor.playerId;
}
