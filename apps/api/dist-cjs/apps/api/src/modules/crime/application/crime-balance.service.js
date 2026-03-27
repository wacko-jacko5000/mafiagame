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
exports.CrimeBalanceService = void 0;
const common_1 = require("@nestjs/common");
const crime_catalog_1 = require("../domain/crime.catalog");
const crime_balance_repository_1 = require("./crime-balance.repository");
function cloneCrimeDefinition(crime) {
    return {
        ...crime,
        failureConsequence: { ...crime.failureConsequence }
    };
}
function assertPositiveInteger(value, fieldName) {
    if (!Number.isInteger(value) || value <= 0) {
        throw new common_1.BadRequestException(`${fieldName} must be a positive whole number.`);
    }
}
function assertNonNegativeInteger(value, fieldName) {
    if (!Number.isInteger(value) || value < 0) {
        throw new common_1.BadRequestException(`${fieldName} must be a non-negative whole number.`);
    }
}
let CrimeBalanceService = class CrimeBalanceService {
    crimeBalanceRepository;
    constructor(crimeBalanceRepository) {
        this.crimeBalanceRepository = crimeBalanceRepository;
    }
    async onModuleInit() {
        const persistedBalances = await this.crimeBalanceRepository.listCrimeBalances();
        for (const balance of persistedBalances) {
            (0, crime_catalog_1.applyCrimeBalanceOverride)(balance.crimeId, {
                energyCost: balance.energyCost,
                successRate: balance.successRate,
                minReward: balance.cashRewardMin,
                maxReward: balance.cashRewardMax,
                respectReward: balance.respectReward
            });
        }
    }
    listCrimeBalances() {
        return crime_catalog_1.starterCrimeCatalog.map(cloneCrimeDefinition);
    }
    async updateCrimeBalances(updates) {
        for (const update of updates) {
            const crime = (0, crime_catalog_1.getCrimeById)(update.id);
            if (!crime) {
                throw new common_1.NotFoundException(`Crime "${update.id}" was not found.`);
            }
            const nextCrime = {
                ...crime,
                energyCost: update.energyCost ?? crime.energyCost,
                successRate: update.successRate ?? crime.successRate,
                minReward: update.minReward ?? update.cashRewardMin ?? crime.minReward,
                maxReward: update.maxReward ?? update.cashRewardMax ?? crime.maxReward,
                respectReward: update.respectReward ?? crime.respectReward
            };
            assertPositiveInteger(nextCrime.energyCost, `Crime "${crime.id}" energyCost`);
            if (typeof nextCrime.successRate !== "number" ||
                Number.isNaN(nextCrime.successRate) ||
                nextCrime.successRate < 0 ||
                nextCrime.successRate > 1) {
                throw new common_1.BadRequestException(`Crime "${crime.id}" successRate must be between 0 and 1.`);
            }
            assertNonNegativeInteger(nextCrime.minReward, `Crime "${crime.id}" minReward`);
            assertNonNegativeInteger(nextCrime.maxReward, `Crime "${crime.id}" maxReward`);
            assertNonNegativeInteger(nextCrime.respectReward, `Crime "${crime.id}" respectReward`);
            if (nextCrime.minReward > nextCrime.maxReward) {
                throw new common_1.BadRequestException(`Crime "${crime.id}" minReward must be less than or equal to maxReward.`);
            }
            await this.crimeBalanceRepository.upsertCrimeBalance({
                crimeId: crime.id,
                energyCost: nextCrime.energyCost,
                successRate: nextCrime.successRate,
                cashRewardMin: nextCrime.minReward,
                cashRewardMax: nextCrime.maxReward,
                respectReward: nextCrime.respectReward
            });
            (0, crime_catalog_1.applyCrimeBalanceOverride)(crime.id, {
                energyCost: nextCrime.energyCost,
                successRate: nextCrime.successRate,
                minReward: nextCrime.minReward,
                maxReward: nextCrime.maxReward,
                respectReward: nextCrime.respectReward
            });
        }
        return this.listCrimeBalances();
    }
};
exports.CrimeBalanceService = CrimeBalanceService;
exports.CrimeBalanceService = CrimeBalanceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(crime_balance_repository_1.CRIME_BALANCE_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], CrimeBalanceService);
