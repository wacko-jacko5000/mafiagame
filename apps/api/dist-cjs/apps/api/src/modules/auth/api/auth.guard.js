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
exports.OptionalAuthGuard = exports.AuthGuard = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("../application/auth.service");
function extractBearerToken(request) {
    const authorizationHeader = request.header("authorization");
    if (!authorizationHeader) {
        return null;
    }
    const [scheme, token] = authorizationHeader.split(" ");
    if (scheme !== "Bearer" || !token) {
        throw new common_1.UnauthorizedException("Authorization header must use Bearer token auth.");
    }
    return token;
}
let AuthGuard = class AuthGuard {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const accessToken = extractBearerToken(request);
        if (!accessToken) {
            throw new common_1.UnauthorizedException("Authentication is required.");
        }
        const actor = await this.authService.authenticate(accessToken);
        if (!actor) {
            throw new common_1.UnauthorizedException("Authentication is required.");
        }
        request.authActor = actor;
        return true;
    }
};
exports.AuthGuard = AuthGuard;
exports.AuthGuard = AuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(auth_service_1.AuthService)),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthGuard);
let OptionalAuthGuard = class OptionalAuthGuard {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const accessToken = extractBearerToken(request);
        if (!accessToken) {
            return true;
        }
        const actor = await this.authService.authenticate(accessToken);
        if (!actor) {
            throw new common_1.UnauthorizedException("Authentication is required.");
        }
        request.authActor = actor;
        return true;
    }
};
exports.OptionalAuthGuard = OptionalAuthGuard;
exports.OptionalAuthGuard = OptionalAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(auth_service_1.AuthService)),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], OptionalAuthGuard);
