import { Injectable } from "@nestjs/common";

import { DomainEventDispatchError } from "./domain-events.errors";
import type {
  DomainEvent,
  DomainEventHandler,
  DomainEventOfType,
  DomainEventType
} from "./domain-events.types";

@Injectable()
export class DomainEventsService {
  private readonly handlers = new Map<
    DomainEventType,
    Set<DomainEventHandler<DomainEventType>>
  >();

  subscribe<TType extends DomainEventType>(
    eventType: TType,
    handler: DomainEventHandler<TType>
  ): () => void {
    const handlers =
      this.handlers.get(eventType) ??
      new Set<DomainEventHandler<DomainEventType>>();
    handlers.add(handler as unknown as DomainEventHandler<DomainEventType>);
    this.handlers.set(eventType, handlers);

    return () => {
      handlers.delete(handler as unknown as DomainEventHandler<DomainEventType>);

      if (handlers.size === 0) {
        this.handlers.delete(eventType);
      }
    };
  }

  async publish<TType extends DomainEventType>(
    event: DomainEventOfType<TType>
  ): Promise<void> {
    const handlers = [...(this.handlers.get(event.type) ?? [])];

    for (const handler of handlers) {
      try {
        await handler(event as DomainEvent);
      } catch (error) {
        throw new DomainEventDispatchError(event.type, error);
      }
    }
  }
}
