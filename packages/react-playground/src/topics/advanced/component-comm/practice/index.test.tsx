/**
 * ============================================================================
 * index.test.tsx — 组件通信工作台实战
 * ============================================================================
 *
 * - 状态过滤写入 URL,已完成只剩 Relay 工单
 * - 点另一条工单,详情标题变、查询串不变
 *
 * @module topics/advanced/component-comm/practice/index.test
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

import { ThemeProvider } from '../../../../context/ThemeProvider';
import { MOCK_USERS, UserProvider } from '../../../../context/UserProvider';
import ComponentCommPractice from './index';

function renderPractice() {
    return render(
        <ThemeProvider>
            <UserProvider>
                <MemoryRouter initialEntries={['/topics/advanced/component-comm-practice']}>
                    <ComponentCommPractice />
                </MemoryRouter>
            </UserProvider>
        </ThemeProvider>,
    );
}

describe('组件通信 · 工作台实战', () => {
    beforeEach(() => {
        localStorage.clear();
        document.documentElement.classList.remove('light', 'dark');
    });

    afterEach(() => {
        localStorage.clear();
        document.documentElement.classList.remove('light', 'dark');
    });

    it('已完成过滤写入 URL,列表只剩已完成工单', async () => {
        const user = userEvent.setup();
        renderPractice();

        expect(screen.getByRole('button', { name: /登录页暗色对比度/ })).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: '状态过滤 已完成' }));
        expect(screen.getByLabelText('工作台查询串')).toHaveTextContent('?status=done');
        expect(screen.queryByRole('button', { name: /登录页暗色对比度/ })).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Relay mock 超时提示/ })).toBeInTheDocument();
        expect(screen.getByText('Relay mock 超时提示', { selector: 'p' })).toBeInTheDocument();
    });

    it('选中另一条工单只改页面 state,不改查询串', async () => {
        const user = userEvent.setup();
        renderPractice();

        await user.click(screen.getByRole('button', { name: /购物车筛选刷新丢失/ }));
        expect(screen.getByLabelText('工作台查询串')).toHaveTextContent('(空)');
        expect(screen.getByLabelText('工作台查询串')).toHaveTextContent('selectedId=t-filter');
        expect(screen.getByText(/onlyShowInStock 现在活在内存/)).toBeInTheDocument();
        expect(screen.getByText(`只看我负责的(${MOCK_USERS[0].name})`)).toBeInTheDocument();
    });
});
