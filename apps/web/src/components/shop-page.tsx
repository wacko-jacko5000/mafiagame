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

type ShopSection = "weapons" | "drugs" | "garage" | "realestate";

const weaponCategoryOrder: readonly Exclude<ShopItemCategory, "drugs" | "garage" | "realestate">[] = [
  "handguns",
  "smg",
  "assault_rifle",
  "sniper",
  "special",
  "armor"
];

const weaponCategoryLabels: Record<Exclude<ShopItemCategory, "drugs" | "garage" | "realestate">, string> = {
  handguns: "Handguns",
  smg: "SMG",
  assault_rifle: "Assault Rifles",
  sniper: "Sniper",
  special: "Special",
  armor: "Armor"
};

function describeConsumableEffects(item: ShopItem): string {
  if (!item.consumableEffects || item.consumableEffects.length === 0) {
    return "No effect";
  }

  return item.consumableEffects
    .map((effect) => {
      if (effect.type === "resource") {
        return `+${effect.amount} ${effect.resource}`;
      }

      return "Unknown effect";
    })
    .join(" / ");
}

function describeShopItemStats(item: ShopItem): string {
  if (item.weaponStats) {
    return `Damage +${item.weaponStats.damageBonus}`;
  }

  if (item.armorStats) {
    return `Damage reduction ${item.armorStats.damageReduction}`;
  }

  return describeConsumableEffects(item);
}

function getShopSection(item: ShopItem): ShopSection {
  if (item.category === "drugs") {
    return "drugs";
  }

  if (item.category === "garage") {
    return "garage";
  }

  if (item.category === "realestate") {
    return "realestate";
  }

  return "weapons";
}

