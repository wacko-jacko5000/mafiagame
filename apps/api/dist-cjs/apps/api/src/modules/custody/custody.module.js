"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustodyModule = void 0;
const common_1 = require("@nestjs/common");
const database_module_1 = require("../../platform/database/database.module");
const custody_balance_service_1 = require("./application/custody-balance.service");
const custody_balance_repository_1 = require("./application/custody-balance.repository");
const prisma_custody_balance_repository_1 = require("./infrastructure/prisma-custody-balance.repository");
let CustodyModule = class CustodyModule {
};
exports.CustodyModule = CustodyModule;
exports.CustodyModule = CustodyModule = __decorate([
    (0, common_1.Module)({
        imports: [database_module_1.DatabaseModule],
        providers: [
            custody_balance_service_1.CustodyBalanceService,
            {
                provide: custody_balance_repository_1.CUSTODY_BALANCE_REPOSITORY,
                useClass: prisma_custody_balance_repository_1.PrismaCustodyBalanceRepository
            }
        ],
        exports: [custody_balance_service_1.CustodyBalanceService]
    })
], CustodyModule);
