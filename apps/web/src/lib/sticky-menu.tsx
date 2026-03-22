"use client";

import React from "react";
import type { ReactNode } from "react";

import type {
  StickyHeaderResourceKey,
  StickyMenuConfig,
  StickyMenuDestinationKey
} from "./api-types";

export interface StickyMenuItemMeta {
  key: StickyMenuDestinationKey;
  label: string;
  href: string | null;
  icon: ReactNode;
}

export interface StickyMenuPlacementEntry {
  key: StickyMenuDestinationKey;
  placement: "hidden" | "primary" | "more";
  order: number;
}

const iconClassName = "sticky-nav-icon";

function icon(path: string): ReactNode {
  return (
    <svg
      aria-hidden="true"
      className={iconClassName}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={path} />
    </svg>
  );
}

export const stickyMenuRegistry: Record<StickyMenuDestinationKey, StickyMenuItemMeta> = {
  home: { key: "home", label: "Home", href: "/", icon: icon("M3 11.5 12 4l9 7.5M6 10v10h12V10") },
  crimes: {
    key: "crimes",
    label: "Crimes",
    href: "/crimes",
    icon: icon("M8 5h8M7 9h10M6 13h12M9 17h6")
  },
  missions: {
    key: "missions",
    label: "Missions",
    href: "/missions",
    icon: icon("M6 4h12v16l-6-3-6 3V4")
  },
  shop: {
    key: "shop",
    label: "Shop",
    href: "/shop",
    icon: icon("M5 8h14l-1 12H6L5 8ZM8 8V6a4 4 0 1 1 8 0v2")
  },
  business: {
    key: "business",
    label: "Business",
    href: "/business",
    icon: icon("M4 20V8l4-3 4 3v12M12 20V5l4-2 4 2v15")
  },
  inventory: {
    key: "inventory",
    label: "Inventory",
    href: "/inventory",
    icon: icon("M5 8h14v11H5V8Zm2-3h10v3H7V5Z")
  },
  activity: {
    key: "activity",
    label: "Activity",
    href: "/activity",
    icon: icon("M4 13h4l2-5 4 10 2-5h4")
  },
  achievements: {
    key: "achievements",
    label: "Achievements",
    href: "/achievements",
    icon: icon("M8 5h8v3a4 4 0 0 1-8 0V5Zm4 7v7M8 21h8M6 5H4a2 2 0 0 0 2 2M18 5h2a2 2 0 0 1-2 2")
  },
  gangs: {
    key: "gangs",
    label: "Gangs",
    href: "/gangs",
    icon: icon("M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3 20a5 5 0 0 1 10 0M11 20a5 5 0 0 1 10 0")
  },
  territory: {
    key: "territory",
    label: "Territory",
    href: "/territory",
    icon: icon("M5 5v14l5-3 4 3 5-2V3l-5 2-4-3-5 3Z")
  },
  market: {
    key: "market",
    label: "Market",
    href: "/market",
    icon: icon("M4 7h16M6 7l1 12h10l1-12M9 11h6M10 4h4")
  },
  leaderboard: {
    key: "leaderboard",
    label: "Leaderboard",
    href: "/leaderboard",
    icon: icon("M6 20V10M12 20V4M18 20v-7")
  },
  more: {
    key: "more",
    label: "More",
    href: null,
    icon: icon("M5 12h.01M12 12h.01M19 12h.01")
  }
};

export const stickyHeaderResourceLabels: Record<StickyHeaderResourceKey, string> = {
  cash: "Cash",
  respect: "Respect",
  energy: "Energy",
  health: "Health",
  rank: "Rank"
};

export const defaultStickyMenuConfig: StickyMenuConfig = {
  header: {
    enabled: true,
    resourceKeys: ["cash", "respect"]
  },
  primaryItems: ["home", "crimes", "missions", "shop", "more"],
  moreItems: [
    "business",
    "inventory",
    "activity",
    "achievements",
    "gangs",
    "territory",
    "market",
    "leaderboard"
  ],
  availableDestinationKeys: [
    "home",
    "crimes",
    "missions",
    "shop",
    "business",
    "inventory",
    "activity",
    "achievements",
    "gangs",
    "territory",
    "market",
    "leaderboard",
    "more"
  ],
  availableHeaderResourceKeys: ["cash", "respect", "energy", "health", "rank"],
  maxPrimaryItems: 5
};

export function isStickyMenuDestinationActive(
  key: StickyMenuDestinationKey,
  pathname: string
): boolean {
  const href = stickyMenuRegistry[key].href;

  if (!href) {
    return false;
  }

  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function createStickyMenuPlacementState(
  config: StickyMenuConfig
): StickyMenuPlacementEntry[] {
  return config.availableDestinationKeys.map((key) => {
    const primaryIndex = config.primaryItems.indexOf(key);

    if (primaryIndex >= 0) {
      return {
        key,
        placement: "primary",
        order: primaryIndex + 1
      };
    }

    if (key !== "more") {
      const moreIndex = config.moreItems.indexOf(key);

      if (moreIndex >= 0) {
        return {
          key,
          placement: "more",
          order: moreIndex + 1
        };
      }
    }

    return {
      key,
      placement: "hidden",
      order: 99
    };
  });
}

export function buildStickyMenuUpdatePayload(input: {
  headerEnabled: boolean;
  resourceKeys: StickyMenuConfig["header"]["resourceKeys"];
  placements: StickyMenuPlacementEntry[];
}) {
  const primaryItems = input.placements
    .filter((entry) => entry.placement === "primary")
    .sort((left, right) => left.order - right.order)
    .map((entry) => entry.key);
  const moreItems = input.placements
    .filter(
      (entry): entry is StickyMenuPlacementEntry & { key: Exclude<StickyMenuDestinationKey, "more"> } =>
        entry.placement === "more" && entry.key !== "more"
    )
    .sort((left, right) => left.order - right.order)
    .map((entry) => entry.key);

  return {
    header: {
      enabled: input.headerEnabled,
      resourceKeys: [...input.resourceKeys]
    },
    primaryItems,
    moreItems
  };
}
