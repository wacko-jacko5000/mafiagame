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
exports.PrismaCombatRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../platform/database/prisma.service");
const hospital_policy_1 = require("../../hospital/domain/hospital.policy");
let PrismaCombatRepository = class PrismaCombatRepository {
    prismaService;
    constructor(prismaService) {
        this.prismaService = prismaService;
    }
    async applyAttack(command) {
        const prismaClient = this.prismaService;
        return prismaClient.$transaction(async (tx) => {
            const target = await tx.player.findUnique({
                where: {
                    id: command.targetId
                }
            });
            if (!target) {
                return null;
            }
            const targetHealthAfter = Math.max(0, target.health - command.damageDealt);
            const targetHospitalized = targetHealthAfter <= command.hospitalThreshold;
            const hospitalizedUntil = targetHospitalized
                ? (0, hospital_policy_1.buildHospitalReleaseTime)(command.now, command.hospitalDurationSeconds)
                : target.hospitalizedUntil;
            const updatedTarget = await tx.player.update({
                where: {
                    id: command.targetId
                },
                data: {
                    health: targetHealthAfter,
                    hospitalizedUntil,
                    ...(targetHospitalized
                        ? {
                            hospitalReason: command.hospitalReason,
                            hospitalEntryCount: {
                                increment: 1
                            }
                        }
                        : {})
                }
            });
            return {
                targetHealthBefore: target.health,
                targetHealthAfter: updatedTarget.health,
                targetHospitalized,
                hospitalizedUntil
            };
        });
    }
};
exports.PrismaCombatRepository = PrismaCombatRepository;
exports.PrismaCombatRepository = PrismaCombatRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_service_1.PrismaService)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaCombatRepository);
