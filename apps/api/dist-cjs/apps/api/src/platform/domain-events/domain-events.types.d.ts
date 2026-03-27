export interface CrimeCompletedEvent {
    type: "crime.completed";
    occurredAt: Date;
    playerId: string;
    crimeId: string;
    success: boolean;
    cashAwarded: number;
    respectAwarded: number;
    consequenceType: "none" | "jail" | "hospital";
}
export interface InventoryItemPurchasedEvent {
    type: "inventory.item_purchased";
    occurredAt: Date;
    playerId: string;
    inventoryItemId: string;
    itemId: string;
    price: number;
}
export interface CombatWonEvent {
    type: "combat.won";
    occurredAt: Date;
    attackerPlayerId: string;
    targetPlayerId: string;
    damageDealt: number;
    hospitalizedUntil: Date | null;
}
export interface TerritoryDistrictClaimedEvent {
    type: "territory.district_claimed";
    occurredAt: Date;
    playerId: string;
    gangId: string;
    districtId: string;
}
export interface TerritoryWarWonEvent {
    type: "territory.war_won";
    occurredAt: Date;
    warId: string;
    districtId: string;
    districtName: string;
    winningGangId: string;
    winningGangName: string;
    attackerGangId: string;
    defenderGangId: string;
    resolvedAt: Date;
}
export interface TerritoryPayoutClaimedEvent {
    type: "territory.payout_claimed";
    occurredAt: Date;
    playerId: string;
    gangId: string;
    districtId: string;
    districtName: string;
    payoutAmount: number;
}
export interface MarketItemSoldEvent {
    type: "market.item_sold";
    occurredAt: Date;
    listingId: string;
    inventoryItemId: string;
    itemId: string;
    itemName: string;
    sellerPlayerId: string;
    buyerPlayerId: string;
    price: number;
}
export interface AchievementUnlockedEvent {
    type: "achievements.unlocked";
    occurredAt: Date;
    playerId: string;
    achievementId: string;
    achievementName: string;
    achievementDescription: string;
}
export interface GangInviteReceivedEvent {
    type: "gangs.invite_received";
    occurredAt: Date;
    inviteId: string;
    gangId: string;
    gangName: string;
    invitedPlayerId: string;
    invitedByPlayerId: string;
    invitedByPlayerDisplayName: string;
}
export type DomainEvent = CrimeCompletedEvent | InventoryItemPurchasedEvent | CombatWonEvent | TerritoryDistrictClaimedEvent | TerritoryWarWonEvent | TerritoryPayoutClaimedEvent | MarketItemSoldEvent | AchievementUnlockedEvent | GangInviteReceivedEvent;
export type DomainEventType = DomainEvent["type"];
export type DomainEventOfType<TType extends DomainEventType> = Extract<DomainEvent, {
    type: TType;
}>;
export type DomainEventHandler<TType extends DomainEventType> = (event: DomainEventOfType<TType>) => void | Promise<void>;
