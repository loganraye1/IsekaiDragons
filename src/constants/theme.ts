import type { ScreenKey } from "../types";

export const APP_VERSION = "0.1.0-alpha";

export const uiTheme = {
  colors: {
    ink: "#080611",
    panel: "#120b26",
    panelRaised: "rgba(255,255,255,0.09)",
    panelStrong: "rgba(10,7,21,0.92)",
    border: "rgba(255,255,255,0.14)",
    borderStrong: "rgba(248,217,135,0.36)",
    text: "#fff8ef",
    muted: "#b9aee3",
    faint: "#7f73ad",
    gold: "#f8d987",
    goldDark: "#1e1235",
    green: "#8fffd2",
    info: "#8ff7ff",
    danger: "#ff784f"
  },
  radius: {
    sm: 14,
    md: 18,
    lg: 22,
    xl: 30
  },
  shadow: {
    shadowColor: "#000",
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8
  }
};

export const tabs: Array<{ key: ScreenKey; label: string }> = [
  { key: "den", label: "Den" },
  { key: "adventure", label: "Adventure" },
  { key: "upgrade", label: "Upgrade" },
  { key: "quests", label: "Quests" },
  { key: "shop", label: "Shop" }
];
