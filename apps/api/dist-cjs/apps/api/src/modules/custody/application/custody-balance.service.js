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
exports.CustodyBalanceService = void 0;
const common_1 = require("@nestjs/common");
const player_rank_catalog_1 = require("../../player/domain/player-rank.catalog");
const custody_balance_repository_1 = require("./custody-balance.repository");
const custody_buyout_catalog_1 = require("../domain/custody-buyout.catalog");
const custody_buyout_policy_1 = require("../domain/custody-buyout.policy");
const custody_types_1 = require("../domain/custody.types");
let CustodyBalanceService = class CustodyBalanceService {
    custodyBalanceRepository;
    configOverrides = new Map();
    levelOverrides = new Map();
    constructor(custodyBalanceRepository) {
        this.custodyBalanceRepository = custodyBalanceRepository;
    }
    async onModuleInit() {
        const [configs, levelBalances] = await Promise.all([
            this.custodyBalanceRepository.listConfigs(),
            this.custodyBalanceRepository.listLevelBalances()
        ]);
        for (const config of configs) {
            this.configOverrides.set(config.statusType, {
                escalationEnabled: config.escalationEnabled,
                escalationPercentage: config.escalationPercentage,
                minimumPrice: config.minimumPrice,
                roundingRule: config.roundingRule
            });
        }
        for (const balance of levelBalances) {
            this.levelOverrides.set(this.getLevelKey(balance.statusType, balance.level), balance.basePricePerMinute);
        }
    }
    listStatusConfigs() {
        return custody_types_1.custodyStatusTypes.map((statusType) => this.getStatusConfig(statusType));
    }
    getStatusConfig(statusType) {
        const defaults = (0, custody_buyout_catalog_1.buildDefaultCustodyBuyoutConfig)(statusType);
        const configOverride = this.configOverrides.get(statusType);
        return {
            ...defaults,
            escalationEnabled: configOverride?.escalationEnabled ?? defaults.escalationEnabled,
            escalationPercentage: configOverride?.escalationPercentage ?? defaults.escalationPercentage,
            minimumPrice: configOverride?.minimumPrice ?? defaults.minimumPrice,
            roundingRule: configOverride?.roundingRule ?? defaults.roundingRule,
            levels: defaults.levels.map((levelConfig) => ({
                ...levelConfig,
                basePricePerMinute: this.levelOverrides.get(this.getLevelKey(statusType, levelConfig.level)) ??
                    levelConfig.basePricePerMinute
            }))
        };
    }
    async updateBalances(updates) {
        for (const update of updates) {
            const current = this.getStatusConfig(update.statusType);
            const nextEscalationEnabled = update.escalationEnabled ?? current.escalationEnabled;
            const nextEscalationPercentage = update.escalationPercentage ?? current.escalationPercentage;
            const nextMinimumPrice = update.minimumPrice === undefined ? current.minimumPrice : update.minimumPrice;
            const nextRoundingRule = update.roundingRule ?? current.roundingRule;
            this.assertEscalationPercentage(nextEscalationPercentage, update.statusType);
            this.assertMinimumPrice(nextMinimumPrice, update.statusType);
            this.assertRoundingRule(nextRoundingRule, update.statusType);
            await this.custodyBalanceRepository.upsertConfig({
                statusType: update.statusType,
                escalationEnabled: nextEscalationEnabled,
                escalationPercentage: nextEscalationPercentage,
                minimumPrice: nextMinimumPrice,
                roundingRule: nextRoundingRule
            });
            this.configOverrides.set(update.statusType, {
                escalationEnabled: nextEscalationEnabled,
                escalationPercentage: nextEscalationPercentage,
                minimumPrice: nextMinimumPrice,
                roundingRule: nextRoundingRule
            });
            for (const levelUpdate of update.levels ?? []) {
                const rank = player_rank_catalog_1.playerRankCatalog.find((entry) => entry.level === levelUpdate.level);
                if (!rank) {
                    throw new common_1.BadRequestException(`Unknown level "${levelUpdate.level}" for ${update.statusType} buyout pricing.`);
                }
                this.assertBasePrice(levelUpdate.basePricePerMinute, update.statusType, levelUpdate.level);
                await this.custodyBalanceRepository.upsertLevelBalance({
                    statusType: update.statusType,
                    level: levelUpdate.level,
                    basePricePerMinute: levelUpdate.basePricePerMinute
                });
                this.levelOverrides.set(this.getLevelKey(update.statusType, levelUpdate.level), levelUpdate.basePricePerMinute);
            }
        }
        return this.listStatusConfigs();
    }
    buildQuote(input) {
        const config = this.getStatusConfig(input.statusType);
        if (!input.active || !input.until || input.remainingSeconds <= 0) {
            return (0, custody_buyout_policy_1.buildInactiveCustodyBuyoutQuote)(input.statusType, config);
        }
        const levelConfig = config.levels.find((entry) => entry.level === input.playerLevel) ??
            config.levels[config.levels.length - 1];
        const basePricePerMinute = levelConfig?.basePricePerMinute ??
            (0, custody_buyout_policy_1.getDefaultBasePricePerMinute)(input.statusType, input.playerLevel);
        const currentPricePerMinute = (0, custody_buyout_policy_1.calculateCustodyPricePerMinute)({
            basePricePerMinute,
            entryCountSinceLevelReset: input.entryCountSinceLevelReset,
            escalationEnabled: config.escalationEnabled,
            escalationPercentage: config.escalationPercentage
        });
        const buyoutPrice = (0, custody_buyout_policy_1.calculateCustodyBuyoutPrice)({
            remainingSeconds: input.remainingSeconds,
            currentPricePerMinute,
            minimumPrice: config.minimumPrice,
            roundingRule: config.roundingRule
        });
        return {
            statusType: input.statusType,
            active: true,
            until: input.until,
            remainingSeconds: input.remainingSeconds,
            reason: input.reason,
            entryCountSinceLevelReset: input.entryCountSinceLevelReset,
            repeatCountSinceLevelReset: (0, custody_buyout_policy_1.getRepeatCountSinceLevelReset)(input.entryCountSinceLevelReset),
            basePricePerMinute,
            currentPricePerMinute,
            escalationEnabled: config.escalationEnabled,
            escalationPercentage: config.escalationPercentage,
            minimumPrice: config.minimumPrice,
            roundingRule: config.roundingRule,
            buyoutPrice
        };
    }
    getLevelKey(statusType, level) {
        return `${statusType}:${level}`;
    }
    assertEscalationPercentage(value, statusType) {
        if (typeof value !== "number" || Number.isNaN(value) || value < 0 || value > 1) {
            throw new common_1.BadRequestException(`${statusType} escalationPercentage must be a number between 0 and 1.`);
        }
    }
    assertMinimumPrice(value, statusType) {
        if (value === null) {
            return;
        }
        if (!Number.isInteger(value) || value < 0) {
            throw new common_1.BadRequestException(`${statusType} minimumPrice must be a non-negative whole number or null.`);
        }
    }
    assertRoundingRule(value, statusType) {
        if (!custody_types_1.custodyBuyoutRoundingRules.includes(value)) {
            throw new common_1.BadRequestException(`${statusType} roundingRule must be one of: ${custody_types_1.custodyBuyoutRoundingRules.join(", ")}.`);
        }
    }
    assertBasePrice(value, statusType, level) {
        if (!Number.isInteger(value) || value <= 0) {
            throw new common_1.BadRequestException(`${statusType} basePricePerMinute for level ${level} must be a positive whole number.`);
        }
    }
};
exports.CustodyBalanceService = CustodyBalanceService;
exports.CustodyBalanceService = CustodyBalanceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(custody_balance_repository_1.CUSTODY_BALANCE_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], CustodyBalanceService);
