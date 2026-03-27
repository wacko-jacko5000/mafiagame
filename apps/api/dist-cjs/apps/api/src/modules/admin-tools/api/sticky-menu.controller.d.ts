import { StickyMenuService } from "../application/sticky-menu.service";
import type { StickyMenuResponseBody } from "./sticky-menu.contracts";
export declare class StickyMenuController {
    private readonly stickyMenuService;
    constructor(stickyMenuService: StickyMenuService);
    getConfig(): Promise<StickyMenuResponseBody>;
}
export declare class AdminStickyMenuController {
    private readonly stickyMenuService;
    constructor(stickyMenuService: StickyMenuService);
    getConfig(): Promise<StickyMenuResponseBody>;
    updateConfig(body: unknown): Promise<StickyMenuResponseBody>;
}
