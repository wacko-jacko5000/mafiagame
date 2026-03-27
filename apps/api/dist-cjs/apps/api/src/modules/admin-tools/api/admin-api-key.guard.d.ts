import { CanActivate, ExecutionContext } from "@nestjs/common";
import { AuthService } from "../../auth/application/auth.service";
export declare class AdminApiKeyGuard implements CanActivate {
    private readonly authService;
    constructor(authService: AuthService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
