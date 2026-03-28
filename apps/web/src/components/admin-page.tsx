"use client";

import { useEffect, useMemo, useState } from "react";

import type {
  AdminBalanceAuditEntry,
  AdminBalanceSectionKey,
  AdminBalanceSectionView,
  CustodyBalanceEntry,
  CrimeBalanceEntry,
  DistrictBalanceEntry,
  Season,
  StickyHeaderResourceKey,
  StickyMenuConfig,
  StickyMenuDestinationKey,
  ShopItemBalanceEntry
} from "../lib/api-types";
import { ApiError } from "../lib/api-client";
import { formatDateTime, formatMoney, formatPercent } from "../lib/formatters";
import { gameApi } from "../lib/game-api";
import {
  buildStickyMenuUpdatePayload,
  createStickyMenuPlacementState,
  stickyHeaderResourceLabels,
  stickyMenuRegistry,
  type StickyMenuPlacementEntry
} from "../lib/sticky-menu";
import { AppShell } from "./app-shell";
import { useSession } from "./providers/session-provider";

const auditFilterOptions: Array<{ value: "all" | AdminBalanceSectionKey; label: string }> = [
  { value: "all", label: "All sections" },
  { value: "crimes", label: "Crimes" },
  { value: "districts", label: "Districts" },
  { value: "shop-items", label: "Shop items" },
  { value: "custody", label: "Custody" }
];

type SaveState = Record<string, boolean>;
type CrimeEditableField =
  | "energyCost"
  | "successRate"
  | "cashRewardMin"
  | "cashRewardMax"
  | "respectReward";
type DistrictEditableField = "payoutAmount" | "payoutCooldownMinutes";
type CustodyEditableField =
  | "escalationEnabled"
  | "escalationPercentage"
  | "minimumPrice"
  | "roundingRule";
type ShopItemFilter = "all" | "weapons" | "drugs" | "garage" | "realestate";
type CrimeLevelFilter = "all" | number;

interface CreateSeasonFormState {
  name: string;
  startsAt: string;
  endsAt: string;
}

interface CreateCrimeFormState {
  id: string;
  name: string;
  unlockLevel: number;
  difficulty: "easy" | "medium" | "hard" | "very_hard";
  cashRewardMin: number;
  cashRewardMax: number;
  respectReward: number;
}

interface CreateShopItemFormState {
  id: string;
  name: string;
  kind: "weapon" | "drug" | "car" | "house";
  weaponCategory: "handguns" | "smg" | "assault_rifle" | "sniper" | "special";
  unlockLevel: number;
  price: number;
  respectBonus: number;
  parkingSlots: number;
  damageBonus: number;
  effectResource: "energy" | "health";
  effectAmount: number;
}

type AdminWorkspaceSection =
  | "overview"
  | "crimes"
  | "districts"
  | "shop-items"
  | "custody"
  | "sticky-menu"
  | "audit"
  | "seasons";

interface AdminWorkspaceTab {
  id: AdminWorkspaceSection;
  label: string;
  eyebrow: string;
  description: string;
}

const adminWorkspaceTabs: AdminWorkspaceTab[] = [
  {
    id: "overview",
    label: "Overview",
    eyebrow: "Console",
    description: "See the full admin surface at a glance and jump into a single work area."
  },
  {
    id: "crimes",
    label: "Crimes",
    eyebrow: "Balance",
    description: "Tune success rates, costs, and rewards for criminal actions."
  },
  {
    id: "districts",
    label: "Districts",
    eyebrow: "Balance",
    description: "Adjust district payouts and claim cooldown pacing."
  },
  {
    id: "shop-items",
    label: "Shop",
    eyebrow: "Balance",
    description: "Manage starter shop pricing without mixing in other controls."
  },
  {
    id: "custody",
    label: "Custody",
    eyebrow: "Balance",
    description: "Control jail and hospital buyout pricing in one place."
  },
  {
    id: "sticky-menu",
    label: "Mobile Nav",
    eyebrow: "Shell",
    description: "Configure the mobile sticky header and destination layout."
  },
  {
    id: "audit",
    label: "Audit",
    eyebrow: "Trace",
    description: "Review recent balance changes and filter down to a target."
  },
  {
    id: "seasons",
    label: "Seasons",
    eyebrow: "Lifecycle",
    description: "Create, activate, and deactivate seasonal runs."
  }
];

const playerRankLabels: Record<number, string> = {
  1: "Scum",
  2: "Empty Suit",
  3: "Delivery Boy",
  4: "Outsider",
  5: "Picciotto",
  6: "Shoplifter",
  7: "Pickpocket",
  8: "Thief",
  9: "Associate",
  10: "Mobster",
  11: "Soldier",
  12: "Swindler",
  13: "Assassin",
  14: "Local Chief",
  15: "Chief",
  16: "Caporegime",
  17: "Underboss",
  18: "Consigliere",
  19: "Godfather",
  20: "Don",
  21: "Legendary Don"
};

