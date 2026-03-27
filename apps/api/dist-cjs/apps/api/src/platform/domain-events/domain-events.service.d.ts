import type { DomainEventHandler, DomainEventOfType, DomainEventType } from "./domain-events.types";
export declare class DomainEventsService {
    private readonly handlers;
    subscribe<TType extends DomainEventType>(eventType: TType, handler: DomainEventHandler<TType>): () => void;
    publish<TType extends DomainEventType>(event: DomainEventOfType<TType>): Promise<void>;
}
