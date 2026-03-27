import { type StickyMenuRepository } from "./sticky-menu.repository";
import { type StickyMenuConfig } from "../domain/sticky-menu.types";
export declare class StickyMenuService {
    private readonly stickyMenuRepository;
    constructor(stickyMenuRepository: StickyMenuRepository);
    getConfig(): Promise<StickyMenuConfig>;
    updateConfig(payload: unknown): Promise<StickyMenuConfig>;
    private toConfigView;
}
