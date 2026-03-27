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
exports.CrimeService = void 0;
const common_1 = require("@nestjs/common");
const hospital_service_1 = require("../../hospital/application/hospital.service");
const jail_service_1 = require("../../jail/application/jail.service");
const player_service_1 = require("../../player/application/player.service");
const player_policy_1 = require("../../player/domain/player.policy");
const domain_events_service_1 = require("../../../platform/domain-events/domain-events.service");
const crime_catalog_1 = require("../domain/crime.catalog");
const crime_errors_1 = require("../domain/crime.errors");
const crime_policy_1 = require("../domain/crime.policy");
const crime_constants_1 = require("./crime.constants");
let CrimeService = class CrimeService {
    playerService;
    jailService;
    hospitalService;
    domainEventsService;
    getRandomRoll;
    constructor(playerService, jailService, hospitalService, domainEventsService, getRandomRoll) {
        this.playerService = playerService;
        this.jailService = jailService;
        this.hospitalService = hospitalService;
        this.domainEventsService = domainEventsService;
        this.getRandomRoll = getRandomRoll;
    }
    listCrimes() {
        return crime_catalog_1.starterCrimeCatalog;
    }
    async executeCrime(playerId, crimeId) {
        const crime = (0, crime_catalog_1.getCrimeById)(crimeId);
        const now = new Date();
        if (!crime) {
            throw new common_1.NotFoundException(new crime_errors_1.CrimeNotFoundError(crimeId).message);
        }
        const jailStatus = await this.jailService.getStatus(playerId, now);
        if (jailStatus.active && jailStatus.until) {
            throw new common_1.ConflictException(new crime_errors_1.CrimeUnavailableWhileJailedError(jailStatus.until).message);
        }
        const hospitalStatus = await this.hospitalService.getStatus(playerId, now);
        if (hospitalStatus.active && hospitalStatus.until) {
            throw new common_1.ConflictException(new crime_errors_1.CrimeUnavailableWhileHospitalizedError(hospitalStatus.until).message);
        }
        const player = await this.playerService.getPlayerByIdAt(playerId, now);
        const progression = (0, player_policy_1.derivePlayerProgression)(player.respect);
        if (progression.level < crime.unlockLevel) {
            throw new common_1.BadRequestException(new crime_errors_1.CrimeLevelLockedError(crime.name, crime.unlockLevel).message);
        }
        if (player.energy < crime.energyCost) {
            throw new common_1.BadRequestException(new crime_errors_1.InsufficientCrimeEnergyError(crimeId).message);
        }
        const outcome = (0, crime_policy_1.resolveCrimeOutcome)(crime, this.getRandomRoll());
        await this.playerService.applyResourceDelta(playerId, {
            energy: -outcome.energySpent,
            cash: outcome.cashAwarded,
            respect: outcome.respectAwarded
        }, now);
        if (outcome.success || crime.failureConsequence.type === "none") {
            await this.publishCrimeCompletedEvent(playerId, outcome);
            return outcome;
        }
        if (crime.failureConsequence.type === "jail") {
            const jailStatusAfterFailure = await this.jailService.jailPlayer(playerId, crime.failureConsequence.durationSeconds, `Mislukte misdaad: ${crime.name}.`, now);
            const result = {
                ...outcome,
                consequence: {
                    type: "jail",
                    activeUntil: jailStatusAfterFailure.until
                }
            };
            await this.publishCrimeCompletedEvent(playerId, result);
            return result;
        }
        const hospitalStatusAfterFailure = await this.hospitalService.hospitalizePlayer(playerId, crime.failureConsequence.durationSeconds, `Gewond geraakt tijdens misdaad: ${crime.name}.`, now);
        const result = {
            ...outcome,
            consequence: {
                type: "hospital",
                activeUntil: hospitalStatusAfterFailure.until
            }
        };
        await this.publishCrimeCompletedEvent(playerId, result);
        return result;
    }
    async publishCrimeCompletedEvent(playerId, outcome) {
        await this.domainEventsService.publish({
            type: "crime.completed",
            occurredAt: new Date(),
            playerId,
            crimeId: outcome.crimeId,
            success: outcome.success,
            cashAwarded: outcome.cashAwarded,
            respectAwarded: outcome.respectAwarded,
            consequenceType: outcome.consequence.type
        });
    }
};
exports.CrimeService = CrimeService;
exports.CrimeService = CrimeService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(player_service_1.PlayerService)),
    __param(1, (0, common_1.Inject)(jail_service_1.JailService)),
    __param(2, (0, common_1.Inject)(hospital_service_1.HospitalService)),
    __param(3, (0, common_1.Inject)(domain_events_service_1.DomainEventsService)),
    __param(4, (0, common_1.Inject)(crime_constants_1.CRIME_RANDOM_PROVIDER)),
    __metadata("design:paramtypes", [player_service_1.PlayerService,
        jail_service_1.JailService,
        hospital_service_1.HospitalService,
        domain_events_service_1.DomainEventsService, Function])
], CrimeService);
