// ═══════════════════════════════════════════════════════════
// ScoutGPT v2 — Unified Theme System
// src/theme.js
// ═══════════════════════════════════════════════════════════

import { createContext, useContext, useState, useCallback, useMemo } from "react";

export const darkTheme = {
  bg: {
    primary: "#1C1C1E",
    secondary: "#2C2C2E",
    tertiary: "#3A3A3C",
    elevated: "#48484A",
  },
  accent: {
    primary: "#1877F2",
    primaryHover: "#1565D8",
    primaryMuted: "rgba(24, 119, 242, 0.12)",
    primaryBorder: "rgba(24, 119, 242, 0.25)",
    green: "#34C759",
    greenHover: "#2DB84E",
    greenMuted: "rgba(52, 199, 89, 0.12)",
  },
  text: {
    primary: "rgba(255, 255, 255, 1.0)",
    secondary: "rgba(255, 255, 255, 0.80)",
    tertiary: "rgba(255, 255, 255, 0.55)",
    quaternary: "rgba(255, 255, 255, 0.35)",
  },
  border: {
    subtle: "rgba(255, 255, 255, 0.08)",
    default: "rgba(255, 255, 255, 0.12)",
    strong: "rgba(255, 255, 255, 0.20)",
  },
  semantic: {
    success: "#34C759",
    warning: "#FFD60A",
    error: "#FF453A",
    info: "#0A84FF",
  },
  charts: {
    traffic: ["#34C759", "#FFD60A", "#FF9F0A", "#FF453A"],
    spectrum: ["#5AC8FA", "#0A84FF", "#BF5AF2", "#FF375F"],
    neon: ["#34C759", "#FFD60A", "#FF6961", "#30D5C8", "#BF5AF2", "#0A84FF"],
  },
  font: {
    display: "'DM Sans', sans-serif",
    mono: "'JetBrains Mono', monospace",
  },
};

export const lightTheme = {
  bg: {
    primary: "#FFFFFF",
    secondary: "#F2F2F7",
    tertiary: "#E5E5EA",
    elevated: "#D1D1D6",
  },
  accent: {
    primary: "#1570E8",
    primaryHover: "#1260CC",
    primaryMuted: "rgba(21, 112, 232, 0.08)",
    primaryBorder: "rgba(21, 112, 232, 0.20)",
    green: "#28A745",
    greenHover: "#218838",
    greenMuted: "rgba(40, 167, 69, 0.08)",
  },
  text: {
    primary: "rgba(0, 0, 0, 0.92)",
    secondary: "rgba(0, 0, 0, 0.75)",
    tertiary: "rgba(0, 0, 0, 0.55)",
    quaternary: "rgba(0, 0, 0, 0.35)",
  },
  border: {
    subtle: "rgba(0, 0, 0, 0.06)",
    default: "rgba(0, 0, 0, 0.10)",
    strong: "rgba(0, 0, 0, 0.18)",
  },
  semantic: {
    success: "#28A745",
    warning: "#F5A623",
    error: "#DC3545",
    info: "#007AFF",
  },
  charts: {
    traffic: ["#28A745", "#F5A623", "#E8772E", "#DC3545"],
    spectrum: ["#32ADE6", "#007AFF", "#AF52DE", "#E8375F"],
    neon: ["#28A745", "#F5A623", "#E8575A", "#2AC4B3", "#AF52DE", "#007AFF"],
  },
  font: {
    display: "'DM Sans', sans-serif",
    mono: "'JetBrains Mono', monospace",
  },
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    try {
      return localStorage.getItem("scoutgpt-theme") || "dark";
    } catch {
      return "dark";
    }
  });

  const toggleTheme = useCallback(() => {
    setMode((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      try {
        localStorage.setItem("scoutgpt-theme", next);
      } catch {}
      return next;
    });
  }, []);

  const setTheme = useCallback((newMode) => {
    setMode(newMode);
    try {
      localStorage.setItem("scoutgpt-theme", newMode);
    } catch {}
  }, []);

  const value = useMemo(
    () => ({
      t: mode === "dark" ? darkTheme : lightTheme,
      mode,
      isDark: mode === "dark",
      toggleTheme,
      setTheme,
    }),
    [mode, toggleTheme, setTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      t: darkTheme,
      mode: "dark",
      isDark: true,
      toggleTheme: () => {},
      setTheme: () => {},
    };
  }
  return context;
}
