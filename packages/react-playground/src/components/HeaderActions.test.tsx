/**
 * @file HeaderActions.test.tsx
 *
 * @description Header 右侧主题切换与模拟用户芯片。
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ThemeProvider } from '../context/ThemeProvider';
import { MOCK_USERS, UserProvider } from '../context/UserProvider';
import { HeaderActions } from './HeaderActions';

function renderActions() {
    return render(
        <ThemeProvider>
            <UserProvider>
                <HeaderActions />
            </UserProvider>
        </ThemeProvider>,
    );
}

describe('HeaderActions', () => {
    beforeEach(() => {
        localStorage.clear();
        document.documentElement.classList.remove('light', 'dark');
    });

    afterEach(() => {
        localStorage.clear();
        document.documentElement.classList.remove('light', 'dark');
    });

    it('右侧展示当前模拟用户的姓名', () => {
        renderActions();
        expect(screen.getByText(MOCK_USERS[0].name)).toBeInTheDocument();
        expect(screen.getByText(MOCK_USERS[0].role)).toBeInTheDocument();
    });

    it('点击主题按钮后 html 切换为 dark', async () => {
        const user = userEvent.setup();
        renderActions();

        await user.click(screen.getByRole('button', { name: '切换到暗色' }));

        expect(document.documentElement).toHaveClass('dark');
        expect(screen.getByRole('button', { name: '切换到亮色' })).toBeInTheDocument();
    });
});
