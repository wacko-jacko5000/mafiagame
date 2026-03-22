import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";

import { AuthService } from "../../auth/application/auth.service";
import type { AuthenticatedRequest } from "../../auth/api/auth-request.types";

@Injectable()
export class AdminApiKeyGuard implements CanActivate {
  constructor(
    @Inject(AuthService)
    private readonly authService: AuthService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorizationHeader = request.header("authorization");

    if (!authorizationHeader) {
      throw new UnauthorizedException("Authentication is required.");
    }

    const [scheme, accessToken] = authorizationHeader.split(" ");

    if (scheme !== "Bearer" || !accessToken) {
      throw new UnauthorizedException("Authorization header must use Bearer token auth.");
    }

    const actor = await this.authService.authenticate(accessToken);

    if (!actor) {
      throw new UnauthorizedException("Authentication is required.");
    }

    if (!actor.isAdmin) {
      throw new UnauthorizedException("Admin access is required.");
    }

    request.authActor = actor;
    return true;
  }
}
