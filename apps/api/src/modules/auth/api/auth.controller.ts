import {
  Controller,
  Get,
  Inject,
  Post,
  Body,
  UnauthorizedException,
  UseGuards
} from "@nestjs/common";

import { AuthService } from "../application/auth.service";
import type {
  AuthCredentialsRequestBody,
  AuthMeResponseBody,
  AuthSessionResponseBody
} from "./auth.contracts";
import { toAuthMeResponseBody, toAuthSessionResponseBody } from "./auth.presenter";
import { AuthGuard } from "./auth.guard";
import { CurrentActor } from "./current-actor.decorator";
import type { AuthActor } from "../domain/auth.types";

@Controller("auth")
export class AuthController {
  constructor(
    @Inject(AuthService)
    private readonly authService: AuthService
  ) {}

  @Post("register")
  async register(
    @Body() body: AuthCredentialsRequestBody
  ): Promise<AuthSessionResponseBody> {
    const session = await this.authService.register(body);
    return toAuthSessionResponseBody(session);
  }

  @Post("login")
  async login(
    @Body() body: AuthCredentialsRequestBody
  ): Promise<AuthSessionResponseBody> {
    const session = await this.authService.login(body);
    return toAuthSessionResponseBody(session);
  }

  @Get("me")
  @UseGuards(AuthGuard)
  async getCurrentAccount(
    @CurrentActor() actor: AuthActor | undefined
  ): Promise<AuthMeResponseBody> {
    if (!actor) {
      throw new UnauthorizedException("Authentication is required.");
    }

    const account = await this.authService.getAccountById(actor.accountId);

    if (!account) {
      throw new UnauthorizedException("Authentication is required.");
    }

    return toAuthMeResponseBody(account);
  }
}
