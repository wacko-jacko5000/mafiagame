import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { timingSafeEqual } from "node:crypto";

@Injectable()
export class AdminApiKeyGuard implements CanActivate {
  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const configuredApiKey = this.configService.get<string>("ADMIN_API_KEY");

    if (!configuredApiKey) {
      throw new ForbiddenException("Admin balance API is disabled.");
    }

    const request = context
      .switchToHttp()
      .getRequest<{ headers: Record<string, string | string[] | undefined> }>();
    const providedHeader = request.headers["x-admin-token"];
    const providedApiKey = Array.isArray(providedHeader) ? providedHeader[0] : providedHeader;

    if (!providedApiKey || !this.tokensMatch(configuredApiKey, providedApiKey)) {
      throw new UnauthorizedException("Missing or invalid admin token.");
    }

    return true;
  }

  private tokensMatch(expected: string, actual: string): boolean {
    const expectedBuffer = Buffer.from(expected);
    const actualBuffer = Buffer.from(actual);

    if (expectedBuffer.length !== actualBuffer.length) {
      return false;
    }

    return timingSafeEqual(expectedBuffer, actualBuffer);
  }
}
