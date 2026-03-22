"use client";

import { useEffect, useMemo, useState } from "react";

import type { InventoryItem, MarketListing } from "../lib/api-types";
import { ApiError } from "../lib/api-client";
import { formatDateTime, formatMoney } from "../lib/formatters";
import { gameApi } from "../lib/game-api";
import { getListableInventoryItems, getOwnMarketListings } from "../lib/game-state";
import { AppShell } from "./app-shell";
import { usePlayerState } from "./providers/player-state-provider";
import { useSession } from "./providers/session-provider";

export function MarketPage() {
  const { accessToken, account } = useSession();
  const { player, refreshPlayer } = usePlayerState();
  const playerId = account?.player?.id ?? null;
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [listings, setListings] = useState<MarketListing[]>([]);
  const [selectedInventoryItemId, setSelectedInventoryItemId] = useState("");
  const [price, setPrice] = useState("500");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionKey, setActionKey] = useState<string | null>(null);

  async function loadData() {
    if (!playerId || !accessToken) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [nextInventory, nextListings] = await Promise.all([
        gameApi.inventory.getCurrentInventory(accessToken),
        gameApi.market.listListings()
      ]);

      setInventory(nextInventory);
      setListings(nextListings);
    } catch (nextError) {
      setError(nextError instanceof ApiError ? nextError.message : "Unable to load market.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, [accessToken, playerId]);

  const listableItems = useMemo(() => getListableInventoryItems(inventory), [inventory]);
  const ownListings = useMemo(
    () => (playerId ? getOwnMarketListings(listings, playerId) : []),
    [listings, playerId]
  );
  const activeListings = useMemo(
    () => listings.filter((listing) => listing.status === "active"),
    [listings]
  );

  useEffect(() => {
    if (listableItems.length === 0) {
      setSelectedInventoryItemId("");
      return;
    }

    if (!listableItems.some((item) => item.id === selectedInventoryItemId)) {
      setSelectedInventoryItemId(listableItems[0]?.id ?? "");
    }
  }, [listableItems, selectedInventoryItemId]);

  async function runAction(nextActionKey: string, action: () => Promise<string | null>) {
    setActionKey(nextActionKey);
    setError(null);
    setNotice(null);

    try {
      const nextNotice = await action();
      await refreshPlayer();
      await loadData();
      if (nextNotice) {
        setNotice(nextNotice);
      }
    } catch (nextError) {
      setError(nextError instanceof ApiError ? nextError.message : "Unable to update market.");
    } finally {
      setActionKey(null);
    }
  }

  return (
    <AppShell
      title="Market"
      subtitle="Expose fixed-price listings, purchases, and listing cancellation through the existing market contracts."
    >
      {error ? <p className="notice notice-error">{error}</p> : null}
      {notice ? <p className="notice">{notice}</p> : null}

      <section className="dashboard-grid">
        <article className="panel">
          <p className="eyebrow">Market state</p>
          <h2>Cash and listings</h2>
          <dl className="stats-grid compact">
            <div>
              <dt>Cash</dt>
              <dd>{player ? formatMoney(player.cash) : "..."}</dd>
            </div>
            <div>
              <dt>Open market listings</dt>
              <dd>{activeListings.length}</dd>
            </div>
            <div>
              <dt>Your listings</dt>
              <dd>{ownListings.length}</dd>
            </div>
          </dl>
        </article>

        <article className="panel">
          <p className="eyebrow">List an item</p>
          <h2>Create a sale</h2>
          {isLoading ? (
            <p className="muted">Loading inventory...</p>
          ) : listableItems.length > 0 ? (
            <form
              className="stack"
              onSubmit={(event) => {
                event.preventDefault();
                if (!playerId || !selectedInventoryItemId) {
                  return;
                }

                void runAction("create-listing", async () => {
                  await gameApi.market.createListing(
                    playerId,
                    selectedInventoryItemId,
                    Number(price)
                  );
                  setPrice("500");
                  return "Listing created.";
                });
              }}
            >
              <label className="field">
                <span>Owned item</span>
                <select
                  value={selectedInventoryItemId}
                  onChange={(event) => setSelectedInventoryItemId(event.target.value)}
                >
                  {listableItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Price</span>
                <input
                  inputMode="numeric"
                  min="1"
                  step="1"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                />
              </label>
              <button
                className="button"
                disabled={actionKey === "create-listing" || Number(price) <= 0}
                type="submit"
              >
                {actionKey === "create-listing" ? "Listing..." : "Create listing"}
              </button>
            </form>
          ) : (
            <p className="muted">No inventory items are currently eligible for listing.</p>
          )}
        </article>
      </section>

      <section className="panel">
        <p className="eyebrow">Your listings</p>
        <h2>Seller view</h2>
        {isLoading ? (
          <p className="muted">Loading your listings...</p>
        ) : ownListings.length > 0 ? (
          <ul className="list">
            {ownListings.map((listing) => (
              <li key={listing.id} className="list-item">
                <div>
                  <strong>{listing.itemName}</strong>
                  <p className="muted">
                    {listing.status} at {formatMoney(listing.price)}
                  </p>
                </div>
                <div className="inline-actions">
                  <span className="meta">{formatDateTime(listing.createdAt)}</span>
                  <button
                    className="button button-secondary"
                    disabled={listing.status !== "active" || actionKey === `cancel-${listing.id}`}
                    type="button"
                    onClick={() =>
                      playerId
                        ? void runAction(`cancel-${listing.id}`, async () => {
                            await gameApi.market.cancelListing(listing.id, playerId);
                            return `${listing.itemName} listing cancelled.`;
                          })
                        : undefined
                    }
                  >
                    {actionKey === `cancel-${listing.id}` ? "Cancelling..." : "Cancel"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">You have not created any listings yet.</p>
        )}
      </section>

      <section className="panel">
        <p className="eyebrow">Open market</p>
        <h2>Active listings</h2>
        {isLoading ? (
          <p className="muted">Loading listings...</p>
        ) : activeListings.length > 0 ? (
          <ul className="list">
            {activeListings.map((listing) => {
              const isOwnListing = listing.sellerPlayerId === playerId;

              return (
                <li key={listing.id} className="list-item">
                  <div>
                    <strong>{listing.itemName}</strong>
                    <p className="muted">
                      {listing.itemType} for {formatMoney(listing.price)}
                    </p>
                  </div>
                  <div className="inline-actions">
                    <span className="meta">{formatDateTime(listing.createdAt)}</span>
                    <button
                      className="button"
                      disabled={isOwnListing || actionKey === `buy-${listing.id}`}
                      type="button"
                      onClick={() =>
                        playerId
                          ? void runAction(`buy-${listing.id}`, async () => {
                              const result = await gameApi.market.buyListing(listing.id, playerId);
                              return `Purchased ${listing.itemName} for ${formatMoney(listing.price)}. Cash left: ${formatMoney(result.buyerCashAfterPurchase)}.`;
                            })
                          : undefined
                      }
                    >
                      {isOwnListing
                        ? "Your listing"
                        : actionKey === `buy-${listing.id}`
                          ? "Buying..."
                          : "Buy"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="muted">No active market listings are available.</p>
        )}
      </section>
    </AppShell>
  );
}
