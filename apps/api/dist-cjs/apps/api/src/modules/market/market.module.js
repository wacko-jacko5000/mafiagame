"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketModule = void 0;
const common_1 = require("@nestjs/common");
const player_module_1 = require("../player/player.module");
const domain_events_module_1 = require("../../platform/domain-events/domain-events.module");
const market_controller_1 = require("./api/market.controller");
const market_repository_1 = require("./application/market.repository");
const market_service_1 = require("./application/market.service");
const prisma_market_repository_1 = require("./infrastructure/prisma-market.repository");
let MarketModule = class MarketModule {
};
exports.MarketModule = MarketModule;
exports.MarketModule = MarketModule = __decorate([
    (0, common_1.Module)({
        imports: [player_module_1.PlayerModule, domain_events_module_1.DomainEventsModule],
        controllers: [market_controller_1.MarketController],
        providers: [
            market_service_1.MarketService,
            {
                provide: market_repository_1.MARKET_REPOSITORY,
                useClass: prisma_market_repository_1.PrismaMarketRepository
            }
        ],
        exports: [market_service_1.MarketService]
    })
], MarketModule);
