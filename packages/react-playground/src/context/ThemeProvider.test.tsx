/**
 * @file ThemeProvider.test.tsx
 *
 * @description 站点主题 Context:默认值、持久化、html class、以及
 * 在 Provider 外使用时抛错。
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ThemeProvider, useTheme, useThemeActions } from './ThemeProvider';

const STORAGE_KEY = 'react-playground:theme:v1';

function ThemeLabel() {
    const theme = useTheme();
    return <span data-testid="theme">{theme}</span>;
}

function ThemeToggle() {
    const { toggleTheme, setTheme } = useThemeActions();
    return (
        <div>
            <button type="button" onClick={toggleTheme}>
                切换主题
            </button>
            <button type="button" onClick={() => setTheme('dark')}>
                设为暗色
            </button>
        </div>
    );
}

describe('ThemeProvider', () => {
    beforeEach(() => {
        localStorage.clear();
        document.documentElement.classList.remove('light', 'dark');
    });

    afterEach(() => {
        localStorage.clear();
        document.documentElement.classList.remove('light', 'dark');
    });

    it('无存储时默认为 light,并给 html 加上 light class', () => {
        render(
            <ThemeProvider>
                <ThemeLabel />
            </ThemeProvider>,
        );

        expect(screen.getByTestId('theme')).toHaveTextContent('light');
        expect(document.documentElement).toHaveClass('light');
        expect(document.documentElement).not.toHaveClass('dark');
    });

    it('已有存储时读取并应用到 html', () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify('dark'));

        render(
            <ThemeProvider>
                <ThemeLabel />
            </ThemeProvider>,
        );

        expect(screen.getByTestId('theme')).toHaveTextContent('dark');
        expect(document.documentElement).toHaveClass('dark');
    });

    it('toggleTheme 在 light/dark 间切换,并写入 localStorage', async () => {
        const user = userEvent.setup();
        render(
            <ThemeProvider>
                <ThemeLabel />
                <ThemeToggle />
            </ThemeProvider>,
        );

        await user.click(screen.getByRole('button', { name: '切换主题' }));

        expect(screen.getByTestId('theme')).toHaveTextContent('dark');
        expect(document.documentElement).toHaveClass('dark');
        expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '')).toBe('dark');

        await user.click(screen.getByRole('button', { name: '切换主题' }));

        expect(screen.getByTestId('theme')).toHaveTextContent('light');
        expect(document.documentElement).toHaveClass('light');
    });

    it('setTheme 可直接指定主题', async () => {
        const user = userEvent.setup();
        render(
            <ThemeProvider>
                <ThemeLabel />
                <ThemeToggle />
            </ThemeProvider>,
        );

        await user.click(screen.getByRole('button', { name: '设为暗色' }));

        expect(screen.getByTestId('theme')).toHaveTextContent('dark');
        expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '')).toBe('dark');
    });

    it('在 Provider 外使用 useTheme 会抛错', () => {
        expect(() => render(<ThemeLabel />)).toThrow(
            'useTheme must be used within a ThemeProvider',
        );
    });
});
