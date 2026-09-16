/**
 * @file topics/advanced/context/index.test.tsx
 *
 * @description Context 专题页冒烟:机制说明与站点级 Theme/User 探针能渲染。
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

import { ThemeProvider } from '../../../context/ThemeProvider';
import { MOCK_USERS, UserProvider } from '../../../context/UserProvider';
import UseContextTopic from './index';

function renderTopic() {
    return render(
        <ThemeProvider>
            <UserProvider>
                <MemoryRouter>
                    <UseContextTopic />
                </MemoryRouter>
            </UserProvider>
        </ThemeProvider>,
    );
}

describe('Context API 专题', () => {
    beforeEach(() => {
        localStorage.clear();
        document.documentElement.classList.remove('light', 'dark');
    });

    afterEach(() => {
        localStorage.clear();
        document.documentElement.classList.remove('light', 'dark');
    });

    it('渲染核心机制标题与嵌套 Provider 演示', () => {
        renderTopic();
        expect(screen.getByRole('heading', { name: 'Context API' })).toBeInTheDocument();
        expect(screen.getByText(/外层:/)).toBeInTheDocument();
        expect(screen.getByText('包厢 A')).toBeInTheDocument();
        expect(screen.getByText('大厅')).toBeInTheDocument();
    });

    it('站点探针能切换模拟用户', async () => {
        const user = userEvent.setup();
        renderTopic();

        expect(screen.getByText(`${MOCK_USERS[0].name} (${MOCK_USERS[0].role})`)).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: `换成 ${MOCK_USERS[1].name}` }));

        expect(screen.getByText(`${MOCK_USERS[1].name} (${MOCK_USERS[1].role})`)).toBeInTheDocument();
    });
});