export function ShopPage({
  initialSection = "weapons"
}: Readonly<{
  initialSection?: ShopSection;
}>) {
  const { accessToken, account } = useSession();
  const { player, refreshPlayer } = usePlayerState();
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionKey, setActionKey] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<ShopSection>(initialSection);

  useEffect(() => {
    setActiveSection(initialSection);
  }, [initialSection]);

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

  async function handlePurchase(item: ShopItem) {
    if (!accessToken) {
      return;
    }

    setActionKey(item.id);
    setError(null);
    setSuccessMessage(null);

    try {
      const result = await gameApi.inventory.purchase(accessToken, item.id);
      await refreshPlayer();
      await loadData();

      setSuccessMessage(
        result.delivery === "instant"
          ? `${item.name} used. ${describeConsumableEffects(item)} applied.`
          : `${item.name} purchased and added to your inventory.`
      );
    } catch (nextError) {
      setError(
        nextError instanceof ApiError
          ? nextError.message
          : "The selected item could not be purchased."
      );
    } finally {
      setActionKey(null);
    }
  }

  const unlockedItems = useMemo(
    () => getUnlockedShopItems(shopItems, player?.level ?? null),
    [player?.level, shopItems]
  );

  const weaponGroups = useMemo(() => {
    const groups = new Map<
      Exclude<ShopItemCategory, "drugs" | "garage" | "realestate">,
      ShopItem[]
    >();

    for (const category of weaponCategoryOrder) {
      groups.set(category, []);
    }

    for (const item of unlockedItems) {
      if (getShopSection(item) !== "weapons") {
        continue;
      }

      groups.get(
        item.category as Exclude<ShopItemCategory, "drugs" | "garage" | "realestate">
      )?.push(item);
    }

    return weaponCategoryOrder
      .filter((category) => (groups.get(category)?.length ?? 0) > 0)
      .map((category) => ({
        category,
        label: weaponCategoryLabels[category],
        items: groups.get(category) ?? []
      }));
  }, [unlockedItems]);

  const drugItems = useMemo(
    () => unlockedItems.filter((item) => getShopSection(item) === "drugs"),
    [unlockedItems]
  );
  const garageItems = useMemo(
    () => unlockedItems.filter((item) => getShopSection(item) === "garage"),
    [unlockedItems]
  );
  const realEstateItems = useMemo(
    () => unlockedItems.filter((item) => getShopSection(item) === "realestate"),
    [unlockedItems]
  );

  const sectionCounts = useMemo(
    () => ({
      weapons: weaponGroups.reduce((total, group) => total + group.items.length, 0),
      drugs: drugItems.length,
      garage: garageItems.length,
      realestate: realEstateItems.length
    }),
    [drugItems.length, garageItems.length, realEstateItems.length, weaponGroups]
  );

  return (
    <AppShell
      title="Shop"
      subtitle="Buy weapons, drugs, vehicles, and real estate with level-based access."
    >
      {error ? <p className="notice notice-error">{error}</p> : null}
      {successMessage ? <p className="notice notice-success">{successMessage}</p> : null}

      {isLoading ? (
        <section className="panel">
          <p className="muted">Loading shop...</p>
        </section>
      ) : activeSection === "weapons" ? (
        weaponGroups.length === 0 ? (
          <section className="panel">
            <p className="muted">No weapons or armor are unlocked at your current level yet.</p>
          </section>
        ) : (
          weaponGroups.map((group) => (
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
                  {item.respectBonus ? (
                    <p className="meta">Respect bonus: +{item.respectBonus}</p>
                  ) : null}
                  <p className="price-tag">{formatMoney(item.price)}</p>
                    <p className="meta">
                      Available at your current rank: {player?.rank ?? item.unlockRank}
                    </p>
                    <button
                      className="button"
                      disabled={!accessToken || actionKey === item.id}
                      type="button"
                      onClick={() => void handlePurchase(item)}
                    >
                      {actionKey === item.id ? "Processing..." : "Buy weapon"}
                    </button>
                  </article>
                ))}
              </div>
            </section>
          ))
        )
      ) : activeSection === "drugs" ? (
        drugItems.length === 0 ? (
          <section className="panel">
            <p className="muted">No drugs are unlocked at your current level yet.</p>
          </section>
        ) : (
          <section className="panel">
            <p className="eyebrow">Drugs</p>
            <h2>Instant consumables</h2>
            <p className="muted">
              Drugs are consumed immediately on purchase and restore energy up to the server-side max.
            </p>
            <div className="card-grid">
              {drugItems.map((item) => (
                <article key={item.id} className="subpanel">
                  <p className="eyebrow">Direct use</p>
                  <h3>{item.name}</h3>
                  <p className="muted">Drugs / consumable</p>
                <p className="meta">{describeConsumableEffects(item)}</p>
                <p className="price-tag">{formatMoney(item.price)}</p>
                  <p className="meta">Applied immediately to your player resources.</p>
                  <button
                    className="button"
                    disabled={!accessToken || actionKey === item.id}
                    type="button"
                    onClick={() => void handlePurchase(item)}
                  >
                    {actionKey === item.id ? "Processing..." : "Buy and use"}
                  </button>
                </article>
              ))}
            </div>
          </section>
        )
      ) : activeSection === "garage" ? (
        garageItems.length === 0 ? (
          <section className="panel">
            <p className="muted">No vehicles are unlocked at your current level yet.</p>
          </section>
        ) : (
          <section className="panel">
            <p className="eyebrow">Garage</p>
            <h2>Vehicles</h2>
            <p className="muted">Purchased vehicles are stored as owned assets in your inventory.</p>
            <div className="card-grid">
              {garageItems.map((item) => (
                <article key={item.id} className="subpanel">
                  <p className="eyebrow">Owned asset</p>
                  <h3>{item.name}</h3>
                  <p className="muted">Garage / vehicle</p>
                  <p className="meta">Respect bonus: +{item.respectBonus ?? 0}</p>
                  <p className="meta">Unlocks at {item.unlockRank}</p>
                  <p className="price-tag">{formatMoney(item.price)}</p>
                  <button
                    className="button"
                    disabled={!accessToken || actionKey === item.id}
                    type="button"
                    onClick={() => void handlePurchase(item)}
                  >
                    {actionKey === item.id ? "Processing..." : "Buy vehicle"}
                  </button>
                </article>
              ))}
            </div>
          </section>
        )
      ) : realEstateItems.length === 0 ? (
        <section className="panel">
          <p className="muted">No houses are unlocked at your current level yet.</p>
        </section>
      ) : (
        <section className="panel">
          <p className="eyebrow">Real estate</p>
          <h2>Properties</h2>
          <p className="muted">Purchased houses are stored as owned assets in your inventory.</p>
          <div className="card-grid">
            {realEstateItems.map((item) => (
              <article key={item.id} className="subpanel">
                <p className="eyebrow">Owned asset</p>
                <h3>{item.name}</h3>
                <p className="muted">Real estate / property</p>
                <p className="meta">
                  Respect bonus: +{item.respectBonus ?? 0} / Parking slots: {item.parkingSlots ?? 0}
                </p>
                <p className="meta">Unlocks at {item.unlockRank}</p>
                <p className="price-tag">{formatMoney(item.price)}</p>
                <button
                  className="button"
                  disabled={!accessToken || actionKey === item.id}
                  type="button"
                  onClick={() => void handlePurchase(item)}
                >
                  {actionKey === item.id ? "Processing..." : "Buy property"}
                </button>
              </article>
            ))}
          </div>
        </section>
      )}
    </AppShell>
  );
}
