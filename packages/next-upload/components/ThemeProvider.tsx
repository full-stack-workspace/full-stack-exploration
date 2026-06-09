/**
 * ============================================================================
 * ThemeProvider — next-upload
 * ============================================================================
 *
 * 与 next-demo 同款手写 Context（不引入 next-themes）。
 *
 * 职责：
 * - 管理 light/dark 主题状态
 * - 持久化到 localStorage
 * - 应用 .dark / .light class 到 <html>，触发 shadcn 与 @custom-variant dark 的变体
 *
 * @module components/ThemeProvider
 */
"use client";

import { createContext, useCallback,useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * useTheme — 在组件中读取/切换当前主题
 * @throws 在 ThemeProvider 外部使用会抛错
 */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {throw new Error("useTheme must be used within a ThemeProvider");}
  return ctx;
}

/**
 * getInitialTheme — 客户端首次渲染时同步读 localStorage / prefers-color-scheme
 */
function getInitialTheme(): Theme {
  if (typeof window === "undefined") {return "light";}
  const stored = localStorage.getItem("theme") as Theme | null;
  if (stored === "light" || stored === "dark") {return stored;}
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/**
 * ThemeProvider — 包裹整个应用
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);
  const setTheme = useCallback((t: Theme) => setThemeState(t), []);
  const toggleTheme = useCallback(() => setThemeState((p) => (p === "light" ? "dark" : "light")), []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
