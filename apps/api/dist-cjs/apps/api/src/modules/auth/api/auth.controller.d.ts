import { AuthService } from "../application/auth.service";
import type { AuthCredentialsRequestBody, AuthMeResponseBody, AuthSessionResponseBody } from "./auth.contracts";
import type { AuthActor } from "../domain/auth.types";
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(body: AuthCredentialsRequestBody): Promise<AuthSessionResponseBody>;
    login(body: AuthCredentialsRequestBody): Promise<AuthSessionResponseBody>;
    getCurrentAccount(actor: AuthActor | undefined): Promise<AuthMeResponseBody>;
}
