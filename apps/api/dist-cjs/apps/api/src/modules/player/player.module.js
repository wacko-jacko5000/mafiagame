"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerModule = void 0;
const common_1 = require("@nestjs/common");
const auth_module_1 = require("../auth/auth.module");
const player_service_1 = require("./application/player.service");
const player_repository_1 = require("./application/player.repository");
const player_controller_1 = require("./api/player.controller");
const prisma_player_repository_1 = require("./infrastructure/prisma-player.repository");
let PlayerModule = class PlayerModule {
};
exports.PlayerModule = PlayerModule;
exports.PlayerModule = PlayerModule = __decorate([
    (0, common_1.Module)({
        imports: [auth_module_1.AuthModule],
        controllers: [player_controller_1.PlayerController],
        providers: [
            player_service_1.PlayerService,
            {
                provide: player_repository_1.PLAYER_REPOSITORY,
                useClass: prisma_player_repository_1.PrismaPlayerRepository
            }
        ],
        exports: [player_service_1.PlayerService]
    })
], PlayerModule);
