import { PrismaService } from "../../../platform/database/prisma.service";
import type { StickyMenuConfigRecord, StickyMenuRepository, UpsertStickyMenuConfigInput } from "../application/sticky-menu.repository";
export declare class PrismaStickyMenuRepository implements StickyMenuRepository {
    private readonly prismaService;
    constructor(prismaService: PrismaService);
    getConfig(): Promise<StickyMenuConfigRecord | null>;
    upsertConfig(input: UpsertStickyMenuConfigInput): Promise<StickyMenuConfigRecord>;
}
