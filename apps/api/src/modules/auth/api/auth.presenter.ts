import type { AccountSnapshot, AuthenticatedSession } from "../domain/auth.types";
import type {
  AuthMeResponseBody,
  AuthSessionResponseBody,
  AuthenticatedAccountResponseBody
} from "./auth.contracts";

function toAuthenticatedAccountResponseBody(
  account: AccountSnapshot
): AuthenticatedAccountResponseBody {
  return {
    id: account.id,
    email: account.email,
    isAdmin: account.isAdmin,
    createdAt: account.createdAt.toISOString(),
    updatedAt: account.updatedAt.toISOString(),
    player: account.player
      ? {
          id: account.player.id,
          displayName: account.player.displayName
        }
      : null
  };
}

export function toAuthSessionResponseBody(
  session: AuthenticatedSession
): AuthSessionResponseBody {
  return {
    accessToken: session.accessToken,
    account: toAuthenticatedAccountResponseBody(session.account)
  };
}

export function toAuthMeResponseBody(account: AccountSnapshot): AuthMeResponseBody {
  return {
    account: toAuthenticatedAccountResponseBody(account)
  };
}
