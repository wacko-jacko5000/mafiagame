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
exports.TerritoryBalanceService = void 0;
const common_1 = require("@nestjs/common");
const territory_repository_1 = require("./territory.repository");
let TerritoryBalanceService = class TerritoryBalanceService {
    territoryRepository;
    constructor(territoryRepository) {
        this.territoryRepository = territoryRepository;
    }
    async listDistrictBalances() {
        return this.territoryRepository.listDistricts();
    }
    async updateDistrictBalances(updates) {
        for (const update of updates) {
            const district = await this.territoryRepository.findDistrictById(update.id);
            if (!district) {
                throw new common_1.NotFoundException(`District "${update.id}" was not found.`);
            }
            const payoutAmount = update.payoutAmount ?? district.payoutAmount;
            const payoutCooldownMinutes = update.payoutCooldownMinutes ?? district.payoutCooldownMinutes;
            if (!Number.isInteger(payoutAmount) || payoutAmount <= 0) {
                throw new common_1.BadRequestException(`District "${district.id}" payoutAmount must be a positive whole number.`);
            }
            if (!Number.isInteger(payoutCooldownMinutes) || payoutCooldownMinutes <= 0) {
                throw new common_1.BadRequestException(`District "${district.id}" payoutCooldownMinutes must be a positive whole number.`);
            }
            const updatedDistrict = await this.territoryRepository.updateDistrictBalance({
                districtId: district.id,
                payoutAmount,
                payoutCooldownMinutes
            });
            if (!updatedDistrict) {
                throw new common_1.NotFoundException(`District "${district.id}" was not found.`);
            }
        }
        return this.listDistrictBalances();
    }
};
exports.TerritoryBalanceService = TerritoryBalanceService;
exports.TerritoryBalanceService = TerritoryBalanceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(territory_repository_1.TERRITORY_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], TerritoryBalanceService);
