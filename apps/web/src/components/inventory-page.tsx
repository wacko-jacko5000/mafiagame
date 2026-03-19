"use client";

import { useEffect, useState } from "react";

import type { EquippedItems, InventoryItem, Player, ShopItem } from "../lib/api-types";
import { ApiError } from "../lib/api-client";
import { formatDateTime, formatMoney } from "../lib/formatters";
import { gameApi } from "../lib/game-api";
import { AppShell } from "./app-shell";
import { useSession } from "./providers/session-provider";

export function InventoryPage() {
  const { accessToken, account } = useSession();
  const [player, setPlayer] = useState<Player | null>(null);
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
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
      const [nextPlayer, nextShopItems, nextInventory, nextEquipment] = await Promise.all([
        gameApi.players.getById(account.player.id),
        gameApi.inventory.listShopItems(),
        gameApi.inventory.getCurrentInventory(accessToken),
        gameApi.inventory.getCurrentEquipment(accessToken)
      ]);

      setPlayer(nextPlayer);
      setShopItems(nextShopItems);
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
      subtitle="Buy starter items, inspect owned inventory, and assign equipment slots."
    >
      {error ? <p className="notice notice-error">{error}</p> : null}

      <section className="dashboard-grid">
        <article className="panel">
          <p className="eyebrow">Resources</p>
          <h2>Purchase capacity</h2>
          <dl className="stats-grid compact">
            <div>
              <dt>Cash</dt>
              <dd>{player ? formatMoney(player.cash) : "..."}</dd>
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
        <p className="eyebrow">Shop</p>
        <h2>Starter items</h2>
        {isLoading ? (
          <p className="muted">Loading shop...</p>
        ) : (
          <div className="card-grid">
            {shopItems.map((item) => (
              <article key={item.id} className="subpanel">
                <h3>{item.name}</h3>
                <p className="muted">
                  {item.type} · {item.equipSlot}
                </p>
                <p className="price-tag">{formatMoney(item.price)}</p>
                <button
                  className="button"
                  disabled={!accessToken || actionKey === `buy-${item.id}`}
                  type="button"
                  onClick={() =>
                    accessToken
                      ? void runAction(`buy-${item.id}`, () =>
                          gameApi.inventory.purchase(accessToken, item.id).then(() => undefined)
                        )
                      : undefined
                  }
                >
                  {actionKey === `buy-${item.id}` ? "Purchasing..." : "Buy"}
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="panel">
        <p className="eyebrow">Owned items</p>
        <h2>Inventory</h2>
        {isLoading ? (
          <p className="muted">Loading inventory...</p>
        ) : inventory.length > 0 ? (
          <ul className="list">
            {inventory.map((item) => (
              <li key={item.id} className="list-item">
                <div>
                  <strong>{item.name}</strong>
                  <p className="muted">
                    {item.type} · acquired {formatDateTime(item.acquiredAt)}
                  </p>
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
          <p className="muted">No owned items yet. Buy one from the starter shop.</p>
        )}
      </section>
    </AppShell>
  );
}
