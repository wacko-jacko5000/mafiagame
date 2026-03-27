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
exports.AdminApiKeyGuard = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("../../auth/application/auth.service");
let AdminApiKeyGuard = class AdminApiKeyGuard {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const authorizationHeader = request.header("authorization");
        if (!authorizationHeader) {
            throw new common_1.UnauthorizedException("Authentication is required.");
        }
        const [scheme, accessToken] = authorizationHeader.split(" ");
        if (scheme !== "Bearer" || !accessToken) {
            throw new common_1.UnauthorizedException("Authorization header must use Bearer token auth.");
        }
        const actor = await this.authService.authenticate(accessToken);
        if (!actor) {
            throw new common_1.UnauthorizedException("Authentication is required.");
        }
        if (!actor.isAdmin) {
            throw new common_1.UnauthorizedException("Admin access is required.");
        }
        request.authActor = actor;
        return true;
    }
};
exports.AdminApiKeyGuard = AdminApiKeyGuard;
exports.AdminApiKeyGuard = AdminApiKeyGuard = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(auth_service_1.AuthService)),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AdminApiKeyGuard);
