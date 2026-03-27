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
exports.PrismaAuthRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../platform/database/prisma.service");
function toAccountSnapshot(account) {
    return {
        id: account.id,
        email: account.email,
        passwordHash: account.passwordHash,
        isAdmin: account.isAdmin,
        createdAt: account.createdAt,
        updatedAt: account.updatedAt,
        player: account.player
            ? {
                id: account.player.id,
                displayName: account.player.displayName
            }
            : null
    };
}
let PrismaAuthRepository = class PrismaAuthRepository {
    prismaService;
    constructor(prismaService) {
        this.prismaService = prismaService;
    }
    async createAccount(values) {
        const account = await this.prismaService.account.create({
            data: values,
            include: {
                player: {
                    select: {
                        id: true,
                        displayName: true
                    }
                }
            }
        });
        return toAccountSnapshot(account);
    }
    async createSession(values) {
        await this.prismaService.accountSession.create({
            data: values
        });
    }
    async findAccountByEmail(email) {
        const account = await this.prismaService.account.findUnique({
            where: {
                email
            },
            include: {
                player: {
                    select: {
                        id: true,
                        displayName: true
                    }
                }
            }
        });
        return account ? toAccountSnapshot(account) : null;
    }
    async findAccountById(accountId) {
        const account = await this.prismaService.account.findUnique({
            where: {
                id: accountId
            },
            include: {
                player: {
                    select: {
                        id: true,
                        displayName: true
                    }
                }
            }
        });
        return account ? toAccountSnapshot(account) : null;
    }
    async markAccountAsAdmin(accountId) {
        const account = await this.prismaService.account.update({
            where: {
                id: accountId
            },
            data: {
                isAdmin: true
            },
            include: {
                player: {
                    select: {
                        id: true,
                        displayName: true
                    }
                }
            }
        });
        return toAccountSnapshot(account);
    }
    async findAccountByActiveSessionTokenHash(tokenHash, now) {
        const session = await this.prismaService.accountSession.findFirst({
            where: {
                tokenHash,
                revokedAt: null,
                expiresAt: {
                    gt: now
                }
            },
            include: {
                account: {
                    include: {
                        player: {
                            select: {
                                id: true,
                                displayName: true
                            }
                        }
                    }
                }
            }
        });
        return session ? toAccountSnapshot(session.account) : null;
    }
};
exports.PrismaAuthRepository = PrismaAuthRepository;
exports.PrismaAuthRepository = PrismaAuthRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_service_1.PrismaService)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaAuthRepository);
