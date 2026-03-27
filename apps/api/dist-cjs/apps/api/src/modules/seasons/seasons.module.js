"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeasonsModule = void 0;
const common_1 = require("@nestjs/common");
const admin_tools_module_1 = require("../admin-tools/admin-tools.module");
const auth_module_1 = require("../auth/auth.module");
const seasons_repository_1 = require("./application/seasons.repository");
const seasons_service_1 = require("./application/seasons.service");
const seasons_controller_1 = require("./api/seasons.controller");
const prisma_seasons_repository_1 = require("./infrastructure/prisma-seasons.repository");
let SeasonsModule = class SeasonsModule {
};
exports.SeasonsModule = SeasonsModule;
exports.SeasonsModule = SeasonsModule = __decorate([
    (0, common_1.Module)({
        imports: [auth_module_1.AuthModule, admin_tools_module_1.AdminToolsModule],
        controllers: [seasons_controller_1.SeasonsController, seasons_controller_1.AdminSeasonsController],
        providers: [
            seasons_service_1.SeasonsService,
            {
                provide: seasons_repository_1.SEASONS_REPOSITORY,
                useClass: prisma_seasons_repository_1.PrismaSeasonsRepository
            }
        ],
        exports: [seasons_service_1.SeasonsService]
    })
], SeasonsModule);
