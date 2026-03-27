import type { AccountSnapshot, AuthenticatedSession } from "../domain/auth.types";
import type { AuthMeResponseBody, AuthSessionResponseBody } from "./auth.contracts";
export declare function toAuthSessionResponseBody(session: AuthenticatedSession): AuthSessionResponseBody;
export declare function toAuthMeResponseBody(account: AccountSnapshot): AuthMeResponseBody;
