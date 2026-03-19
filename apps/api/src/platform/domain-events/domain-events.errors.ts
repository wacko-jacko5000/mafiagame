export class DomainEventDispatchError extends Error {
  constructor(
    public readonly eventType: string,
    public readonly cause: unknown
  ) {
    super(`Failed to dispatch domain event "${eventType}".`);
    this.name = "DomainEventDispatchError";
  }
}
