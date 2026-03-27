import { ConfigService } from "@nestjs/config";
import { type AuthRepository } from "./auth.repository";
import type { AccountSnapshot, AuthActor, AuthenticatedSession, LoginCommand, RegisterAccountCommand } from "../domain/auth.types";
export declare class AuthService {
    private readonly authRepository;
    private readonly configService;
    constructor(authRepository: AuthRepository, configService: ConfigService);
    register(command: RegisterAccountCommand): Promise<AuthenticatedSession>;
    login(command: LoginCommand): Promise<AuthenticatedSession>;
    getAccountById(accountId: string): Promise<AccountSnapshot | null>;
    authenticate(accessToken: string): Promise<AuthActor | null>;
    private createSessionForAccount;
    private isBootstrapAdminEmail;
    private promoteBootstrapAdminIfNeeded;
    private getBootstrapAdminEmails;
}
