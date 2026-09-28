/**
 * ============================================================================
 * index.test.tsx — 组件通信模式演练
 * ============================================================================
 *
 * - props/callback:过滤书名
 * - 提升 state:点水果切换预览
 * - URL:tab 写入查询串
 *
 * @module topics/advanced/component-comm/playground/index.test
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

import { ThemeProvider } from '../../../../context/ThemeProvider';
import { UserProvider } from '../../../../context/UserProvider';
import ComponentCommPlayground from './index';

function renderPlayground() {
    return render(
        <ThemeProvider>
            <UserProvider>
                <MemoryRouter initialEntries={['/topics/advanced/component-comm-playground']}>
                    <ComponentCommPlayground />
                </MemoryRouter>
            </UserProvider>
        </ThemeProvider>,
    );
}

describe('组件通信 · 模式演练', () => {
    beforeEach(() => {
        localStorage.clear();
        document.documentElement.classList.remove('light', 'dark');
    });

    afterEach(() => {
        localStorage.clear();
        document.documentElement.classList.remove('light', 'dark');
    });

    it('过滤书名只保留匹配项', async () => {
        const user = userEvent.setup();
        renderPlayground();

        const books = within(screen.getByRole('list', { name: '过滤结果' }));
        expect(books.getByText('Context 深入')).toBeInTheDocument();
        await user.type(screen.getByLabelText('过滤书名'), 'Relay');
        expect(books.getByText('Relay 数据流')).toBeInTheDocument();
        expect(books.queryByText('Context 深入')).not.toBeInTheDocument();
    });

    it('点水果会切换父级 selectedId 预览', async () => {
        const user = userEvent.setup();
        renderPlayground();

        expect(screen.getByText('selectedId = apple')).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: '梨' }));
        expect(screen.getByText('selectedId = pear')).toBeInTheDocument();
        expect(screen.getByText('兄弟组件之间没有直接通道')).toBeInTheDocument();
    });

    it('切换 tab 会写入查询串', async () => {
        const user = userEvent.setup();
        renderPlayground();

        await user.click(screen.getByRole('button', { name: '查询档 进阶' }));
        expect(screen.getByLabelText('当前查询串')).toHaveTextContent('?tab=advanced');
    });
});
