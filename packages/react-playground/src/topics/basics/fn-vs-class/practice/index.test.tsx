/**
 * ============================================================================
 * index.test.tsx — 函数组件与类组件看板实战
 * ============================================================================
 *
 * - 函数栏过滤只留下 HOOK
 * - 点 TSLA 后报价文案带上 TSLA
 *
 * @module topics/basics/fn-vs-class/practice/index.test
 */

import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

import FnVsClassPractice from './index';

function renderPractice() {
    return render(
        <MemoryRouter>
            <FnVsClassPractice />
        </MemoryRouter>,
    );
}

describe('函数组件与类组件 · 看板实战', () => {
    it('函数栏过滤 HOOK 后不再列出 AAPL', async () => {
        const user = userEvent.setup();
        renderPractice();

        expect(screen.getByRole('button', { name: '函数 品种 AAPL' })).toBeInTheDocument();
        await user.type(screen.getByLabelText('函数 过滤代码'), 'HOOK');
        expect(screen.getByRole('button', { name: '函数 品种 HOOK' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: '函数 品种 AAPL' })).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'class 品种 AAPL' })).toBeInTheDocument();
    });

    it('点函数栏 TSLA 后报价进入 loading 再显示价格', async () => {
        const user = userEvent.setup();
        renderPractice();

        await user.click(screen.getByRole('button', { name: '函数 品种 TSLA' }));
        expect(screen.getByLabelText('函数 报价')).toHaveTextContent('正在拉 TSLA');
        await waitFor(() => {
            expect(screen.getByLabelText('函数 报价')).toHaveTextContent(/TSLA · \d/);
        });
    });
});
