"use client";

import { useEffect, useMemo, useState } from "react";

import type { ShopItem } from "../lib/game-api";
import { gameApi } from "../lib/game-api";
import { formatMoney, getErrorMessage } from "../lib/formatters";
import { usePlayerState } from "./player-state-provider";
import { useSession } from "./session-provider";

const filterLabels: Record<"all" | "weapon" | "armor" | "vehicle" | "property", string> = {
  all: "All",
  weapon: "Weapons",
  armor: "Armor",
  vehicle: "Vehicles",
  property: "Real Estate"
};

export function ShopPage() {
  const session = useSession();
  const { refreshPlayer } = usePlayerState();
  const [items, setItems] = useState<ShopItem[]>([]);
  const [filter, setFilter] = useState<"all" | "weapon" | "armor" | "vehicle" | "property">("all");
  const [error, setError] = useState<string | null>(null);
  const [busyItem, setBusyItem] = useState<string | null>(null);

  useEffect(() => {
    if (!session.accessToken) {
      return;
    }

    const accessToken = session.accessToken;
    let isMounted = true;

    async function load() {
      try {
        const nextItems = await gameApi.inventory.listShopItems(accessToken);

        if (isMounted) {
          setItems(nextItems);
        }
      } catch (nextError) {
        if (isMounted) {
          setError(getErrorMessage(nextError, "Unable to load shop."));
        }
      }
    }

    void load();

    return () => {
      isMounted = false;
    };
  }, [session.accessToken]);

  const visibleItems = useMemo(
    () => items.filter((item) => filter === "all" || item.type === filter),
    [filter, items]
  );

  async function handleBuy(itemId: string) {
    if (!session.accessToken) {
      return;
    }

    setBusyItem(itemId);
    setError(null);

    try {
      await gameApi.inventory.purchase(session.accessToken, itemId);
      await refreshPlayer();
      setItems(await gameApi.inventory.listShopItems(session.accessToken));
    } catch (nextError) {
      setError(getErrorMessage(nextError, "Purchase failed."));
    } finally {
      setBusyItem(null);
    }
  }

  return (
    <section className="panel page-panel">
      <p className="section-label">Acquisitions</p>
      <h2>Black market storefront</h2>
      <div className="filter-row">
        {(["all", "weapon", "armor", "vehicle", "property"] as const).map((value) => (
          <button
            key={value}
            className={filter === value ? "segment is-active" : "segment"}
            onClick={() => setFilter(value)}
            type="button"
          >
            {filterLabels[value]}
          </button>
        ))}
      </div>
      {error ? <p className="error-bar">{error}</p> : null}
      <div className="card-list">
        {visibleItems.map((item) => (
          <div className="interactive-card" key={item.id}>
            <div>
              <strong>{item.name}</strong>
              <p className="muted">
                {formatItemType(item.type)} · level {item.unlockLevel} ·{" "}
                {item.isUnlocked ? "Unlocked" : "Locked"}
              </p>
            </div>
            <div className="card-footer">
              <span>{formatMoney(item.price)}</span>
              <button
                className="mini-button"
                disabled={busyItem === item.id || !item.isUnlocked}
                onClick={() => handleBuy(item.id)}
                type="button"
              >
                {busyItem === item.id ? "Buying..." : "Buy"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function formatItemType(type: ShopItem["type"]) {
  switch (type) {
    case "weapon":
      return "Weapon";
    case "armor":
      return "Armor";
    case "vehicle":
      return "Vehicle";
    case "property":
      return "Real Estate";
    default:
      return "Consumable";
  }
}
