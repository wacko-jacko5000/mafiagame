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
exports.PrismaAdminBalanceAuditRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../platform/database/prisma.service");
function toBalanceAuditLogEntry(record) {
    return {
        id: record.id,
        section: record.section,
        targetId: record.targetId,
        changedByAccountId: record.changedByAccountId,
        previousValue: record.previousValue,
        newValue: record.newValue,
        changedAt: record.changedAt
    };
}
let PrismaAdminBalanceAuditRepository = class PrismaAdminBalanceAuditRepository {
    prismaService;
    constructor(prismaService) {
        this.prismaService = prismaService;
    }
    async createEntries(entries) {
        if (entries.length === 0) {
            return;
        }
        const prismaClient = this.prismaService;
        await prismaClient.balanceChangeLog.createMany({
            data: [...entries]
        });
    }
    async listEntries(query) {
        const prismaClient = this.prismaService;
        return prismaClient.balanceChangeLog
            .findMany({
            where: {
                section: query.section,
                targetId: query.targetId
            },
            orderBy: {
                changedAt: "desc"
            },
            take: query.limit
        })
            .then((records) => records.map(toBalanceAuditLogEntry));
    }
};
exports.PrismaAdminBalanceAuditRepository = PrismaAdminBalanceAuditRepository;
exports.PrismaAdminBalanceAuditRepository = PrismaAdminBalanceAuditRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_service_1.PrismaService)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaAdminBalanceAuditRepository);
