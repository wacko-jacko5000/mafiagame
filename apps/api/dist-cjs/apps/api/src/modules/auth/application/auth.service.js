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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const auth_repository_1 = require("./auth.repository");
const auth_errors_1 = require("../domain/auth.errors");
const auth_policy_1 = require("../domain/auth.policy");
let AuthService = class AuthService {
    authRepository;
    configService;
    constructor(authRepository, configService) {
        this.authRepository = authRepository;
        this.configService = configService;
    }
    async register(command) {
        try {
            const email = (0, auth_policy_1.normalizeEmail)(command.email);
            const existingAccount = await this.authRepository.findAccountByEmail(email);
            if (existingAccount) {
                throw new auth_errors_1.AccountEmailTakenError(email);
            }
            const passwordHash = await (0, auth_policy_1.hashPassword)(command.password);
            const account = await this.authRepository.createAccount({
                email,
                passwordHash,
                isAdmin: this.isBootstrapAdminEmail(email)
            });
            return this.createSessionForAccount(account.id);
        }
        catch (error) {
            if (error instanceof auth_errors_1.InvalidAuthEmailError ||
                error instanceof auth_errors_1.InvalidAuthPasswordError) {
                throw new common_1.BadRequestException(error.message);
            }
            if (error instanceof auth_errors_1.AccountEmailTakenError) {
                throw new common_1.ConflictException(error.message);
            }
            throw error;
        }
    }
    async login(command) {
        try {
            const email = (0, auth_policy_1.normalizeEmail)(command.email);
            const account = await this.authRepository.findAccountByEmail(email);
            if (!account) {
                throw new auth_errors_1.InvalidCredentialsError();
            }
            const validPassword = await (0, auth_policy_1.verifyPassword)(command.password, account.passwordHash);
            if (!validPassword) {
                throw new auth_errors_1.InvalidCredentialsError();
            }
            return this.createSessionForAccount(account.id);
        }
        catch (error) {
            if (error instanceof auth_errors_1.InvalidAuthEmailError ||
                error instanceof auth_errors_1.InvalidAuthPasswordError) {
                throw new common_1.BadRequestException(error.message);
            }
            if (error instanceof auth_errors_1.InvalidCredentialsError) {
                throw new common_1.UnauthorizedException(error.message);
            }
            throw error;
        }
    }
    async getAccountById(accountId) {
        const account = await this.authRepository.findAccountById(accountId);
        if (!account) {
            return null;
        }
        return this.promoteBootstrapAdminIfNeeded(account);
    }
    async authenticate(accessToken) {
        const account = await this.authRepository.findAccountByActiveSessionTokenHash((0, auth_policy_1.hashSessionToken)(accessToken), new Date());
        if (!account) {
            return null;
        }
        const nextAccount = await this.promoteBootstrapAdminIfNeeded(account);
        return {
            accountId: nextAccount.id,
            email: nextAccount.email,
            isAdmin: nextAccount.isAdmin,
            playerId: nextAccount.player?.id ?? null
        };
    }
    async createSessionForAccount(accountId) {
        const accessToken = (0, auth_policy_1.generateSessionToken)();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + auth_policy_1.AUTH_SESSION_TTL_DAYS);
        await this.authRepository.createSession({
            accountId,
            tokenHash: (0, auth_policy_1.hashSessionToken)(accessToken),
            expiresAt
        });
        const account = await this.authRepository.findAccountById(accountId);
        if (!account) {
            throw new common_1.UnauthorizedException("Authenticated account no longer exists.");
        }
        return {
            accessToken,
            account: await this.promoteBootstrapAdminIfNeeded(account)
        };
    }
    isBootstrapAdminEmail(email) {
        return this.getBootstrapAdminEmails().includes(email);
    }
    async promoteBootstrapAdminIfNeeded(account) {
        if (account.isAdmin || !this.isBootstrapAdminEmail(account.email)) {
            return account;
        }
        return this.authRepository.markAccountAsAdmin(account.id);
    }
    getBootstrapAdminEmails() {
        const configuredEmails = this.configService.get("ADMIN_EMAILS");
        if (!configuredEmails) {
            return [];
        }
        return configuredEmails
            .split(",")
            .map((entry) => entry.trim().toLowerCase())
            .filter((entry) => entry.length > 0);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(auth_repository_1.AUTH_REPOSITORY)),
    __param(1, (0, common_1.Inject)(config_1.ConfigService)),
    __metadata("design:paramtypes", [Object, config_1.ConfigService])
], AuthService);
