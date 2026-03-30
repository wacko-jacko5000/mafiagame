"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import type { InventoryItem, ShopItem, ShopItemCategory } from "../lib/api-types";
import { ApiError } from "../lib/api-client";
import { formatMoney } from "../lib/formatters";
import { gameApi } from "../lib/game-api";
import { AppShell } from "./app-shell";
import { usePlayerState } from "./providers/player-state-provider";
import { useSession } from "./providers/session-provider";

const shopSectionTabs: { section: ShopSection; href: string; label: string }[] = [
  { section: "weapons", href: "/shop/weapons", label: "Weapons & Armor" },
  { section: "drugs", href: "/shop/drugs", label: "Drugs" },
  { section: "garage", href: "/shop/garage", label: "Garage" },
  { section: "realestate", href: "/shop/real-estate", label: "Real Estate" }
];

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
  sniper: "Sniper Rifles",
  special: "Special Weapons",
  armor: "Armor"
};

function getBuyButtonLabel(item: ShopItem): string {
  if (item.type === "weapon") return "Buy weapon";
  if (item.type === "armor") return "Buy armor";
  if (item.type === "vehicle") return "Buy vehicle";
  if (item.type === "property") return "Buy property";
  return "Buy and use";
}

function describeItemStats(item: ShopItem): string {
  if (item.weaponStats) {
    return `+${item.weaponStats.damageBonus} attack`;
  }
  if (item.armorStats) {
    return `-${item.armorStats.damageReduction} damage taken`;
  }
  if (item.consumableEffects && item.consumableEffects.length > 0) {
    return item.consumableEffects
      .map((e) => `+${e.amount} ${e.resource}`)
      .join(" / ");
  }
  if (item.type === "vehicle") {
    return item.respectBonus ? `+${item.respectBonus} respect bonus` : "Prestige item";
  }
  if (item.type === "property") {
    const parts: string[] = [];
    if (item.respectBonus) parts.push(`+${item.respectBonus} respect`);
    if (item.parkingSlots) parts.push(`${item.parkingSlots} parking slot${item.parkingSlots !== 1 ? "s" : ""}`);
    return parts.join(" · ") || "Prestige item";
  }
  return "";
}

function getShopSection(item: ShopItem): ShopSection {
  if (item.category === "drugs") return "drugs";
  if (item.category === "garage") return "garage";
  if (item.category === "realestate") return "realestate";
  return "weapons";
}

function ShopItemCard({
  item,
  isOwned,
  isEquipped,
  actionKey,
  onPurchase
}: {
  item: ShopItem;
  isOwned: boolean;
  isEquipped: boolean;
  actionKey: string | null;
  onPurchase: (item: ShopItem) => void;
}) {
  const loading = actionKey === item.id;

  return (
    <article className="subpanel">
      {isOwned ? (
        <p className="eyebrow" style={{ color: "var(--color-success, #4caf50)" }}>
          {isEquipped ? "Equipped" : "Owned"}
        </p>
      ) : (
        <p className="eyebrow">Unlocked</p>
      )}
      <h3>{item.name}</h3>
      <p className="muted">{describeItemStats(item)}</p>
      <p className="price-tag">{formatMoney(item.price)}</p>
      <p className="meta">Requires rank: {item.unlockRank}</p>
      {item.type === "vehicle" && (
        <p className="meta" style={{ color: "var(--color-warning, #ff9800)", fontSize: "0.8em" }}>
          Needs 1 parking slot
        </p>
      )}
      <button
        className="button"
        disabled={!actionKey && isOwned ? true : loading}
        style={isOwned ? { opacity: 0.5 } : undefined}
        type="button"
        onClick={() => onPurchase(item)}
      >
        {loading ? "Processing..." : isOwned ? "Already owned" : getBuyButtonLabel(item)}
      </button>
    </article>
  );
}

