/**
 * ============================================================================
 * Theme Provider Component
 * ============================================================================
 *
 * 主题切换 Provider，使用 React Context 管理亮色/暗色主题状态。
 *
 * 功能职责：
 * - 提供主题状态和切换方法
 * - 在客户端持久化主题偏好（localStorage）
 * - 在页面加载时应用保存的主题
 * - 避免闪烁（Flash of Unstyled Content）
 *
 * 使用说明：
 * - 这是一个 "use client" 组件，必须在客户端渲染
 * - 应包裹在 layout.tsx 的 body 内
 * - 支持 light/dark 两种主题切换
 *
 * @module components/ThemeProvider
 */

"use client";

import { createContext, useCallback,useContext, useEffect, useState } from "react";

/**
 * 主题类型定义
 */
type Theme = "light" | "dark";

/**
 * ThemeContext 值类型
 */
interface ThemeContextValue {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

/**
 * ThemeContext 定义
 */
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * useTheme Hook
 *
 * 在组件中调用此 hook 获取当前主题和切换方法。
 *
 * @example
 * ```tsx
 * const { theme, toggleTheme } = useTheme();
 * ```
 *
 * @throws 如果在 ThemeProvider 外部使用，会抛出错误
 */
function useTheme(): ThemeContextValue {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}

/**
 * 获取初始主题
 * 在客户端渲染时同步读取 localStorage
 */
function getInitialTheme(): Theme {
    if (typeof window === "undefined") {
        return "light";
    }
    const stored = localStorage.getItem("theme") as Theme | null;
    if (stored === "light" || stored === "dark") {
        return stored;
    }
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
}

/**
 * ============================================================================
 * ThemeProvider 组件
 * ============================================================================
 *
 * @param props.children - 子组件
 *
 * 实现细节：
 * - 主题值通过 class 应用于 <html> 元素
 * - 持久化存储在 localStorage 的 "theme" 键
 */
function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>(getInitialTheme);

    // 只在用户主动选择时落盘;首次挂载若写的是系统偏好,
    // 会把「跟随系统」固化成显式选择,之后改系统主题就不再生效
    const setTheme = useCallback((newTheme: Theme) => {
        localStorage.setItem("theme", newTheme);
        setThemeState(newTheme);
    }, []);

    const toggleTheme = useCallback(() => {
        setThemeState((prev) => {
            const next = prev === "light" ? "dark" : "light";
            localStorage.setItem("theme", next);
            return next;
        });
    }, []);

    // 只负责把当前主题应用到 <html>,不写存储
    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(theme);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export { ThemeProvider, useTheme };
