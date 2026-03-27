"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainEventDispatchError = void 0;
class DomainEventDispatchError extends Error {
    eventType;
    cause;
    constructor(eventType, cause) {
        super(`Failed to dispatch domain event "${eventType}".`);
        this.eventType = eventType;
        this.cause = cause;
        this.name = "DomainEventDispatchError";
    }
}
exports.DomainEventDispatchError = DomainEventDispatchError;
