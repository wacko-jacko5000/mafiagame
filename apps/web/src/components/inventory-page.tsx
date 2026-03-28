"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { EquippedItems, InventoryItem } from "../lib/api-types";
import { ApiError } from "../lib/api-client";
import { formatDateTime, formatMoney } from "../lib/formatters";
import { gameApi } from "../lib/game-api";
import { AppShell } from "./app-shell";
import { usePlayerState } from "./providers/player-state-provider";
import { useSession } from "./providers/session-provider";

function describeInventoryItemStats(item: InventoryItem): string {
  if (item.weaponStats) {
    return `Damage +${item.weaponStats.damageBonus}`;
  }

  if (item.armorStats) {
    return `Damage reduction ${item.armorStats.damageReduction}`;
  }

  return "No combat stats";
}

export function InventoryPage() {
  const { accessToken, account } = useSession();
  const { player, refreshPlayer } = usePlayerState();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [equipment, setEquipment] = useState<EquippedItems | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionKey, setActionKey] = useState<string | null>(null);

  async function loadData() {
    if (!accessToken || !account?.player?.id) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [nextInventory, nextEquipment] = await Promise.all([
        gameApi.inventory.getCurrentInventory(accessToken),
        gameApi.inventory.getCurrentEquipment(accessToken)
      ]);

      setInventory(nextInventory);
      setEquipment(nextEquipment);
    } catch (nextError) {
      setError(
        nextError instanceof ApiError
          ? nextError.message
          : "Unable to load inventory data."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, [accessToken, account?.player?.id]);

  async function runAction(actionLabel: string, action: () => Promise<void>) {
    setActionKey(actionLabel);
    setError(null);

    try {
      await action();
      await refreshPlayer();
      await loadData();
    } catch (nextError) {
      setError(
        nextError instanceof ApiError
          ? nextError.message
          : "Unable to update inventory."
      );
    } finally {
      setActionKey(null);
    }
  }

  return (
    <AppShell
      title="Inventory"
      subtitle="Inspect owned gear, vehicles, and properties, and manage equipped combat items."
    >
      {error ? <p className="notice notice-error">{error}</p> : null}

      <section className="dashboard-grid">
        <article className="panel">
          <p className="eyebrow">Resources</p>
          <h2>Current inventory status</h2>
          <dl className="stats-grid compact">
            <div>
              <dt>Cash</dt>
              <dd>{player ? formatMoney(player.cash) : "..."}</dd>
            </div>
            <div>
              <dt>Rank</dt>
              <dd>{player ? `Level ${player.level} - ${player.rank}` : "..."}</dd>
            </div>
            <div>
              <dt>Garage</dt>
              <dd>{player ? `${player.ownedVehicleCount}/${player.parkingSlots}` : "..."}</dd>
            </div>
            <div>
              <dt>Inventory items</dt>
              <dd>{inventory.length}</dd>
            </div>
          </dl>
        </article>

        <article className="panel">
          <p className="eyebrow">Equipped</p>
          <h2>Current loadout</h2>
          <div className="equipment-grid">
            {(["weapon", "armor"] as const).map((slot) => {
              const item = equipment?.[slot] ?? null;

              return (
                <div key={slot} className="subpanel">
                  <strong>{slot}</strong>
                  <p className="muted">{item ? item.name : "Empty"}</p>
                  <p className="meta">{item ? describeInventoryItemStats(item) : "No bonus active"}</p>
                  <button
                    className="button button-secondary"
                    disabled={!item || actionKey === `unequip-${slot}`}
                    type="button"
                    onClick={() =>
                      accessToken
                        ? void runAction(`unequip-${slot}`, () =>
                            gameApi.inventory.unequip(accessToken, slot).then(() => undefined)
                          )
                        : undefined
                    }
                  >
                    {actionKey === `unequip-${slot}` ? "Updating..." : "Unequip"}
                  </button>
                </div>
              );
            })}
          </div>
        </article>
      </section>

      <section className="panel">
        <p className="eyebrow">Owned items</p>
        <h2>Inventory</h2>
        <p className="muted">
          Need more gear or assets? Visit the <Link href="/shop">shop</Link> for level-gated items.
        </p>
        {isLoading ? (
          <p className="muted">Loading inventory...</p>
        ) : inventory.length > 0 ? (
          <ul className="list">
            {inventory.map((item) => (
              <li key={item.id} className="list-item">
                <div>
                  <strong>{item.name}</strong>
                  <p className="muted">
                    {item.category}
                    {item.equipSlot ? ` / ${item.equipSlot}` : ""}
                    {" / "}acquired {formatDateTime(item.acquiredAt)}
                  </p>
                  <p className="meta">{describeInventoryItemStats(item)}</p>
                  {item.respectBonus ? (
                    <p className="meta">Respect bonus: +{item.respectBonus}</p>
                  ) : null}
                  {item.parkingSlots ? (
                    <p className="meta">Parking slots: {item.parkingSlots}</p>
                  ) : null}
                  <p className="meta">
                    {item.marketListingId
                      ? "Locked by market listing"
                      : item.equippedSlot
                        ? `Equipped as ${item.equippedSlot}`
                        : "Unequipped"}
                  </p>
                </div>

                <div className="inline-actions">
                  <button
                    className="button button-secondary"
                    disabled={
                      !accessToken ||
                      item.equipSlot !== "weapon" ||
                      item.marketListingId !== null ||
                      actionKey === `equip-weapon-${item.id}`
                    }
                    type="button"
                    onClick={() =>
                      accessToken
                        ? void runAction(`equip-weapon-${item.id}`, () =>
                            gameApi.inventory
                              .equip(accessToken, item.id, "weapon")
                              .then(() => undefined)
                          )
                        : undefined
                    }
                  >
                    Weapon
                  </button>
                  <button
                    className="button button-secondary"
                    disabled={
                      !accessToken ||
                      item.equipSlot !== "armor" ||
                      item.marketListingId !== null ||
                      actionKey === `equip-armor-${item.id}`
                    }
                    type="button"
                    onClick={() =>
                      accessToken
                        ? void runAction(`equip-armor-${item.id}`, () =>
                            gameApi.inventory
                              .equip(accessToken, item.id, "armor")
                              .then(() => undefined)
                          )
                        : undefined
                    }
                  >
                    Armor
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">No owned items yet. Buy your first weapon, vehicle, or property from the shop.</p>
        )}
      </section>
    </AppShell>
  );
}
