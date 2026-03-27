import { OnModuleInit } from "@nestjs/common";
import type { ItemDefinition } from "../domain/inventory.types";
import { type InventoryBalanceRepository } from "./inventory-balance.repository";
export interface UpdateShopItemBalanceInput {
    id: string;
    price: number;
}
export declare class InventoryBalanceService implements OnModuleInit {
    private readonly inventoryBalanceRepository;
    constructor(inventoryBalanceRepository: InventoryBalanceRepository);
    onModuleInit(): Promise<void>;
    listShopItemBalances(): ItemDefinition[];
    updateShopItemBalances(updates: readonly UpdateShopItemBalanceInput[]): Promise<ItemDefinition[]>;
}
