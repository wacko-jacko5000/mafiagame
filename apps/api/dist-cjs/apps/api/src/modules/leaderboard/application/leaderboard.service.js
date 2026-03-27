"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaderboardService = void 0;
const common_1 = require("@nestjs/common");
const leaderboard_catalog_1 = require("../domain/leaderboard.catalog");
const leaderboard_repository_1 = require("./leaderboard.repository");
let LeaderboardService = class LeaderboardService {
    leaderboardRepository;
    constructor(leaderboardRepository) {
        this.leaderboardRepository = leaderboardRepository;
    }
    listLeaderboards() {
        return leaderboard_catalog_1.leaderboardDefinitions;
    }
    async getLeaderboard(leaderboardId, requestedLimit) {
        const definition = (0, leaderboard_catalog_1.getLeaderboardDefinition)(leaderboardId);
        if (!definition) {
            throw new common_1.NotFoundException(`Leaderboard "${leaderboardId}" was not found.`);
        }
        const limit = this.normalizeLimit(requestedLimit, definition);
        const records = await this.leaderboardRepository.listLeaderboardRecords(definition.id, limit);
        return {
            definition,
            limit,
            entries: records.map((record, index) => ({
                rank: index + 1,
                playerId: record.playerId,
                displayName: record.displayName,
                metricValue: record.metricValue
            }))
        };
    }
    normalizeLimit(requestedLimit, definition) {
        if (requestedLimit === undefined) {
            return definition.defaultLimit;
        }
        if (!Number.isInteger(requestedLimit) || requestedLimit <= 0) {
            throw new common_1.BadRequestException("Leaderboard limit must be a positive integer.");
        }
        return Math.min(requestedLimit, definition.maxLimit);
    }
};
exports.LeaderboardService = LeaderboardService;
exports.LeaderboardService = LeaderboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(leaderboard_repository_1.LEADERBOARD_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], LeaderboardService);
