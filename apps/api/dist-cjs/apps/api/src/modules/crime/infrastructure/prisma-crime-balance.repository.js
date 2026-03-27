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
exports.PrismaCrimeBalanceRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../platform/database/prisma.service");
let PrismaCrimeBalanceRepository = class PrismaCrimeBalanceRepository {
    prismaService;
    constructor(prismaService) {
        this.prismaService = prismaService;
    }
    async listCrimeBalances() {
        const prismaClient = this.prismaService;
        return prismaClient.crimeBalance.findMany({
            orderBy: {
                crimeId: "asc"
            }
        });
    }
    async upsertCrimeBalance(balance) {
        const prismaClient = this.prismaService;
        return prismaClient.crimeBalance.upsert({
            where: {
                crimeId: balance.crimeId
            },
            create: balance,
            update: {
                energyCost: balance.energyCost,
                successRate: balance.successRate,
                cashRewardMin: balance.cashRewardMin,
                cashRewardMax: balance.cashRewardMax,
                respectReward: balance.respectReward
            }
        });
    }
};
exports.PrismaCrimeBalanceRepository = PrismaCrimeBalanceRepository;
exports.PrismaCrimeBalanceRepository = PrismaCrimeBalanceRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_service_1.PrismaService)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaCrimeBalanceRepository);
