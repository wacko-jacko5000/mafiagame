"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryBalanceService = void 0;
const common_1 = require("@nestjs/common");
const inventory_catalog_1 = require("../domain/inventory.catalog");
const inventory_balance_repository_1 = require("./inventory-balance.repository");
let InventoryBalanceService = class InventoryBalanceService {
    inventoryBalanceRepository;
    constructor(inventoryBalanceRepository) {
        this.inventoryBalanceRepository = inventoryBalanceRepository;
    }
    async onModuleInit() {
        const persistedBalances = await this.inventoryBalanceRepository.listShopItemBalances();
        for (const balance of persistedBalances) {
            (0, inventory_catalog_1.applyShopItemBalanceOverride)(balance.itemId, {
                price: balance.price
            });
        }
    }
    listShopItemBalances() {
        return inventory_catalog_1.starterShopItemCatalog.map((item) => item.delivery === "inventory"
            ? {
                ...item,
                delivery: "inventory",
                consumableEffects: null,
                weaponStats: item.weaponStats ? { ...item.weaponStats } : null,
                armorStats: item.armorStats ? { ...item.armorStats } : null
            }
            : {
                ...item,
                weaponStats: null,
                armorStats: null,
                consumableEffects: item.consumableEffects.map((effect) => ({ ...effect }))
            });
    }
    async updateShopItemBalances(updates) {
        for (const update of updates) {
            const item = (0, inventory_catalog_1.getShopItemById)(update.id);
            if (!item) {
                throw new common_1.NotFoundException(`Shop item "${update.id}" was not found.`);
            }
            if (!Number.isInteger(update.price) || update.price <= 0) {
                throw new common_1.BadRequestException(`Shop item "${update.id}" price must be a positive whole number.`);
            }
            await this.inventoryBalanceRepository.upsertShopItemBalance({
                itemId: item.id,
                price: update.price
            });
            (0, inventory_catalog_1.applyShopItemBalanceOverride)(item.id, {
                price: update.price
            });
        }
        return this.listShopItemBalances();
    }
};
exports.InventoryBalanceService = InventoryBalanceService;
exports.InventoryBalanceService = InventoryBalanceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(inventory_balance_repository_1.INVENTORY_BALANCE_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], InventoryBalanceService);
