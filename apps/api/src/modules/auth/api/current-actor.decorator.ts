import { createParamDecorator, ExecutionContext } from "@nestjs/common";

import type { AuthenticatedRequest } from "./auth-request.types";
import type { AuthActor } from "../domain/auth.types";

export const CurrentActor = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthActor | undefined => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.authActor;
  }
);