function LockedItemCard({ item }: { item: ShopItem }) {
  return (
    <article className="subpanel" style={{ opacity: 0.45 }}>
      <p className="eyebrow" style={{ color: "var(--color-muted, #888)" }}>Locked</p>
      <h3>{item.name}</h3>
      <p className="muted">{describeItemStats(item)}</p>
      <p className="price-tag">{formatMoney(item.price)}</p>
      <p className="meta">Unlocks at rank: {item.unlockRank}</p>
      <button className="button" disabled type="button">
        Locked
      </button>
    </article>
  );
}

export function ShopPage({
  initialSection = "weapons"
}: Readonly<{
  initialSection?: ShopSection;
}>) {
  const { accessToken, account } = useSession();
  const { player, refreshPlayer } = usePlayerState();
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
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
      const [nextShopItems, nextInventory] = await Promise.all([
        gameApi.inventory.listShopItems(accessToken),
        gameApi.inventory.getCurrentInventory(accessToken)
      ]);

      setShopItems(nextShopItems);
      setInventory(nextInventory);
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
          ? `${item.name} used. ${describeItemStats(item)} applied.`
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

  const ownedItemIds = useMemo(
    () => new Set(inventory.map((i) => i.itemId)),
    [inventory]
  );

  const equippedItemIds = useMemo(
    () => new Set(inventory.filter((i) => i.equippedSlot !== null).map((i) => i.itemId)),
    [inventory]
  );

  const unlockedItems = useMemo(
    () => shopItems.filter((item) => item.isUnlocked),
    [shopItems]
  );

  const lockedItems = useMemo(
    () => shopItems.filter((item) => item.isLocked),
    [shopItems]
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
      if (getShopSection(item) !== "weapons") continue;
      groups
        .get(item.category as Exclude<ShopItemCategory, "drugs" | "garage" | "realestate">)
        ?.push(item);
    }

    return weaponCategoryOrder
      .filter((category) => (groups.get(category)?.length ?? 0) > 0)
      .map((category) => ({
        category,
        label: weaponCategoryLabels[category],
        items: groups.get(category) ?? []
      }));
  }, [unlockedItems]);

  const lockedWeaponGroups = useMemo(() => {
    const groups = new Map<
      Exclude<ShopItemCategory, "drugs" | "garage" | "realestate">,
      ShopItem[]
    >();

    for (const category of weaponCategoryOrder) {
      groups.set(category, []);
    }

    for (const item of lockedItems) {
      if (getShopSection(item) !== "weapons") continue;
      const list = groups.get(
        item.category as Exclude<ShopItemCategory, "drugs" | "garage" | "realestate">
      );
      if (list && list.length < 2) list.push(item);
    }

    return weaponCategoryOrder
      .filter((category) => (groups.get(category)?.length ?? 0) > 0)
      .map((category) => ({
        category,
        label: weaponCategoryLabels[category],
        items: groups.get(category) ?? []
      }));
  }, [lockedItems]);

  const drugItems = useMemo(
    () => unlockedItems.filter((item) => getShopSection(item) === "drugs"),
    [unlockedItems]
  );
  const lockedDrugItems = useMemo(
    () => lockedItems.filter((item) => getShopSection(item) === "drugs").slice(0, 2),
    [lockedItems]
  );

  const garageItems = useMemo(
    () => unlockedItems.filter((item) => getShopSection(item) === "garage"),
    [unlockedItems]
  );
  const lockedGarageItems = useMemo(
    () => lockedItems.filter((item) => getShopSection(item) === "garage").slice(0, 3),
    [lockedItems]
  );

  const realEstateItems = useMemo(
    () => unlockedItems.filter((item) => getShopSection(item) === "realestate"),
    [unlockedItems]
  );
  const lockedRealEstateItems = useMemo(
    () => lockedItems.filter((item) => getShopSection(item) === "realestate").slice(0, 3),
    [lockedItems]
  );

  return (
    <AppShell
      title="Shop"
      subtitle="Buy weapons, drugs, vehicles, and real estate with level-based access."
    >
      <nav className="panel" style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", padding: "0.75rem 1rem" }}>
        {shopSectionTabs.map((tab) => (
          <Link
            key={tab.section}
            href={tab.href}
            className={activeSection === tab.section ? "button" : "button button-secondary"}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {error ? <p className="notice notice-error">{error}</p> : null}
      {successMessage ? <p className="notice notice-success">{successMessage}</p> : null}

      {isLoading ? (
        <section className="panel">
          <p className="muted">Loading shop...</p>
        </section>
      ) : activeSection === "weapons" ? (
        <>
          {weaponGroups.length === 0 && lockedWeaponGroups.length === 0 ? (
            <section className="panel">
              <p className="muted">No weapons or armor are available yet.</p>
            </section>
          ) : null}
          {weaponGroups.map((group) => (
            <section key={group.category} className="panel">
              <p className="eyebrow">{group.label}</p>
              <h2>{group.label}</h2>
              <div className="card-grid">
                {group.items.map((item) => (
                  <ShopItemCard
                    key={item.id}
                    item={item}
                    isOwned={ownedItemIds.has(item.id)}
                    isEquipped={equippedItemIds.has(item.id)}
                    actionKey={actionKey}
                    onPurchase={handlePurchase}
                  />
                ))}
                {lockedWeaponGroups
                  .find((g) => g.category === group.category)
                  ?.items.map((item) => (
                    <LockedItemCard key={item.id} item={item} />
                  ))}
              </div>
            </section>
          ))}
          {lockedWeaponGroups
            .filter((g) => !weaponGroups.some((ug) => ug.category === g.category))
            .map((group) => (
              <section key={group.category} className="panel">
                <p className="eyebrow">{group.label}</p>
                <h2>{group.label}</h2>
                <div className="card-grid">
                  {group.items.map((item) => (
                    <LockedItemCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            ))}
        </>
      ) : activeSection === "drugs" ? (
        <section className="panel">
          <p className="eyebrow">Drugs &amp; Consumables</p>
          <h2>Consumables</h2>
          <p className="muted">
            Consumables are used immediately on purchase and restore energy or health up to the server-side maximum.
          </p>
          {drugItems.length === 0 && lockedDrugItems.length === 0 ? (
            <p className="muted">No consumables available yet.</p>
          ) : (
            <div className="card-grid">
              {drugItems.map((item) => (
                <ShopItemCard
                  key={item.id}
                  item={item}
                  isOwned={false}
                  isEquipped={false}
                  actionKey={actionKey}
                  onPurchase={handlePurchase}
                />
              ))}
              {lockedDrugItems.map((item) => (
                <LockedItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>
      ) : activeSection === "garage" ? (
        <section className="panel">
          <p className="eyebrow">Garage</p>
          <h2>Vehicles</h2>
          <p className="muted">
            Purchased vehicles are stored in your inventory. Each vehicle requires 1 parking slot from a property you own.
          </p>
          {player && (
            <p className="meta">
              Parking slots available: {player.availableVehicleSlots} / {player.parkingSlots}
            </p>
          )}
          {garageItems.length === 0 && lockedGarageItems.length === 0 ? (
            <p className="muted">No vehicles available yet.</p>
          ) : (
            <div className="card-grid">
              {garageItems.map((item) => (
                <ShopItemCard
                  key={item.id}
                  item={item}
                  isOwned={ownedItemIds.has(item.id)}
                  isEquipped={false}
                  actionKey={actionKey}
                  onPurchase={handlePurchase}
                />
              ))}
              {lockedGarageItems.map((item) => (
                <LockedItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>
      ) : (
        <section className="panel">
          <p className="eyebrow">Real Estate</p>
          <h2>Properties</h2>
          <p className="muted">
            Properties grant respect bonuses and parking slots for vehicles. Owned outright — no ongoing costs.
          </p>
          {realEstateItems.length === 0 && lockedRealEstateItems.length === 0 ? (
            <p className="muted">No properties available yet.</p>
          ) : (
            <div className="card-grid">
              {realEstateItems.map((item) => (
                <ShopItemCard
                  key={item.id}
                  item={item}
                  isOwned={ownedItemIds.has(item.id)}
                  isEquipped={false}
                  actionKey={actionKey}
                  onPurchase={handlePurchase}
                />
              ))}
              {lockedRealEstateItems.map((item) => (
                <LockedItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>
      )}
    </AppShell>
  );
}
