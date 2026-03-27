export declare class SelfAttackNotAllowedError extends Error {
    constructor();
}
export declare class AttackerJailedError extends Error {
    constructor(until: Date);
}
export declare class AttackerHospitalizedError extends Error {
    constructor(until: Date);
}
export declare class TargetHospitalizedError extends Error {
    constructor(until: Date);
}
