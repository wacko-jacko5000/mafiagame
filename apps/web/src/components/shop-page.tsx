"use client";

import { useEffect, useMemo, useState } from "react";

import type { ShopItem, ShopItemCategory } from "../lib/api-types";
import { ApiError } from "../lib/api-client";
import { formatMoney } from "../lib/formatters";
import { gameApi } from "../lib/game-api";
import { getUnlockedShopItems } from "../lib/game-state";
import { AppShell } from "./app-shell";
import { usePlayerState } from "./providers/player-state-provider";
import { useSession } from "./providers/session-provider";

const categoryOrder: readonly ShopItemCategory[] = [
  "handguns",
  "smg",
  "assault_rifle",
  "sniper",
  "special",
  "armor"
];

const categoryLabels: Record<ShopItemCategory, string> = {
  handguns: "Handguns",
  smg: "SMG",
  assault_rifle: "Assault Rifles",
  sniper: "Sniper",
  special: "Special",
  armor: "Armor"
};

function describeShopItemStats(item: ShopItem): string {
  if (item.weaponStats) {
    return `Damage +${item.weaponStats.damageBonus}`;
  }

  if (item.armorStats) {
    return `Damage reduction ${item.armorStats.damageReduction}`;
  }

  return "No combat stats";
}

export function ShopPage() {
  const { accessToken, account } = useSession();
  const { player, refreshPlayer } = usePlayerState();
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
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
      const nextShopItems = await gameApi.inventory.listShopItems(accessToken);

      setShopItems(nextShopItems);
    } catch (nextError) {
      setError(
        nextError instanceof ApiError
          ? nextError.message
          : "Unable to load shop data."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, [accessToken, account?.player?.id]);

  async function handlePurchase(itemId: string) {
    if (!accessToken) {
      return;
    }

    setActionKey(itemId);
    setError(null);

    try {
      await gameApi.inventory.purchase(accessToken, itemId);
      await refreshPlayer();
      await loadData();
    } catch (nextError) {
      setError(
        nextError instanceof ApiError
          ? nextError.message
          : "Unable to purchase the selected item."
      );
    } finally {
      setActionKey(null);
    }
  }

  const groupedItems = useMemo(() => {
    const unlockedItems = getUnlockedShopItems(shopItems, player?.level ?? null);
    const groups = new Map<ShopItemCategory, ShopItem[]>();

    for (const category of categoryOrder) {
      groups.set(category, []);
    }

    for (const item of unlockedItems) {
      groups.get(item.category)?.push(item);
    }

    return categoryOrder
      .filter((category) => (groups.get(category)?.length ?? 0) > 0)
      .map((category) => ({
        category,
        label: categoryLabels[category],
        items: groups.get(category) ?? []
      }));
  }, [player?.level, shopItems]);

  return (
    <AppShell
      title="Shop"
      subtitle="Browse level-gated weapons and starter armor without mixing catalog browsing into owned inventory management."
    >
      {error ? <p className="notice notice-error">{error}</p> : null}

      <section className="dashboard-grid">
        <article className="panel">
          <p className="eyebrow">Progression</p>
          <h2>Current access</h2>
          <dl className="stats-grid compact">
            <div>
              <dt>Rank</dt>
              <dd>{player ? `Level ${player.level} - ${player.rank}` : "..."}</dd>
            </div>
            <div>
              <dt>Respect</dt>
              <dd>{player?.currentRespect ?? "..."}</dd>
            </div>
            <div>
              <dt>Next level</dt>
              <dd>
                {player
                  ? player.nextLevel
                    ? `${player.respectToNextLevel} respect to ${player.nextRank}`
                    : "Max level"
                  : "..."}
              </dd>
            </div>
          </dl>
        </article>

        <article className="panel">
          <p className="eyebrow">Funds</p>
          <h2>Current buying power</h2>
          <dl className="stats-grid compact">
            <div>
              <dt>Cash</dt>
              <dd>{player ? formatMoney(player.cash) : "..."}</dd>
            </div>
            <div>
              <dt>Visible items</dt>
              <dd>{groupedItems.reduce((total, group) => total + group.items.length, 0)}</dd>
            </div>
          </dl>
        </article>
      </section>

      {isLoading ? (
        <section className="panel">
          <p className="muted">Loading shop...</p>
        </section>
      ) : groupedItems.length === 0 ? (
        <section className="panel">
          <p className="muted">No weapons or armor are unlocked at your current level yet.</p>
        </section>
      ) : (
        groupedItems.map((group) => (
          <section key={group.category} className="panel">
            <p className="eyebrow">{group.label}</p>
            <h2>{group.label}</h2>
            <div className="card-grid">
              {group.items.map((item) => (
                <article key={item.id} className="subpanel">
                  <p className="eyebrow">Unlocked</p>
                  <h3>{item.name}</h3>
                  <p className="muted">
                    {item.category} / {item.equipSlot}
                  </p>
                  <p className="meta">{describeShopItemStats(item)}</p>
                  <p className="price-tag">{formatMoney(item.price)}</p>
                  <p className="meta">
                    {`Available at your current rank: ${player?.rank ?? item.unlockRank}`}
                  </p>
                  <button
                    className="button"
                    disabled={!accessToken || actionKey === item.id}
                    type="button"
                    onClick={() => void handlePurchase(item.id)}
                  >
                    {actionKey === item.id
                      ? "Purchasing..."
                      : "Buy"}
                  </button>
                </article>
              ))}
            </div>
          </section>
        ))
      )}
    </AppShell>
  );
}
