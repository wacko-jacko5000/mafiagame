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
exports.PrismaCustodyBalanceRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../platform/database/prisma.service");
let PrismaCustodyBalanceRepository = class PrismaCustodyBalanceRepository {
    prismaService;
    constructor(prismaService) {
        this.prismaService = prismaService;
    }
    async listConfigs() {
        return this.prismaService.custodyBuyoutConfig.findMany();
    }
    async upsertConfig(config) {
        return this.prismaService.custodyBuyoutConfig.upsert({
            where: {
                statusType: config.statusType
            },
            create: config,
            update: {
                escalationEnabled: config.escalationEnabled,
                escalationPercentage: config.escalationPercentage,
                minimumPrice: config.minimumPrice,
                roundingRule: config.roundingRule
            }
        });
    }
    async listLevelBalances() {
        return this.prismaService.custodyBuyoutLevelBalance.findMany();
    }
    async upsertLevelBalance(balance) {
        return this.prismaService.custodyBuyoutLevelBalance.upsert({
            where: {
                statusType_level: {
                    statusType: balance.statusType,
                    level: balance.level
                }
            },
            create: balance,
            update: {
                basePricePerMinute: balance.basePricePerMinute
            }
        });
    }
};
exports.PrismaCustodyBalanceRepository = PrismaCustodyBalanceRepository;
exports.PrismaCustodyBalanceRepository = PrismaCustodyBalanceRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_service_1.PrismaService)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaCustodyBalanceRepository);
