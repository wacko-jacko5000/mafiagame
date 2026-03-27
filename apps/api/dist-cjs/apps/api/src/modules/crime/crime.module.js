"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrimeModule = void 0;
const common_1 = require("@nestjs/common");
const auth_module_1 = require("../auth/auth.module");
const hospital_module_1 = require("../hospital/hospital.module");
const jail_module_1 = require("../jail/jail.module");
const player_module_1 = require("../player/player.module");
const domain_events_module_1 = require("../../platform/domain-events/domain-events.module");
const crime_balance_service_1 = require("./application/crime-balance.service");
const crime_balance_repository_1 = require("./application/crime-balance.repository");
const crime_constants_1 = require("./application/crime.constants");
const crime_service_1 = require("./application/crime.service");
const crime_controller_1 = require("./api/crime.controller");
const prisma_crime_balance_repository_1 = require("./infrastructure/prisma-crime-balance.repository");
let CrimeModule = class CrimeModule {
};
exports.CrimeModule = CrimeModule;
exports.CrimeModule = CrimeModule = __decorate([
    (0, common_1.Module)({
        imports: [auth_module_1.AuthModule, player_module_1.PlayerModule, jail_module_1.JailModule, hospital_module_1.HospitalModule, domain_events_module_1.DomainEventsModule],
        controllers: [crime_controller_1.CrimeController],
        providers: [
            crime_balance_service_1.CrimeBalanceService,
            crime_service_1.CrimeService,
            {
                provide: crime_balance_repository_1.CRIME_BALANCE_REPOSITORY,
                useClass: prisma_crime_balance_repository_1.PrismaCrimeBalanceRepository
            },
            {
                provide: crime_constants_1.CRIME_RANDOM_PROVIDER,
                useValue: () => Math.random()
            }
        ],
        exports: [crime_balance_service_1.CrimeBalanceService]
    })
], CrimeModule);
