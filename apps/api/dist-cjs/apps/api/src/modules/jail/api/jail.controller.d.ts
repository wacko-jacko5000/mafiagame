import type { AuthActor } from "../../auth/domain/auth.types";
import { JailService } from "../application/jail.service";
import type { JailBuyoutResponseBody, JailBuyoutStatusResponseBody, JailStatusResponseBody } from "./jail.contracts";
export declare class JailController {
    private readonly jailService;
    constructor(jailService: JailService);
    getStatus(playerId: string): Promise<JailStatusResponseBody>;
    getCurrentPlayerStatus(actor: AuthActor | undefined): Promise<JailBuyoutStatusResponseBody>;
    buyOutCurrentPlayer(actor: AuthActor | undefined): Promise<JailBuyoutResponseBody>;
}