export function AdminPage() {
  const { accessToken, account } = useSession();
  const [sections, setSections] = useState<AdminBalanceSectionView[]>([]);
  const [auditEntries, setAuditEntries] = useState<AdminBalanceAuditEntry[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [stickyMenuConfig, setStickyMenuConfig] = useState<StickyMenuConfig | null>(null);
  const [stickyMenuPlacements, setStickyMenuPlacements] = useState<StickyMenuPlacementEntry[]>(
    []
  );
  const [stickyHeaderEnabled, setStickyHeaderEnabled] = useState(true);
  const [stickyHeaderResourceKeys, setStickyHeaderResourceKeys] = useState<
    StickyHeaderResourceKey[]
  >(["cash", "respect"]);
  const [isLoading, setIsLoading] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>({});
  const [auditSectionFilter, setAuditSectionFilter] = useState<"all" | AdminBalanceSectionKey>(
    "all"
  );
  const [auditTargetFilter, setAuditTargetFilter] = useState("");
  const [isRefreshingAudit, setIsRefreshingAudit] = useState(false);
  const [isCreatingSeason, setIsCreatingSeason] = useState(false);
  const [isCreatingCrime, setIsCreatingCrime] = useState(false);
  const [isCreatingShopItem, setIsCreatingShopItem] = useState(false);
  const [seasonActionId, setSeasonActionId] = useState<string | null>(null);
  const [shopItemFilter, setShopItemFilter] = useState<ShopItemFilter>("all");
  const [crimeLevelFilter, setCrimeLevelFilter] = useState<CrimeLevelFilter>("all");
  const [activeSection, setActiveSection] = useState<AdminWorkspaceSection>("overview");
  const [seasonForm, setSeasonForm] = useState<CreateSeasonFormState>({
    name: "",
    startsAt: "",
    endsAt: ""
  });
  const [createCrimeForm, setCreateCrimeForm] = useState<CreateCrimeFormState>({
    id: "",
    name: "",
    unlockLevel: 1,
    difficulty: "easy",
    cashRewardMin: 50,
    cashRewardMax: 100,
    respectReward: 1
  });
  const [createShopItemForm, setCreateShopItemForm] = useState<CreateShopItemFormState>({
    id: "",
    name: "",
    kind: "weapon",
    weaponCategory: "handguns",
    unlockLevel: 1,
    price: 500,
    respectBonus: 1,
    parkingSlots: 1,
    damageBonus: 2,
    effectResource: "energy",
    effectAmount: 20
  });

  const crimeSection = useMemo(
    () => sections.find((section) => section.section === "crimes") ?? null,
    [sections]
  );
  const districtSection = useMemo(
    () => sections.find((section) => section.section === "districts") ?? null,
    [sections]
  );
  const custodySection = useMemo(
    () => sections.find((section) => section.section === "custody") ?? null,
    [sections]
  );

  const shopItemSection = useMemo(
    () => sections.find((section) => section.section === "shop-items") ?? null,
    [sections]
  );

  const filteredShopEntries = useMemo(() => {
    const entries = shopItemSection?.entries ?? [];

    if (shopItemFilter === "all") {
      return entries;
    }

    if (shopItemFilter === "weapons") {
      return entries.filter(
        (entry) =>
          !["drugs", "garage", "realestate"].includes(entry.category)
      );
    }

    return entries.filter((entry) => entry.category === shopItemFilter);
  }, [shopItemFilter, shopItemSection]);

  const crimeLevelOptions = useMemo(() => {
    const levels = new Set((crimeSection?.entries ?? []).map((entry) => entry.unlockLevel));
    return [...levels].sort((left, right) => left - right);
  }, [crimeSection]);

  const filteredCrimeEntries = useMemo(() => {
    const entries = crimeSection?.entries ?? [];

    if (crimeLevelFilter === "all") {
      return entries;
    }

    return entries.filter((entry) => entry.unlockLevel === crimeLevelFilter);
  }, [crimeLevelFilter, crimeSection]);

  const activeTab = useMemo(
    () => adminWorkspaceTabs.find((tab) => tab.id === activeSection) ?? adminWorkspaceTabs[0],
    [activeSection]
  );

  useEffect(() => {
    if (!accessToken || !account?.isAdmin) {
      return;
    }

    void loadDashboard(accessToken);
  }, [accessToken, account?.isAdmin]);

  async function loadDashboard(nextAccessToken: string) {
    setIsLoading(true);
    setPageError(null);

    try {
      const [balanceResponse, auditResponse, nextSeasons, nextStickyMenu] = await Promise.all([
        gameApi.admin.listBalance(nextAccessToken),
        gameApi.admin.listAudit(nextAccessToken, { limit: 20 }),
        gameApi.seasons.listAll(),
        gameApi.admin.getStickyMenu(nextAccessToken)
      ]);

      setSections(balanceResponse.sections);
      setAuditEntries(auditResponse.entries);
      setSeasons(nextSeasons);
      setStickyMenuConfig(nextStickyMenu);
      setStickyMenuPlacements(createStickyMenuPlacementState(nextStickyMenu));
      setStickyHeaderEnabled(nextStickyMenu.header.enabled);
      setStickyHeaderResourceKeys(nextStickyMenu.header.resourceKeys);
    } catch (nextError) {
      setPageError(
        nextError instanceof ApiError
          ? nextError.message
          : "Unable to load admin console data."
      );
    } finally {
      setIsLoading(false);
    }
  }

  function updateCrimeEntry(entryId: string, field: CrimeEditableField, value: number) {
    setSections((currentSections) =>
      currentSections.map((section) =>
        section.section !== "crimes"
          ? section
          : {
              ...section,
              entries: section.entries.map((entry) =>
                entry.id === entryId ? { ...entry, [field]: value } : entry
              )
            }
      )
    );
  }

  function updateDistrictEntry(entryId: string, field: DistrictEditableField, value: number) {
    setSections((currentSections) =>
      currentSections.map((section) =>
        section.section !== "districts"
          ? section
          : {
              ...section,
              entries: section.entries.map((entry) =>
                entry.id === entryId ? { ...entry, [field]: value } : entry
              )
            }
      )
    );
  }

  function updateShopItemEntry(entryId: string, value: number) {
    setSections((currentSections) =>
      currentSections.map((section) =>
        section.section !== "shop-items"
          ? section
          : {
              ...section,
              entries: section.entries.map((entry) =>
                entry.id === entryId ? { ...entry, price: value } : entry
              )
            }
      )
    );
  }

  function updateCustodyEntry(
    entryId: CustodyBalanceEntry["id"],
    field: CustodyEditableField,
    value: boolean | number | "ceil" | null
  ) {
    setSections((currentSections) =>
      currentSections.map((section) =>
        section.section !== "custody"
          ? section
          : {
              ...section,
              entries: section.entries.map((entry) =>
                entry.id === entryId ? { ...entry, [field]: value } : entry
              )
            }
      )
    );
  }

  function updateCustodyLevelEntry(
    entryId: CustodyBalanceEntry["id"],
    level: number,
    basePricePerMinute: number
  ) {
    setSections((currentSections) =>
      currentSections.map((section) =>
        section.section !== "custody"
          ? section
          : {
              ...section,
              entries: section.entries.map((entry) =>
                entry.id !== entryId
                  ? entry
                  : {
                      ...entry,
                      levels: entry.levels.map((levelEntry) =>
                        levelEntry.level === level
                          ? {
                              ...levelEntry,
                              basePricePerMinute
                            }
                          : levelEntry
                      )
                    }
              )
            }
      )
    );
  }

  function replaceSection(nextSection: AdminBalanceSectionView) {
    setSections((currentSections) =>
      currentSections.map((section) =>
        section.section === nextSection.section ? nextSection : section
      )
    );
  }

  async function refreshAudit() {
    if (!accessToken) {
      setPageError("Authentication is required.");
      return;
    }

    setIsRefreshingAudit(true);
    setPageError(null);

    try {
      const response = await gameApi.admin.listAudit(accessToken, {
        section: auditSectionFilter === "all" ? undefined : auditSectionFilter,
        targetId: auditTargetFilter.trim() || undefined,
        limit: 20
      });

      setAuditEntries(response.entries);
    } catch (nextError) {
      setPageError(
        nextError instanceof ApiError ? nextError.message : "Unable to refresh audit history."
      );
    } finally {
      setIsRefreshingAudit(false);
    }
  }

  async function saveCrime(entry: CrimeBalanceEntry) {
    if (!accessToken) {
      setPageError("Authentication is required.");
      return;
    }

    const saveKey = `crimes:${entry.id}`;
    setSaveState((current) => ({ ...current, [saveKey]: true }));
    setPageError(null);

    try {
      const nextSection = await gameApi.admin.updateBalance(
        {
          section: "crimes",
          body: {
            crimes: [
              {
                id: entry.id,
                energyCost: entry.energyCost,
                successRate: entry.successRate,
                cashRewardMin: entry.cashRewardMin,
                cashRewardMax: entry.cashRewardMax,
                respectReward: entry.respectReward
              }
            ]
          }
        },
        accessToken
      );

      replaceSection(nextSection);
      await refreshAudit();
    } catch (nextError) {
      setPageError(
        nextError instanceof ApiError ? nextError.message : "Unable to save crime balance."
      );
    } finally {
      setSaveState((current) => ({ ...current, [saveKey]: false }));
    }
  }

  async function createCrime() {
    if (!accessToken) {
      setPageError("Authentication is required.");
      return;
    }

    setIsCreatingCrime(true);
    setPageError(null);

    try {
      const nextSection = await gameApi.admin.createCrime(
        {
          id: createCrimeForm.id.trim(),
          name: createCrimeForm.name.trim(),
          unlockLevel: createCrimeForm.unlockLevel,
          difficulty: createCrimeForm.difficulty,
          cashRewardMin: createCrimeForm.cashRewardMin,
          cashRewardMax: createCrimeForm.cashRewardMax,
          respectReward: createCrimeForm.respectReward
        },
        accessToken
      );

      replaceSection(nextSection);
      setCreateCrimeForm({
        id: "",
        name: "",
        unlockLevel: 1,
        difficulty: "easy",
        cashRewardMin: 50,
        cashRewardMax: 100,
        respectReward: 1
      });
      await refreshAudit();
    } catch (nextError) {
      setPageError(
        nextError instanceof ApiError ? nextError.message : "Unable to create crime."
      );
    } finally {
      setIsCreatingCrime(false);
    }
  }

  async function createShopItem() {
    if (!accessToken) {
      setPageError("Authentication is required.");
      return;
    }

    setIsCreatingShopItem(true);
    setPageError(null);

    try {
      const nextSection = await gameApi.admin.createShopItem(
        {
          id: createShopItemForm.id.trim(),
          name: createShopItemForm.name.trim(),
          kind: createShopItemForm.kind,
          weaponCategory:
            createShopItemForm.kind === "weapon"
              ? createShopItemForm.weaponCategory
              : undefined,
          unlockLevel: createShopItemForm.unlockLevel,
          price: createShopItemForm.price,
          respectBonus:
            createShopItemForm.kind === "car" || createShopItemForm.kind === "house"
              ? createShopItemForm.respectBonus
              : undefined,
          parkingSlots:
            createShopItemForm.kind === "house"
              ? createShopItemForm.parkingSlots
              : undefined,
          damageBonus:
            createShopItemForm.kind === "weapon"
              ? createShopItemForm.damageBonus
              : undefined,
          effectResource:
            createShopItemForm.kind === "drug"
              ? createShopItemForm.effectResource
              : undefined,
          effectAmount:
            createShopItemForm.kind === "drug"
              ? createShopItemForm.effectAmount
              : undefined
        },
        accessToken
      );

      replaceSection(nextSection);
      setCreateShopItemForm({
        id: "",
        name: "",
        kind: "weapon",
        weaponCategory: "handguns",
        unlockLevel: 1,
        price: 500,
        respectBonus: 1,
        parkingSlots: 1,
        damageBonus: 2,
        effectResource: "energy",
        effectAmount: 20
      });
      await refreshAudit();
    } catch (nextError) {
      setPageError(
        nextError instanceof ApiError ? nextError.message : "Unable to create shop item."
      );
    } finally {
      setIsCreatingShopItem(false);
    }
  }

  async function saveDistrict(entry: DistrictBalanceEntry) {
    if (!accessToken) {
      setPageError("Authentication is required.");
      return;
    }

    const saveKey = `districts:${entry.id}`;
    setSaveState((current) => ({ ...current, [saveKey]: true }));
    setPageError(null);

    try {
      const nextSection = await gameApi.admin.updateBalance(
        {
          section: "districts",
          body: {
            districts: [
              {
                id: entry.id,
                payoutAmount: entry.payoutAmount,
                payoutCooldownMinutes: entry.payoutCooldownMinutes
              }
            ]
          }
        },
        accessToken
      );

      replaceSection(nextSection);
      await refreshAudit();
    } catch (nextError) {
      setPageError(
        nextError instanceof ApiError
          ? nextError.message
          : "Unable to save district payout balance."
      );
    } finally {
      setSaveState((current) => ({ ...current, [saveKey]: false }));
    }
  }

  async function saveShopItem(entry: ShopItemBalanceEntry) {
    if (!accessToken) {
      setPageError("Authentication is required.");
      return;
    }

    const saveKey = `shop-items:${entry.id}`;
    setSaveState((current) => ({ ...current, [saveKey]: true }));
    setPageError(null);

    try {
      const nextSection = await gameApi.admin.updateBalance(
        {
          section: "shop-items",
          body: {
            items: [
              {
                id: entry.id,
                name: entry.name,
                unlockLevel: entry.unlockLevel,
                price: entry.price,
                respectBonus: entry.respectBonus ?? null,
                parkingSlots: entry.parkingSlots ?? null,
                damageBonus: entry.damageBonus ?? null,
                effectResource: entry.effectResource ?? null,
                effectAmount: entry.effectAmount ?? null
              }
            ]
          }
        },
        accessToken
      );

      replaceSection(nextSection);
      await refreshAudit();
    } catch (nextError) {
      setPageError(
        nextError instanceof ApiError ? nextError.message : "Unable to save shop item price."
      );
    } finally {
      setSaveState((current) => ({ ...current, [saveKey]: false }));
    }
  }

  async function archiveShopItem(itemId: string) {
    if (!accessToken) {
      setPageError("Authentication is required.");
      return;
    }

    const confirmed = window.confirm(
      "Remove this product from the shop? Existing owned items stay intact, but the item will no longer be buyable."
    );

    if (!confirmed) {
      return;
    }

    const saveKey = `shop-items:archive:${itemId}`;
    setSaveState((current) => ({ ...current, [saveKey]: true }));
    setPageError(null);

    try {
      const nextSection = await gameApi.admin.archiveShopItem(itemId, accessToken);
      replaceSection(nextSection);
      await refreshAudit();
    } catch (nextError) {
      setPageError(
        nextError instanceof ApiError ? nextError.message : "Unable to archive shop item."
      );
    } finally {
      setSaveState((current) => ({ ...current, [saveKey]: false }));
    }
  }

  async function saveCustody(entry: CustodyBalanceEntry) {
    if (!accessToken) {
      setPageError("Authentication is required.");
      return;
    }

    const saveKey = `custody:${entry.id}`;
    setSaveState((current) => ({ ...current, [saveKey]: true }));
    setPageError(null);

    try {
      const nextSection = await gameApi.admin.updateBalance(
        {
          section: "custody",
          body: {
            entries: [
              {
                statusType: entry.id,
                escalationEnabled: entry.escalationEnabled,
                escalationPercentage: entry.escalationPercentage,
                minimumPrice: entry.minimumPrice,
                roundingRule: entry.roundingRule,
                levels: entry.levels.map((level) => ({
                  level: level.level,
                  basePricePerMinute: level.basePricePerMinute
                }))
              }
            ]
          }
        },
        accessToken
      );

      replaceSection(nextSection);
      await refreshAudit();
    } catch (nextError) {
      setPageError(
        nextError instanceof ApiError
          ? nextError.message
          : "Unable to save custody buyout settings."
      );
    } finally {
      setSaveState((current) => ({ ...current, [saveKey]: false }));
    }
  }

  async function createSeason() {
    if (!accessToken) {
      setPageError("Authentication is required.");
      return;
    }

    setIsCreatingSeason(true);
    setPageError(null);

    try {
      const season = await gameApi.admin.createSeason(
        {
          name: seasonForm.name.trim(),
          startsAt: seasonForm.startsAt ? new Date(seasonForm.startsAt).toISOString() : null,
          endsAt: seasonForm.endsAt ? new Date(seasonForm.endsAt).toISOString() : null
        },
        accessToken
      );

      setSeasons((currentSeasons) => [season, ...currentSeasons]);
      setSeasonForm({ name: "", startsAt: "", endsAt: "" });
    } catch (nextError) {
      setPageError(
        nextError instanceof ApiError ? nextError.message : "Unable to create season."
      );
    } finally {
      setIsCreatingSeason(false);
    }
  }

  async function updateSeasonState(seasonId: string, action: "activate" | "deactivate") {
    if (!accessToken) {
      setPageError("Authentication is required.");
      return;
    }

    setSeasonActionId(`${action}:${seasonId}`);
    setPageError(null);

    try {
      const updatedSeason =
        action === "activate"
          ? await gameApi.admin.activateSeason(seasonId, accessToken)
          : await gameApi.admin.deactivateSeason(seasonId, accessToken);

      const nextSeasons = await gameApi.seasons.listAll();
      setSeasons(
        nextSeasons.map((season) => (season.id === updatedSeason.id ? updatedSeason : season))
      );
    } catch (nextError) {
      setPageError(
        nextError instanceof ApiError ? nextError.message : "Unable to update season status."
      );
    } finally {
      setSeasonActionId(null);
    }
  }

  function updateStickyMenuPlacement(
    key: StickyMenuDestinationKey,
    nextPlacement: StickyMenuPlacementEntry["placement"]
  ) {
    setStickyMenuPlacements((currentPlacements) =>
      currentPlacements.map((entry) =>
        entry.key === key
          ? {
              ...entry,
              placement: nextPlacement,
              order:
                nextPlacement === "hidden"
                  ? 99
                  : Math.max(
                      1,
                      currentPlacements.filter((item) => item.placement === nextPlacement).length +
                        (entry.placement === nextPlacement ? 0 : 1)
                    )
            }
          : entry
      )
    );
  }

  function updateStickyMenuOrder(key: StickyMenuDestinationKey, nextOrder: number) {
    setStickyMenuPlacements((currentPlacements) =>
      currentPlacements.map((entry) =>
        entry.key === key
          ? {
              ...entry,
              order: Number.isFinite(nextOrder) ? Math.max(1, nextOrder) : entry.order
            }
          : entry
      )
    );
  }

  function toggleStickyHeaderResource(resourceKey: StickyHeaderResourceKey) {
    setStickyHeaderResourceKeys((currentKeys) =>
      currentKeys.includes(resourceKey)
        ? currentKeys.filter((key) => key !== resourceKey)
        : [...currentKeys, resourceKey]
    );
  }

  async function saveStickyMenu() {
    if (!accessToken) {
      setPageError("Authentication is required.");
      return;
    }

    const saveKey = "sticky-menu";
    setSaveState((current) => ({ ...current, [saveKey]: true }));
    setPageError(null);

    try {
      const nextStickyMenu = await gameApi.admin.updateStickyMenu(
        buildStickyMenuUpdatePayload({
          headerEnabled: stickyHeaderEnabled,
          resourceKeys: stickyHeaderResourceKeys,
          placements: stickyMenuPlacements
        }),
        accessToken
      );

      setStickyMenuConfig(nextStickyMenu);
      setStickyMenuPlacements(createStickyMenuPlacementState(nextStickyMenu));
      setStickyHeaderEnabled(nextStickyMenu.header.enabled);
      setStickyHeaderResourceKeys(nextStickyMenu.header.resourceKeys);
    } catch (nextError) {
      setPageError(
        nextError instanceof ApiError ? nextError.message : "Unable to save sticky menu settings."
      );
    } finally {
      setSaveState((current) => ({ ...current, [saveKey]: false }));
    }
  }

  return (
    <AppShell
      title="Admin Console"
      subtitle="Role-protected live-ops surface for balance changes, audit inspection, and season lifecycle control."
      mobileNavigation={false}
    >
      {pageError ? <p className="notice notice-error">{pageError}</p> : null}

      <section className="panel stack">
        <div className="split-row admin-toolbar">
          <div>
            <p className="eyebrow">Access</p>
            <h2>Admin account</h2>
            <p className="muted">
              Signed in as {account?.email}. This panel is available only to accounts marked as admins.
            </p>
          </div>
          <button
            className="button"
            type="button"
            disabled={isLoading || !accessToken}
            onClick={() => {
              if (accessToken) {
                void loadDashboard(accessToken);
              }
            }}
          >
            {isLoading ? "Loading..." : "Refresh console"}
          </button>
        </div>
      </section>

      <section className="panel stack">
        <div className="split-row admin-toolbar">
          <div>
            <p className="eyebrow">Workspace</p>
            <h2>{activeTab.label}</h2>
            <p className="muted">{activeTab.description}</p>
          </div>
          <span className="status-pill">{activeTab.eyebrow}</span>
        </div>

        <div className="admin-section-nav">
          {adminWorkspaceTabs.map((tab) => (
            <button
              key={tab.id}
              className={`admin-section-button${activeSection === tab.id ? " is-active" : ""}`}
              type="button"
              onClick={() => setActiveSection(tab.id)}
            >
              <span className="admin-section-button-label">{tab.label}</span>
              <span className="admin-section-button-copy">{tab.description}</span>
            </button>
          ))}
        </div>
      </section>

      {activeSection === "overview" ? (
        <section className="admin-overview-grid">
          <button className="panel stack admin-overview-card" type="button" onClick={() => setActiveSection("crimes")}>
            <div className="split-row">
              <div>
                <p className="eyebrow">Balance</p>
                <h2>Crime catalog</h2>
              </div>
              <span className="status-pill">{crimeSection?.entries.length ?? 0} entries</span>
            </div>
            <p className="muted">Tune costs, rewards, and success rates in a dedicated view.</p>
          </button>

          <button className="panel stack admin-overview-card" type="button" onClick={() => setActiveSection("districts")}>
            <div className="split-row">
              <div>
                <p className="eyebrow">Balance</p>
                <h2>District payouts</h2>
              </div>
              <span className="status-pill">{districtSection?.entries.length ?? 0} entries</span>
            </div>
            <p className="muted">Work on territory economy without the rest of the admin surface in view.</p>
          </button>

          <button className="panel stack admin-overview-card" type="button" onClick={() => setActiveSection("shop-items")}>
            <div className="split-row">
              <div>
                <p className="eyebrow">Balance</p>
                <h2>Starter shop</h2>
              </div>
              <span className="status-pill">{shopItemSection?.entries.length ?? 0} items</span>
            </div>
            <p className="muted">Review pricing for weapons, armor, and drugs in one focused workspace.</p>
          </button>

          <button className="panel stack admin-overview-card" type="button" onClick={() => setActiveSection("custody")}>
            <div className="split-row">
              <div>
                <p className="eyebrow">Balance</p>
                <h2>Custody buyouts</h2>
              </div>
              <span className="status-pill">{custodySection?.entries.length ?? 0} entries</span>
            </div>
            <p className="muted">Adjust jail and hospital pricing separately from all other admin work.</p>
          </button>

          <button className="panel stack admin-overview-card" type="button" onClick={() => setActiveSection("sticky-menu")}>
            <div className="split-row">
              <div>
                <p className="eyebrow">Shell</p>
                <h2>Mobile navigation</h2>
              </div>
              <span className="status-pill">{stickyMenuPlacements.length} destinations</span>
            </div>
            <p className="muted">Change sticky header resources and the mobile layout configuration.</p>
          </button>

          <button className="panel stack admin-overview-card" type="button" onClick={() => setActiveSection("audit")}>
            <div className="split-row">
              <div>
                <p className="eyebrow">Trace</p>
                <h2>Audit trail</h2>
              </div>
              <span className="status-pill">{auditEntries.length} rows</span>
            </div>
            <p className="muted">Inspect recent balance changes and then drill into a filtered history.</p>
          </button>

          <button className="panel stack admin-overview-card" type="button" onClick={() => setActiveSection("seasons")}>
            <div className="split-row">
              <div>
                <p className="eyebrow">Lifecycle</p>
                <h2>Seasons</h2>
              </div>
              <span className="status-pill">{seasons.length} records</span>
            </div>
            <p className="muted">Create drafts and activate or deactivate seasons without unrelated controls nearby.</p>
          </button>
        </section>
      ) : null}

      {["crimes", "districts", "shop-items", "custody"].includes(activeSection) ? (
      <section className="admin-grid">
        {activeSection === "crimes" ? <article className="panel stack">
          <div className="split-row">
            <div>
              <p className="eyebrow">Balance</p>
              <h2>Crime catalog</h2>
            </div>
            <span className="status-pill">
              {filteredCrimeEntries.length} visible
            </span>
          </div>

          <div className="stats-grid compact">
            <label className="field">
              <span>Filter by level</span>
              <select
                value={String(crimeLevelFilter)}
                onChange={(event) => {
                  setCrimeLevelFilter(
                    event.target.value === "all" ? "all" : Number(event.target.value)
                  );
                }}
              >
                <option value="all">All levels</option>
                {crimeLevelOptions.map((level) => (
                  <option key={level} value={level}>
                    {`Level ${level} - ${playerRankLabels[level] ?? "Unknown rank"}`}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="subpanel stack">
            <div className="split-row">
              <div>
                <h3>Create crime</h3>
                <p className="muted">Add a new custom crime to the shared catalog.</p>
              </div>
              <button
                className="button"
                type="button"
                disabled={
                  isCreatingCrime ||
                  !accessToken ||
                  createCrimeForm.id.trim().length === 0 ||
                  createCrimeForm.name.trim().length === 0
                }
                onClick={() => {
                  void createCrime();
                }}
              >
                {isCreatingCrime ? "Creating..." : "Create crime"}
              </button>
            </div>

            <div className="stats-grid compact">
              <label className="field">
                <span>Id</span>
                <input
                  type="text"
                  value={createCrimeForm.id}
                  placeholder="example-custom-crime"
                  onChange={(event) =>
                    setCreateCrimeForm((current) => ({ ...current, id: event.target.value }))
                  }
                />
              </label>
              <label className="field">
                <span>Name</span>
                <input
                  type="text"
                  value={createCrimeForm.name}
                  placeholder="Example Custom Crime"
                  onChange={(event) =>
                    setCreateCrimeForm((current) => ({ ...current, name: event.target.value }))
                  }
                />
              </label>
              <label className="field">
                <span>Unlock level</span>
                <select
                  value={String(createCrimeForm.unlockLevel)}
                  onChange={(event) =>
                    setCreateCrimeForm((current) => ({
                      ...current,
                      unlockLevel: Number(event.target.value)
                    }))
                  }
                >
                  {Object.entries(playerRankLabels).map(([level, rank]) => (
                    <option key={level} value={level}>
                      {`Level ${level} - ${rank}`}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Difficulty</span>
                <select
                  value={createCrimeForm.difficulty}
                  onChange={(event) =>
                    setCreateCrimeForm((current) => ({
                      ...current,
                      difficulty: event.target.value as CreateCrimeFormState["difficulty"]
                    }))
                  }
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                  <option value="very_hard">Very hard</option>
                </select>
              </label>
              <label className="field">
                <span>Cash min</span>
                <input
                  type="number"
                  min="0"
                  value={createCrimeForm.cashRewardMin}
                  onChange={(event) =>
                    setCreateCrimeForm((current) => ({
                      ...current,
                      cashRewardMin: Number(event.target.value)
                    }))
                  }
                />
              </label>
              <label className="field">
                <span>Cash max</span>
                <input
                  type="number"
                  min="0"
                  value={createCrimeForm.cashRewardMax}
                  onChange={(event) =>
                    setCreateCrimeForm((current) => ({
                      ...current,
                      cashRewardMax: Number(event.target.value)
                    }))
                  }
                />
              </label>
              <label className="field">
                <span>Respect</span>
                <input
                  type="number"
                  min="0"
                  value={createCrimeForm.respectReward}
                  onChange={(event) =>
                    setCreateCrimeForm((current) => ({
                      ...current,
                      respectReward: Number(event.target.value)
                    }))
                  }
                />
              </label>
            </div>
          </div>

          <div className="admin-entry-list">
            {filteredCrimeEntries.map((entry) => {
                const saveKey = `crimes:${entry.id}`;

                return (
                  <div key={entry.id} className="subpanel stack admin-entry-card">
                    <div className="split-row">
                      <div>
                        <h3>{entry.name}</h3>
                        <p className="muted">
                          {entry.id} | unlocks at level {entry.unlockLevel} | {entry.difficulty}
                        </p>
                      </div>
                      <button
                        className="button"
                        type="button"
                        disabled={saveState[saveKey] || !accessToken}
                        onClick={() => {
                          void saveCrime(entry);
                        }}
                      >
                        {saveState[saveKey] ? "Saving..." : "Save"}
                      </button>
                    </div>

                    <div className="stats-grid compact">
                      <label className="field">
                        <span>Energy cost</span>
                        <input
                          type="number"
                          value={entry.energyCost}
                          onChange={(event) => {
                            updateCrimeEntry(entry.id, "energyCost", Number(event.target.value));
                          }}
                        />
                      </label>
                      <label className="field">
                        <span>Success rate</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="1"
                          value={entry.successRate}
                          onChange={(event) => {
                            updateCrimeEntry(entry.id, "successRate", Number(event.target.value));
                          }}
                        />
                      </label>
                      <label className="field">
                        <span>Cash min</span>
                        <input
                          type="number"
                          value={entry.cashRewardMin}
                          onChange={(event) => {
                            updateCrimeEntry(
                              entry.id,
                              "cashRewardMin",
                              Number(event.target.value)
                            );
                          }}
                        />
                      </label>
                      <label className="field">
                        <span>Cash max</span>
                        <input
                          type="number"
                          value={entry.cashRewardMax}
                          onChange={(event) => {
                            updateCrimeEntry(
                              entry.id,
                              "cashRewardMax",
                              Number(event.target.value)
                            );
                          }}
                        />
                      </label>
                      <label className="field">
                        <span>Respect</span>
                        <input
                          type="number"
                          value={entry.respectReward}
                          onChange={(event) => {
                            updateCrimeEntry(
                              entry.id,
                              "respectReward",
                              Number(event.target.value)
                            );
                          }}
                        />
                      </label>
                    </div>

                    <p className="muted">Current success rate: {formatPercent(entry.successRate)}</p>
                  </div>
                );
              })}
          </div>
        </article> : null}

        {activeSection === "districts" ? <article className="panel stack">
          <div className="split-row">
            <div>
              <p className="eyebrow">Balance</p>
              <h2>District payouts</h2>
            </div>
            <span className="status-pill">
              {sections.find((section) => section.section === "districts")?.entries.length ?? 0} entries
            </span>
          </div>

          <div className="admin-entry-list">
            {sections
              .find((section) => section.section === "districts")
              ?.entries.map((entry) => {
                const saveKey = `districts:${entry.id}`;

                return (
                  <div key={entry.id} className="subpanel stack admin-entry-card">
                    <div className="split-row">
                      <div>
                        <h3>{entry.name}</h3>
                        <p className="muted">{entry.id}</p>
                      </div>
                      <button
                        className="button"
                        type="button"
                        disabled={saveState[saveKey] || !accessToken}
                        onClick={() => {
                          void saveDistrict(entry);
                        }}
                      >
                        {saveState[saveKey] ? "Saving..." : "Save"}
                      </button>
                    </div>

                    <div className="stats-grid compact">
                      <label className="field">
                        <span>Payout amount</span>
                        <input
                          type="number"
                          value={entry.payoutAmount}
                          onChange={(event) => {
                            updateDistrictEntry(
                              entry.id,
                              "payoutAmount",
                              Number(event.target.value)
                            );
                          }}
                        />
                      </label>
                      <label className="field">
                        <span>Cooldown minutes</span>
                        <input
                          type="number"
                          value={entry.payoutCooldownMinutes}
                          onChange={(event) => {
                            updateDistrictEntry(
                              entry.id,
                              "payoutCooldownMinutes",
                              Number(event.target.value)
                            );
                          }}
                        />
                      </label>
                    </div>

                    <p className="muted">Current payout: {formatMoney(entry.payoutAmount)}</p>
                  </div>
                );
              })}
          </div>
        </article> : null}

        {activeSection === "shop-items" ? <article className="panel stack">
          <div className="split-row">
            <div>
              <p className="eyebrow">Balance</p>
              <h2>Starter shop</h2>
            </div>
            <span className="status-pill">
              {filteredShopEntries.length} visible
            </span>
          </div>

          <div className="shop-category-tabs">
            <button
              className={`button button-secondary shop-category-tab${
                shopItemFilter === "all" ? " is-active" : ""
              }`}
              type="button"
              onClick={() => setShopItemFilter("all")}
            >
              All ({shopItemSection?.entries.length ?? 0})
            </button>
            <button
              className={`button button-secondary shop-category-tab${
                shopItemFilter === "weapons" ? " is-active" : ""
              }`}
              type="button"
              onClick={() => setShopItemFilter("weapons")}
            >
              Weapons ({(shopItemSection?.entries.filter((entry) => !["drugs", "garage", "realestate"].includes(entry.category)).length ?? 0)})
            </button>
            <button
              className={`button button-secondary shop-category-tab${
                shopItemFilter === "drugs" ? " is-active" : ""
              }`}
              type="button"
              onClick={() => setShopItemFilter("drugs")}
            >
              Drugs ({(shopItemSection?.entries.filter((entry) => entry.category === "drugs").length ?? 0)})
            </button>
            <button
              className={`button button-secondary shop-category-tab${
                shopItemFilter === "garage" ? " is-active" : ""
              }`}
              type="button"
              onClick={() => setShopItemFilter("garage")}
            >
              Garage ({(shopItemSection?.entries.filter((entry) => entry.category === "garage").length ?? 0)})
            </button>
            <button
              className={`button button-secondary shop-category-tab${
                shopItemFilter === "realestate" ? " is-active" : ""
              }`}
              type="button"
              onClick={() => setShopItemFilter("realestate")}
            >
              Real estate ({(shopItemSection?.entries.filter((entry) => entry.category === "realestate").length ?? 0)})
            </button>
          </div>

          <div className="subpanel stack">
            <div className="split-row">
              <div>
                <h3>Create shop item</h3>
                <p className="muted">
                  Add weapons, drugs, cars, and houses with a fixed level requirement.
                </p>
              </div>
              <button
                className="button"
                type="button"
                disabled={
                  isCreatingShopItem ||
                  !accessToken ||
                  createShopItemForm.id.trim().length === 0 ||
                  createShopItemForm.name.trim().length === 0
                }
                onClick={() => {
                  void createShopItem();
                }}
              >
                {isCreatingShopItem ? "Creating..." : "Create item"}
              </button>
            </div>

            <div className="stats-grid compact">
              <label className="field">
                <span>Id</span>
                <input
                  type="text"
                  value={createShopItemForm.id}
                  onChange={(event) => {
                    setCreateShopItemForm((current) => ({ ...current, id: event.target.value }));
                  }}
                />
              </label>
              <label className="field">
                <span>Name</span>
                <input
                  type="text"
                  value={createShopItemForm.name}
                  onChange={(event) => {
                    setCreateShopItemForm((current) => ({ ...current, name: event.target.value }));
                  }}
                />
              </label>
              <label className="field">
                <span>Kind</span>
                <select
                  value={createShopItemForm.kind}
                  onChange={(event) => {
                    setCreateShopItemForm((current) => ({
                      ...current,
                      kind: event.target.value as CreateShopItemFormState["kind"]
                    }));
                  }}
                >
                  <option value="weapon">Weapon</option>
                  <option value="drug">Drug</option>
                  <option value="car">Car</option>
                  <option value="house">House</option>
                </select>
              </label>
              <label className="field">
                <span>Unlock level</span>
                <select
                  value={String(createShopItemForm.unlockLevel)}
                  onChange={(event) => {
                    setCreateShopItemForm((current) => ({
                      ...current,
                      unlockLevel: Number(event.target.value)
                    }));
                  }}
                >
                  {Object.entries(playerRankLabels).map(([level, label]) => (
                    <option key={level} value={level}>
                      Level {level} - {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Price</span>
                <input
                  type="number"
                  min="1"
                  value={createShopItemForm.price}
                  onChange={(event) => {
                    setCreateShopItemForm((current) => ({
                      ...current,
                      price: Number(event.target.value)
                    }));
                  }}
                />
              </label>
              {createShopItemForm.kind === "car" || createShopItemForm.kind === "house" ? (
                <label className="field">
                  <span>Respect bonus</span>
                  <input
                    type="number"
                    min="0"
                    value={createShopItemForm.respectBonus}
                    onChange={(event) => {
                      setCreateShopItemForm((current) => ({
                        ...current,
                        respectBonus: Number(event.target.value)
                      }));
                    }}
                  />
                </label>
              ) : null}
              {createShopItemForm.kind === "weapon" ? (
                <>
                  <label className="field">
                    <span>Weapon category</span>
                    <select
                      value={createShopItemForm.weaponCategory}
                      onChange={(event) => {
                        setCreateShopItemForm((current) => ({
                          ...current,
                          weaponCategory: event.target.value as CreateShopItemFormState["weaponCategory"]
                        }));
                      }}
                    >
                      <option value="handguns">Handguns</option>
                      <option value="smg">SMG</option>
                      <option value="assault_rifle">Assault rifle</option>
                      <option value="sniper">Sniper</option>
                      <option value="special">Special</option>
                    </select>
                  </label>
                  <label className="field">
                    <span>Damage bonus</span>
                    <input
                      type="number"
                      min="1"
                      value={createShopItemForm.damageBonus}
                      onChange={(event) => {
                        setCreateShopItemForm((current) => ({
                          ...current,
                          damageBonus: Number(event.target.value)
                        }));
                      }}
                    />
                  </label>
                </>
              ) : null}
              {createShopItemForm.kind === "drug" ? (
                <>
                  <label className="field">
                    <span>Effect resource</span>
                    <select
                      value={createShopItemForm.effectResource}
                      onChange={(event) => {
                        setCreateShopItemForm((current) => ({
                          ...current,
                          effectResource: event.target.value as "energy" | "health"
                        }));
                      }}
                    >
                      <option value="energy">Energy</option>
                      <option value="health">Health</option>
                    </select>
                  </label>
                  <label className="field">
                    <span>Effect amount</span>
                    <input
                      type="number"
                      min="1"
                      value={createShopItemForm.effectAmount}
                      onChange={(event) => {
                        setCreateShopItemForm((current) => ({
                          ...current,
                          effectAmount: Number(event.target.value)
                        }));
                      }}
                    />
                  </label>
                </>
              ) : null}
              {createShopItemForm.kind === "house" ? (
                <label className="field">
                  <span>Parking slots</span>
                  <input
                    type="number"
                    min="1"
                    value={createShopItemForm.parkingSlots}
                    onChange={(event) => {
                      setCreateShopItemForm((current) => ({
                        ...current,
                        parkingSlots: Number(event.target.value)
                      }));
                    }}
                  />
                </label>
              ) : null}
            </div>
          </div>

          <div className="admin-entry-list">
            {filteredShopEntries.map((entry) => {
                const saveKey = `shop-items:${entry.id}`;
                const archiveKey = `shop-items:archive:${entry.id}`;

                return (
                  <div key={entry.id} className="subpanel stack admin-entry-card">
                    <div className="split-row">
                      <div>
                        <h3>{entry.name}</h3>
                        <p className="muted">
                          {entry.id} | {entry.type} | {entry.category} | {entry.delivery} | unlocks at level {entry.unlockLevel}
                          {entry.equipSlot ? ` | ${entry.equipSlot}` : ""}
                        </p>
                      </div>
                      <button
                        className="button"
                        type="button"
                        disabled={saveState[saveKey] || !accessToken}
                        onClick={() => {
                          void saveShopItem(entry);
                        }}
                      >
                        {saveState[saveKey] ? "Saving..." : "Save"}
                      </button>
                    </div>

                    {entry.isCustom ? (
                      <button
                        className="button button-secondary"
                        type="button"
                        disabled={saveState[archiveKey] || !accessToken}
                        onClick={() => {
                          void archiveShopItem(entry.id);
                        }}
                      >
                        {saveState[archiveKey] ? "Removing..." : "Remove item"}
                      </button>
                    ) : (
                      <button
                        className="button button-secondary"
                        type="button"
                        disabled={saveState[archiveKey] || !accessToken}
                        onClick={() => {
                          void archiveShopItem(entry.id);
                        }}
                      >
                        {saveState[archiveKey] ? "Removing..." : "Remove item"}
                      </button>
                    )}

                    <div className="stats-grid compact">
                      <label className="field">
                        <span>Name</span>
                        <input
                          type="text"
                          value={entry.name}
                          onChange={(event) => {
                            setSections((currentSections) =>
                              currentSections.map((section) =>
                                section.section !== "shop-items"
                                  ? section
                                  : {
                                      ...section,
                                      entries: section.entries.map((item) =>
                                        item.id === entry.id
                                          ? { ...item, name: event.target.value }
                                          : item
                                      )
                                    }
                              )
                            );
                          }}
                        />
                      </label>
                      <label className="field">
                        <span>Unlock level</span>
                        <select
                          value={String(entry.unlockLevel)}
                          onChange={(event) => {
                            setSections((currentSections) =>
                              currentSections.map((section) =>
                                section.section !== "shop-items"
                                  ? section
                                  : {
                                      ...section,
                                      entries: section.entries.map((item) =>
                                        item.id === entry.id
                                          ? { ...item, unlockLevel: Number(event.target.value) }
                                          : item
                                      )
                                    }
                              )
                            );
                          }}
                        >
                          {Object.entries(playerRankLabels).map(([level, label]) => (
                            <option key={level} value={level}>
                              Level {level} - {label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="field">
                        <span>Price</span>
                        <input
                          type="number"
                          value={entry.price}
                          onChange={(event) => {
                            updateShopItemEntry(entry.id, Number(event.target.value));
                          }}
                        />
                      </label>
                      {entry.type === "weapon" ? (
                        <label className="field">
                          <span>Damage bonus</span>
                          <input
                            type="number"
                            min="1"
                            value={entry.damageBonus ?? 1}
                            onChange={(event) => {
                              setSections((currentSections) =>
                                currentSections.map((section) =>
                                  section.section !== "shop-items"
                                    ? section
                                    : {
                                        ...section,
                                        entries: section.entries.map((item) =>
                                          item.id === entry.id
                                            ? { ...item, damageBonus: Number(event.target.value) }
                                            : item
                                        )
                                      }
                                )
                              );
                            }}
                          />
                        </label>
                      ) : null}
                      {entry.type === "consumable" ? (
                        <>
                          <label className="field">
                            <span>Effect resource</span>
                            <select
                              value={entry.effectResource ?? "energy"}
                              onChange={(event) => {
                                setSections((currentSections) =>
                                  currentSections.map((section) =>
                                    section.section !== "shop-items"
                                      ? section
                                      : {
                                          ...section,
                                          entries: section.entries.map((item) =>
                                            item.id === entry.id
                                              ? {
                                                  ...item,
                                                  effectResource: event.target.value as "energy" | "health"
                                                }
                                              : item
                                          )
                                        }
                                  )
                                );
                              }}
                            >
                              <option value="energy">Energy</option>
                              <option value="health">Health</option>
                            </select>
                          </label>
                          <label className="field">
                            <span>Effect amount</span>
                            <input
                              type="number"
                              min="1"
                              value={entry.effectAmount ?? 1}
                              onChange={(event) => {
                                setSections((currentSections) =>
                                  currentSections.map((section) =>
                                    section.section !== "shop-items"
                                      ? section
                                      : {
                                          ...section,
                                          entries: section.entries.map((item) =>
                                            item.id === entry.id
                                              ? { ...item, effectAmount: Number(event.target.value) }
                                              : item
                                          )
                                        }
                                  )
                                );
                              }}
                            />
                          </label>
                        </>
                      ) : null}
                      {entry.type === "vehicle" || entry.type === "property" ? (
                        <label className="field">
                          <span>Respect bonus</span>
                          <input
                            type="number"
                            min="0"
                            value={entry.respectBonus ?? 0}
                            onChange={(event) => {
                              setSections((currentSections) =>
                                currentSections.map((section) =>
                                  section.section !== "shop-items"
                                    ? section
                                    : {
                                        ...section,
                                        entries: section.entries.map((item) =>
                                          item.id === entry.id
                                            ? { ...item, respectBonus: Number(event.target.value) }
                                            : item
                                        )
                                      }
                                )
                              );
                            }}
                          />
                        </label>
                      ) : null}
                      {entry.type === "property" ? (
                        <label className="field">
                          <span>Parking slots</span>
                          <input
                            type="number"
                            min="0"
                            value={entry.parkingSlots ?? 0}
                            onChange={(event) => {
                              setSections((currentSections) =>
                                currentSections.map((section) =>
                                  section.section !== "shop-items"
                                    ? section
                                    : {
                                        ...section,
                                        entries: section.entries.map((item) =>
                                          item.id === entry.id
                                            ? { ...item, parkingSlots: Number(event.target.value) }
                                            : item
                                        )
                                      }
                                )
                              );
                            }}
                          />
                        </label>
                      ) : null}
                    </div>

                    {entry.consumableEffects ? (
                      <p className="muted">
                        Effects: {formatConsumableEffects(entry)}
                      </p>
                    ) : (
                      <p className="muted">
                        {entry.equipSlot
                          ? `Equipment item for the ${entry.equipSlot} slot.`
                          : "Owned asset item with no equip slot."}
                      </p>
                    )}
                    {entry.damageBonus !== null ? (
                      <p className="muted">Damage bonus: +{entry.damageBonus}</p>
                    ) : null}
                    {entry.respectBonus !== null ? (
                      <p className="muted">Respect bonus: +{entry.respectBonus}</p>
                    ) : null}
                    {entry.parkingSlots !== null ? (
                      <p className="muted">Parking slots: {entry.parkingSlots}</p>
                    ) : null}
                    <p className="muted">Current price: {formatMoney(entry.price)}</p>
                  </div>
                );
              })}
          </div>
        </article> : null}

        {activeSection === "custody" ? <article className="panel stack">
          <div className="split-row">
            <div>
              <p className="eyebrow">Balance</p>
              <h2>Custody buyouts</h2>
            </div>
            <span className="status-pill">
              {sections.find((section) => section.section === "custody")?.entries.length ?? 0} entries
            </span>
          </div>

          <div className="admin-entry-list">
            {sections
              .find((section) => section.section === "custody")
              ?.entries.map((entry) => {
                const saveKey = `custody:${entry.id}`;

                return (
                  <div key={entry.id} className="subpanel stack admin-entry-card">
                    <div className="split-row">
                      <div>
                        <h3>{entry.name}</h3>
                        <p className="muted">{entry.id}</p>
                      </div>
                      <button
                        className="button"
                        type="button"
                        disabled={saveState[saveKey] || !accessToken}
                        onClick={() => {
                          void saveCustody(entry);
                        }}
                      >
                        {saveState[saveKey] ? "Saving..." : "Save"}
                      </button>
                    </div>

                    <div className="stats-grid compact">
                      <label className="checkbox-row">
                        <input
                          checked={entry.escalationEnabled}
                          type="checkbox"
                          onChange={(event) => {
                            updateCustodyEntry(
                              entry.id,
                              "escalationEnabled",
                              event.target.checked
                            );
                          }}
                        />
                        <span>Escalation enabled</span>
                      </label>
                      <label className="field">
                        <span>Escalation percentage</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="1"
                          value={entry.escalationPercentage}
                          onChange={(event) => {
                            updateCustodyEntry(
                              entry.id,
                              "escalationPercentage",
                              Number(event.target.value)
                            );
                          }}
                        />
                      </label>
                      <label className="field">
                        <span>Minimum price</span>
                        <input
                          type="number"
                          min="0"
                          value={entry.minimumPrice ?? ""}
                          placeholder="Optional"
                          onChange={(event) => {
                            updateCustodyEntry(
                              entry.id,
                              "minimumPrice",
                              event.target.value === ""
                                ? null
                                : Number(event.target.value)
                            );
                          }}
                        />
                      </label>
                      <label className="field">
                        <span>Rounding rule</span>
                        <select
                          value={entry.roundingRule}
                          onChange={(event) => {
                            updateCustodyEntry(
                              entry.id,
                              "roundingRule",
                              event.target.value as "ceil"
                            );
                          }}
                        >
                          <option value="ceil">Always round up</option>
                        </select>
                      </label>
                    </div>

                    <div className="admin-entry-list">
                      {entry.levels.map((levelEntry) => (
                        <div key={levelEntry.level} className="subpanel stack">
                          <div className="split-row">
                            <div>
                              <h3>
                                Level {levelEntry.level} - {levelEntry.rank}
                              </h3>
                            </div>
                            <span className="status-pill">
                              {formatMoney(levelEntry.basePricePerMinute)}/min
                            </span>
                          </div>
                          <label className="field">
                            <span>Base price per minute</span>
                            <input
                              type="number"
                              min="1"
                              value={levelEntry.basePricePerMinute}
                              onChange={(event) => {
                                updateCustodyLevelEntry(
                                  entry.id,
                                  levelEntry.level,
                                  Number(event.target.value)
                                );
                              }}
                            />
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        </article> : null}
      </section>
      ) : null}

      {["sticky-menu", "audit", "seasons"].includes(activeSection) ? (
      <section className="admin-grid admin-grid-secondary">
        {activeSection === "sticky-menu" ? <article className="panel stack">
          <div className="split-row">
            <div>
              <p className="eyebrow">Sticky Menu</p>
              <h2>Mobile shell configuration</h2>
              <p className="muted">
                Assign safe destinations to the mobile header and bottom navigation without allowing raw route edits.
              </p>
            </div>
            <button
              className="button"
              type="button"
              disabled={saveState["sticky-menu"] || !accessToken}
              onClick={() => {
                void saveStickyMenu();
              }}
            >
              {saveState["sticky-menu"] ? "Saving..." : "Save sticky menu"}
            </button>
          </div>

          <div className="subpanel stack">
            <div>
              <h3>Top sticky header</h3>
              <p className="muted">
                Control whether the mobile gameplay header is shown and which player resources it exposes.
              </p>
            </div>

            <label className="checkbox-row">
              <input
                checked={stickyHeaderEnabled}
                type="checkbox"
                onChange={(event) => setStickyHeaderEnabled(event.target.checked)}
              />
              <span>Enable mobile sticky header</span>
            </label>

            <div className="admin-checkbox-grid">
              {(stickyMenuConfig?.availableHeaderResourceKeys ?? [
                "cash",
                "respect",
                "energy",
                "health",
                "rank"
              ]).map((resourceKey) => (
                <label key={resourceKey} className="checkbox-row">
                  <input
                    checked={stickyHeaderResourceKeys.includes(resourceKey)}
                    type="checkbox"
                    onChange={() => toggleStickyHeaderResource(resourceKey)}
                  />
                  <span>{stickyHeaderResourceLabels[resourceKey]}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="subpanel stack">
            <div>
              <h3>Destination placement</h3>
              <p className="muted">
                Set each allowed destination to hidden, primary, or More. Ordering is taken from the numeric order within each group.
              </p>
            </div>

            <div className="admin-entry-list">
              {stickyMenuPlacements
                .slice()
                .sort((left, right) => left.order - right.order || left.key.localeCompare(right.key))
                .map((entry) => (
                  <div key={entry.key} className="subpanel stack admin-entry-card">
                    <div className="split-row">
                      <div>
                        <h3>{stickyMenuRegistry[entry.key].label}</h3>
                        <p className="muted">{entry.key}</p>
                      </div>
                      <span className="status-pill">{entry.placement}</span>
                    </div>

                    <div className="stats-grid compact">
                      <label className="field">
                        <span>Placement</span>
                        <select
                          value={entry.placement}
                          onChange={(event) =>
                            updateStickyMenuPlacement(
                              entry.key,
                              event.target.value as StickyMenuPlacementEntry["placement"]
                            )
                          }
                        >
                          <option value="hidden">Hidden</option>
                          <option value="primary">Primary</option>
                          {entry.key !== "more" ? <option value="more">More</option> : null}
                        </select>
                      </label>
                      <label className="field">
                        <span>Order</span>
                        <input
                          min="1"
                          type="number"
                          value={entry.order}
                          onChange={(event) =>
                            updateStickyMenuOrder(entry.key, Number(event.target.value))
                          }
                        />
                      </label>
                    </div>
                  </div>
                ))}
            </div>

            <div className="stats-grid compact">
              <div className="subpanel">
                <strong>Primary count</strong>
                <p className="muted">
                  {stickyMenuPlacements.filter((entry) => entry.placement === "primary").length}
                  {stickyMenuConfig ? ` / ${stickyMenuConfig.maxPrimaryItems}` : ""}
                </p>
              </div>
              <div className="subpanel">
                <strong>More count</strong>
                <p className="muted">
                  {stickyMenuPlacements.filter((entry) => entry.placement === "more").length}
                </p>
              </div>
            </div>
          </div>
        </article> : null}

        {activeSection === "audit" ? <article className="panel stack">
          <div className="split-row">
            <div>
              <p className="eyebrow">Audit</p>
              <h2>Recent balance changes</h2>
            </div>
            <button
              className="button button-secondary"
              type="button"
              disabled={isRefreshingAudit || !accessToken}
              onClick={() => {
                void refreshAudit();
              }}
            >
              {isRefreshingAudit ? "Refreshing..." : "Refresh audit"}
            </button>
          </div>

          <div className="stats-grid compact">
            <label className="field">
              <span>Section</span>
              <select
                value={auditSectionFilter}
                onChange={(event) => {
                  setAuditSectionFilter(event.target.value as "all" | AdminBalanceSectionKey);
                }}
              >
                {auditFilterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Target id</span>
              <input
                type="text"
                value={auditTargetFilter}
                placeholder="Optional item or district id"
                onChange={(event) => {
                  setAuditTargetFilter(event.target.value);
                }}
              />
            </label>
          </div>

          {auditEntries.length > 0 ? (
            <ul className="list">
              {auditEntries.map((entry) => (
                <li key={entry.id} className="list-item admin-audit-item">
                  <div className="stack compact-stack">
                    <div>
                      <strong>{entry.section}</strong>
                      <p className="muted">{entry.targetId}</p>
                    </div>
                    <p className="muted">
                      Previous: {formatAuditValue(entry.previousValue)} | New:{" "}
                      {formatAuditValue(entry.newValue)}
                    </p>
                  </div>
                  <div className="audit-meta">
                    <span className="meta">{formatDateTime(entry.changedAt)}</span>
                    <span className="meta">
                      Actor: {entry.changedByAccountId ?? "unattributed"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">No audit rows match the current filter.</p>
          )}
        </article> : null}

        {activeSection === "seasons" ? <article className="panel stack">
          <div>
            <p className="eyebrow">Seasons</p>
            <h2>Lifecycle control</h2>
            <p className="muted">
              Create draft seasons, then activate or deactivate them through the admin role.
            </p>
          </div>

          <div className="subpanel stack">
            <h3>Create draft season</h3>
            <label className="field">
              <span>Name</span>
              <input
                type="text"
                value={seasonForm.name}
                placeholder="Summer 2026"
                onChange={(event) => {
                  setSeasonForm((current) => ({ ...current, name: event.target.value }));
                }}
              />
            </label>
            <div className="stats-grid compact">
              <label className="field">
                <span>Starts at</span>
                <input
                  type="datetime-local"
                  value={seasonForm.startsAt}
                  onChange={(event) => {
                    setSeasonForm((current) => ({ ...current, startsAt: event.target.value }));
                  }}
                />
              </label>
              <label className="field">
                <span>Ends at</span>
                <input
                  type="datetime-local"
                  value={seasonForm.endsAt}
                  onChange={(event) => {
                    setSeasonForm((current) => ({ ...current, endsAt: event.target.value }));
                  }}
                />
              </label>
            </div>
            <button
              className="button"
              type="button"
              disabled={isCreatingSeason || !accessToken || seasonForm.name.trim().length === 0}
              onClick={() => {
                void createSeason();
              }}
            >
              {isCreatingSeason ? "Creating..." : "Create season"}
            </button>
          </div>

          {seasons.length > 0 ? (
            <div className="admin-entry-list">
              {seasons.map((season) => {
                const activateKey = `activate:${season.id}`;
                const deactivateKey = `deactivate:${season.id}`;

                return (
                  <div key={season.id} className="subpanel stack admin-entry-card">
                    <div className="split-row">
                      <div>
                        <h3>{season.name}</h3>
                        <p className="muted">{season.id}</p>
                      </div>
                      <span className="status-pill">{season.status}</span>
                    </div>

                    <dl className="stats-grid compact">
                      <div>
                        <dt>Starts</dt>
                        <dd>{formatDateTime(season.startsAt)}</dd>
                      </div>
                      <div>
                        <dt>Ends</dt>
                        <dd>{formatDateTime(season.endsAt)}</dd>
                      </div>
                      <div>
                        <dt>Activated</dt>
                        <dd>{formatDateTime(season.activatedAt)}</dd>
                      </div>
                      <div>
                        <dt>Deactivated</dt>
                        <dd>{formatDateTime(season.deactivatedAt)}</dd>
                      </div>
                    </dl>

                    <div className="inline-actions">
                      <button
                        className="button"
                        type="button"
                        disabled={
                          !accessToken ||
                          season.status === "active" ||
                          seasonActionId === activateKey
                        }
                        onClick={() => {
                          void updateSeasonState(season.id, "activate");
                        }}
                      >
                        {seasonActionId === activateKey ? "Activating..." : "Activate"}
                      </button>
                      <button
                        className="button button-secondary"
                        type="button"
                        disabled={
                          !accessToken ||
                          season.status !== "active" ||
                          seasonActionId === deactivateKey
                        }
                        onClick={() => {
                          void updateSeasonState(season.id, "deactivate");
                        }}
                      >
                        {seasonActionId === deactivateKey ? "Deactivating..." : "Deactivate"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="muted">No seasons have been created yet.</p>
          )}
        </article> : null}
      </section>
      ) : null}
    </AppShell>
  );
}

function formatAuditValue(value: Record<string, number | string | null>): string {
  return Object.entries(value)
    .map(([key, entryValue]) => `${key}: ${String(entryValue)}`)
    .join(", ");
}

function formatConsumableEffects(entry: ShopItemBalanceEntry): string {
  if (!entry.consumableEffects || entry.consumableEffects.length === 0) {
    return "No direct effects";
  }

  return entry.consumableEffects
    .map((effect) => `+${effect.amount} ${effect.resource}`)
    .join(" / ");
}
