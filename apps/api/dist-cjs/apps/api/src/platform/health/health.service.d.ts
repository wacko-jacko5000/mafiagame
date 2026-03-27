import type { ApiHealthResponse } from "@mafia-game/types";
import { PrismaService } from "../database/prisma.service";
export declare class HealthService {
    private readonly prismaService;
    constructor(prismaService: PrismaService);
    getHealth(): Promise<ApiHealthResponse>;
}
