export declare class CrimeNotFoundError extends Error {
    constructor(crimeId: string);
}
export declare class CrimeLevelLockedError extends Error {
    constructor(crimeName: string, unlockLevel: number);
}
export declare class InsufficientCrimeEnergyError extends Error {
    constructor(crimeId: string);
}
export declare class CrimeUnavailableWhileJailedError extends Error {
    constructor(until: Date);
}
export declare class CrimeUnavailableWhileHospitalizedError extends Error {
    constructor(until: Date);
}
