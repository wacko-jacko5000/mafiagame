"use client";

import { useEffect, useState } from "react";

import type {
  AdminBalanceAuditEntry,
  AdminBalanceSectionKey,
  AdminBalanceSectionView,
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
  { value: "shop-items", label: "Shop items" }
];

type SaveState = Record<string, boolean>;
type CrimeEditableField =
  | "energyCost"
  | "successRate"
  | "cashRewardMin"
  | "cashRewardMax"
  | "respectReward";
type DistrictEditableField = "payoutAmount" | "payoutCooldownMinutes";

interface CreateSeasonFormState {
  name: string;
  startsAt: string;
  endsAt: string;
}

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
  const [seasonActionId, setSeasonActionId] = useState<string | null>(null);
  const [seasonForm, setSeasonForm] = useState<CreateSeasonFormState>({
    name: "",
    startsAt: "",
    endsAt: ""
  });

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
                price: entry.price
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

      <section className="admin-grid">
        <article className="panel stack">
          <div className="split-row">
            <div>
              <p className="eyebrow">Balance</p>
              <h2>Crime catalog</h2>
            </div>
            <span className="status-pill">
              {sections.find((section) => section.section === "crimes")?.entries.length ?? 0} entries
            </span>
          </div>

          <div className="admin-entry-list">
            {sections
              .find((section) => section.section === "crimes")
              ?.entries.map((entry) => {
                const saveKey = `crimes:${entry.id}`;

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
        </article>

        <article className="panel stack">
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
        </article>

        <article className="panel stack">
          <div className="split-row">
            <div>
              <p className="eyebrow">Balance</p>
              <h2>Starter shop</h2>
            </div>
            <span className="status-pill">
              {sections.find((section) => section.section === "shop-items")?.entries.length ?? 0} entries
            </span>
          </div>

          <div className="admin-entry-list">
            {sections
              .find((section) => section.section === "shop-items")
              ?.entries.map((entry) => {
                const saveKey = `shop-items:${entry.id}`;

                return (
                  <div key={entry.id} className="subpanel stack admin-entry-card">
                    <div className="split-row">
                      <div>
                        <h3>{entry.name}</h3>
                        <p className="muted">
                          {entry.id} | {entry.type}
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

                    <p className="muted">Current price: {formatMoney(entry.price)}</p>
                  </div>
                );
              })}
          </div>
        </article>
      </section>

      <section className="admin-grid admin-grid-secondary">
        <article className="panel stack">
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
        </article>

        <article className="panel stack">
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
        </article>

        <article className="panel stack">
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
        </article>
      </section>
    </AppShell>
  );
}

function formatAuditValue(value: Record<string, number | string | null>): string {
  return Object.entries(value)
    .map(([key, entryValue]) => `${key}: ${String(entryValue)}`)
    .join(", ");
}
