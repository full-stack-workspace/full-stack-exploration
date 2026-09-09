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

import { createContext, useCallback, useContext, useEffect, useState } from "react";

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
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}

/**
 * getInitialTheme — 客户端首次渲染时同步读 localStorage / prefers-color-scheme
 */
function getInitialTheme(): Theme {
  // 异常处理
  if (typeof window === "undefined") {
    return "light";
  }

  // 从 localStorage 获取用户已经选择的主题
  const stored = localStorage.getItem("theme") as Theme | null;
  if (stored === "light" || stored === "dark") {
    return stored;
  }

  // 最后的兜底，如果用户没有选择主题，则根据系统偏好设置
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/**
 * ThemeProvider — 包裹整个应用
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // 服务端和首次客户端渲染都使用 light，避免主题按钮发生 hydration mismatch。
  // layout 中的 beforeInteractive 脚本已经提前把正确 class 加到 <html>，所以页面不会闪烁。
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    // 下一微任务同步按钮状态，避免在 Effect 内触发同步级联渲染。
    queueMicrotask(() => setThemeState(getInitialTheme()));
  }, []);

  const applyTheme = useCallback((nextTheme: Theme) => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(nextTheme);
    localStorage.setItem("theme", nextTheme);
  }, []);

  const setTheme = useCallback(
    (nextTheme: Theme) => {
      setThemeState(nextTheme);
      applyTheme(nextTheme);
    },
    [applyTheme],
  );

  const toggleTheme = useCallback(() => {
    setThemeState((previousTheme) => {
      const nextTheme = previousTheme === "light" ? "dark" : "light";
      applyTheme(nextTheme);
      return nextTheme;
    });
  }, [applyTheme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
