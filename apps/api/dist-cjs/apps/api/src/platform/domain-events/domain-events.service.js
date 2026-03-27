"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainEventsService = void 0;
const common_1 = require("@nestjs/common");
const domain_events_errors_1 = require("./domain-events.errors");
let DomainEventsService = class DomainEventsService {
    handlers = new Map();
    subscribe(eventType, handler) {
        const handlers = this.handlers.get(eventType) ??
            new Set();
        handlers.add(handler);
        this.handlers.set(eventType, handlers);
        return () => {
            handlers.delete(handler);
            if (handlers.size === 0) {
                this.handlers.delete(eventType);
            }
        };
    }
    async publish(event) {
        const handlers = [...(this.handlers.get(event.type) ?? [])];
        for (const handler of handlers) {
            try {
                await handler(event);
            }
            catch (error) {
                throw new domain_events_errors_1.DomainEventDispatchError(event.type, error);
            }
        }
    }
};
exports.DomainEventsService = DomainEventsService;
exports.DomainEventsService = DomainEventsService = __decorate([
    (0, common_1.Injectable)()
], DomainEventsService);
