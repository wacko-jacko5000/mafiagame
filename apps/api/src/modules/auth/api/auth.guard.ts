import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";

import { AuthService } from "../application/auth.service";
import type { AuthenticatedRequest } from "./auth-request.types";

function extractBearerToken(request: AuthenticatedRequest): string | null {
  const authorizationHeader = request.header("authorization");

  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw new UnauthorizedException("Authorization header must use Bearer token auth.");
  }

  return token;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(AuthService)
    private readonly authService: AuthService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const accessToken = extractBearerToken(request);

    if (!accessToken) {
      throw new UnauthorizedException("Authentication is required.");
    }

    const actor = await this.authService.authenticate(accessToken);

    if (!actor) {
      throw new UnauthorizedException("Authentication is required.");
    }

    request.authActor = actor;
    return true;
  }
}

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(
    @Inject(AuthService)
    private readonly authService: AuthService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const accessToken = extractBearerToken(request);

    if (!accessToken) {
      return true;
    }

    const actor = await this.authService.authenticate(accessToken);

    if (!actor) {
      throw new UnauthorizedException("Authentication is required.");
    }

    request.authActor = actor;
    return true;
  }
}
