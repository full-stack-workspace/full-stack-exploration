/**
 * ============================================================================
 * ThemeProvider — 站点主题 Context
 * ============================================================================
 *
 * 把 light/dark 作为跨树共享状态:状态与 actions 拆成两个 Context,
 * 只切换主题时,只订阅 actions 的组件不会因 theme 字符串变化而重渲染。
 *
 * 功能特点:
 * - 持久化到 localStorage(带版本前缀)
 * - 把 .light / .dark 写到 <html>,驱动 Tailwind `dark:` 变体
 * - React 19 用 use() 读取 Context
 *
 * @module context/ThemeProvider
 */

import { createContext, use, useCallback, useLayoutEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'react-playground:theme:v1';

interface ThemeActions {
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}

const ThemeStateContext = createContext<Theme | null>(null);
const ThemeActionsContext = createContext<ThemeActions | null>(null);

function isTheme(value: unknown): value is Theme {
    return value === 'light' || value === 'dark';
}

function readStoredTheme(): Theme {
    try {
        const raw = localStorage.getItem(THEME_STORAGE_KEY);
        if (!raw) {
            return 'light';
        }
        const parsed: unknown = JSON.parse(raw);
        return isTheme(parsed) ? parsed : 'light';
    } catch {
        return 'light';
    }
}

function applyThemeClass(theme: Theme): void {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
}

function persistTheme(theme: Theme): void {
    try {
        localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
    } catch {
        /* quota / private mode */
    }
}

/**
 * 读取当前主题。必须包在 ThemeProvider 内。
 */
export function useTheme(): Theme {
    const theme = use(ThemeStateContext);
    if (theme === null) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return theme;
}

/**
 * 读取主题操作。与 useTheme 拆开,避免只点切换的组件订阅 theme 本身。
 */
export function useThemeActions(): ThemeActions {
    const actions = use(ThemeActionsContext);
    if (actions === null) {
        throw new Error('useThemeActions must be used within a ThemeProvider');
    }
    return actions;
}

interface ThemeProviderProps {
    children: ReactNode;
}

/**
 * @example
 * <ThemeProvider>
 *   <App />
 * </ThemeProvider>
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
    const [theme, setThemeState] = useState<Theme>(readStoredTheme);

    useLayoutEffect(() => {
        applyThemeClass(theme);
        persistTheme(theme);
    }, [theme]);

    const setTheme = useCallback((nextTheme: Theme) => {
        setThemeState(nextTheme);
    }, []);

    const toggleTheme = useCallback(() => {
        setThemeState((current) => (current === 'light' ? 'dark' : 'light'));
    }, []);

    const actions = useMemo<ThemeActions>(
        () => ({ setTheme, toggleTheme }),
        [setTheme, toggleTheme],
    );

    return (
        <ThemeStateContext value={theme}>
            <ThemeActionsContext value={actions}>{children}</ThemeActionsContext>
        </ThemeStateContext>
    );
}
