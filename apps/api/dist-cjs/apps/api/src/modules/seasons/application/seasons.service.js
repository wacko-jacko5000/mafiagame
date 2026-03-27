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
exports.SeasonsService = void 0;
const common_1 = require("@nestjs/common");
const season_errors_1 = require("../domain/season.errors");
const seasons_repository_1 = require("./seasons.repository");
let SeasonsService = class SeasonsService {
    seasonsRepository;
    constructor(seasonsRepository) {
        this.seasonsRepository = seasonsRepository;
    }
    listSeasons() {
        return this.seasonsRepository.listSeasons();
    }
    getCurrentSeason() {
        return this.seasonsRepository.findCurrentSeason();
    }
    async getSeasonById(seasonId) {
        const season = await this.seasonsRepository.findSeasonById(seasonId);
        if (!season) {
            throw new common_1.NotFoundException(new season_errors_1.SeasonNotFoundError(seasonId).message);
        }
        return season;
    }
    async createSeason(input) {
        const normalizedName = input.name.trim();
        if (normalizedName.length === 0 || normalizedName.length > 64) {
            throw new common_1.BadRequestException(new season_errors_1.InvalidSeasonNameError().message);
        }
        if (input.startsAt && input.endsAt && input.endsAt <= input.startsAt) {
            throw new common_1.BadRequestException(new season_errors_1.InvalidSeasonWindowError().message);
        }
        return this.seasonsRepository.createSeason({
            ...input,
            name: normalizedName
        });
    }
    async activateSeason(seasonId) {
        const season = await this.getSeasonById(seasonId);
        if (season.status === "active") {
            return season;
        }
        const activatedSeason = await this.seasonsRepository.activateSeason(seasonId, new Date());
        if (!activatedSeason) {
            throw new common_1.NotFoundException(new season_errors_1.SeasonNotFoundError(seasonId).message);
        }
        return activatedSeason;
    }
    async deactivateSeason(seasonId) {
        const season = await this.getSeasonById(seasonId);
        if (season.status !== "active") {
            throw new common_1.ConflictException(new season_errors_1.SeasonAlreadyInactiveError(seasonId).message);
        }
        const deactivatedSeason = await this.seasonsRepository.deactivateSeason(seasonId, new Date());
        if (!deactivatedSeason) {
            throw new common_1.NotFoundException(new season_errors_1.SeasonNotFoundError(seasonId).message);
        }
        return deactivatedSeason;
    }
};
exports.SeasonsService = SeasonsService;
exports.SeasonsService = SeasonsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(seasons_repository_1.SEASONS_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], SeasonsService);
