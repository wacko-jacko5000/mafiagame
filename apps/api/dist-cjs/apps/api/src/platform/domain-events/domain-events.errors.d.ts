export declare class DomainEventDispatchError extends Error {
    readonly eventType: string;
    readonly cause: unknown;
    constructor(eventType: string, cause: unknown);
}
