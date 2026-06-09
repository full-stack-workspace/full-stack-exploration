/**
 * ============================================================================
 * ThemeProvider — 主题 Context（演示用）
 * ============================================================================
 *
 * 简单的亮/暗主题切换 Provider，仅用于演示页面。
 * 不是 infra-fe 库的一部分。
 *
 * @module components/ThemeProvider
 */

"use client";

import { createContext, type ReactNode,useContext, useEffect, useState } from "react";

/* =================================================================
 * Types
 * ================================================================ */

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
}

/* =================================================================
 * Helper
 * ================================================================ */

function getInitialTheme(): Theme {
  if (typeof window === "undefined") {return "light";}
  const stored = localStorage.getItem("theme") as Theme | null;
  if (stored) {return stored;}
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/* =================================================================
 * Context
 * ================================================================ */

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  toggle: () => {},
});

/* =================================================================
 * Provider
 * ================================================================ */

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  // 同步 class 到 <html>（副作用）
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  function toggle() {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("theme", next);
      return next;
    });
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

/** 消费主题 Context */
export function useTheme() {
  return useContext(ThemeContext);
}
