import type { ApiHealthResponse } from "@mafia-game/types";
import { HealthService } from "./health.service";
export declare class HealthController {
    private readonly healthService;
    constructor(healthService: HealthService);
    getHealth(): Promise<ApiHealthResponse>;
}
